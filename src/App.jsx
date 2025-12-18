/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { APP_CONFIG } from './config' 
import { supabase } from './supabaseClient'
import { ShoppingCart } from 'lucide-react'
import MenuDisplay from './components/MenuDisplay'
import CartModal from './components/CartModal'
import './App.css'

function App() {
  const [plats, setPlats] = useState([])
  const [panier, setPanier] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [message, setMessage] = useState(null)
  const [userId, setUserId] = useState('')
  const [numeroTable, setNumeroTable] = useState(null)

  // Générer ou récupérer l'UUID utilisateur
  useEffect(() => {
    // Récupérer les paramètres URL
    const params = new URLSearchParams(window.location.search)
    const tableParam = params.get('table')
    const userParam = params.get('uuid')

    if (tableParam) {
      setNumeroTable(parseInt(tableParam))
    }

    // Générer ou récupérer UUID
    let id = userParam || localStorage.getItem('fastorder_user_id')
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
      localStorage.setItem('fastorder_user_id', id)
    }
    setUserId(id)
  }, [])

  // Charger le menu
  useEffect(() => {
    fetchMenu()
  }, [])

  // Charger le panier
  useEffect(() => {
    if (userId) {
      fetchPanier()
    }
  }, [userId])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('plats')
        .select('*')
        .eq('disponible', true)
        .order('categorie')

      if (error) throw error
      setPlats(data || [])
    } catch (error) {
      console.error('Erreur chargement menu:', error)
      showMessage('Erreur de chargement du menu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchPanier = async () => {
    try {
      const { data, error } = await supabase
        .from('panier_items')
        .select(`
          *,
          plats (*)
        `)
        .eq('user_id', userId)

      if (error) throw error
      setPanier(data || [])
    } catch (error) {
      console.error('Erreur chargement panier:', error)
    }
  }

  const addToCart = async (plat, quantite = 1) => {
    try {
      // Vérifier si le plat est déjà dans le panier
      const { data: existing } = await supabase
        .from('panier_items')
        .select('*')
        .eq('user_id', userId)
        .eq('plat_id', plat.id)
        .single()

      if (existing) {
        // Mettre à jour la quantité
        const { error } = await supabase
          .from('panier_items')
          .update({ quantite: existing.quantite + quantite })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Ajouter au panier
        const { error } = await supabase
          .from('panier_items')
          .insert({
            user_id: userId,
            plat_id: plat.id,
            quantite: quantite
          })

        if (error) throw error
      }

      await fetchPanier()
      showMessage(`${plat.nom} ajouté au panier !`, 'success')
    } catch (error) {
      console.error('Erreur ajout panier:', error)
      showMessage('Erreur lors de l\'ajout au panier', 'error')
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const { error } = await supabase
        .from('panier_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      await fetchPanier()
      showMessage('Article retiré du panier', 'success')
    } catch (error) {
      console.error('Erreur suppression:', error)
      showMessage('Erreur lors de la suppression', 'error')
    }
  }

  const passerCommande = async () => {
    if (panier.length === 0) return

    if (!numeroTable) {
      showMessage('Numéro de table manquant. Scannez le QR Code de votre table.', 'error')
      return
    }

    try {
      // Calculer le montant total
      const montantTotal = panier.reduce((sum, item) => 
        sum + (item.plats.prix * item.quantite), 0
      )

      // Créer la commande
      const { data: commande, error: commandeError } = await supabase
        .from('commandes')
        .insert({
          user_id: userId,
          numero_table: numeroTable,
          montant_total: montantTotal,
          statut: 'En attente'
        })
        .select()
        .single()

      if (commandeError) throw commandeError

      // Ajouter les items de la commande
      const commandeItems = panier.map(item => ({
        commande_id: commande.id,
        plat_id: item.plat_id,
        quantite: item.quantite,
        prix_unitaire: item.plats.prix
      }))

      const { error: itemsError } = await supabase
        .from('commandes_items')
        .insert(commandeItems)

      if (itemsError) throw itemsError

      // Vider le panier
      const { error: deleteError } = await supabase
        .from('panier_items')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      await fetchPanier()
      setShowCart(false)
      showMessage('Commande passée avec succès ! Table ' + numeroTable, 'success')
    } catch (error) {
      console.error('Erreur commande:', error)
      showMessage('Erreur lors de la commande', 'error')
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const cartCount = panier.reduce((sum, item) => sum + item.quantite, 0)

  return (
    <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white shadow-sm sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center"/>
      <div className="flex items-center gap-3">
        {/* Logo */}
        {APP_CONFIG.restaurant.logo && (
          <img 
            src={APP_CONFIG.restaurant.logo} 
            alt={APP_CONFIG.restaurant.nom}
            className="w-10 h-10 rounded-full object-cover shadow-md"
          />
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {APP_CONFIG.restaurant.nom}
        </h1>
            {numeroTable && (
              <p className="text-sm text-gray-600">Table {numeroTable}</p>
            )}
          </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-white rounded-full transition shadow-lg hover:shadow-xl"
              style={{   
             backgroundColor: APP_CONFIG.theme.primary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = APP_CONFIG.theme.secondary}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = APP_CONFIG.theme.primary}
            >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Message de notification */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fade-in`}>
          {message.text}
        </div>
      )}

      {/* Menu */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <MenuDisplay 
          plats={plats} 
          loading={loading} 
          onAddToCart={addToCart}
        />
      </main>

      {/* Modal Panier */}
      <CartModal
        show={showCart}
        panier={panier}
        onClose={() => setShowCart(false)}
        onRemove={removeFromCart}
        onOrder={passerCommande}
      />
    </div>
  )
}

export default App