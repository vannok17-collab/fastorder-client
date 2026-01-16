/* eslint-disable react-hooks/exhaustive-deps */
// fastorder-client/src/App.jsx
import { useState, useEffect } from 'react'
import { APP_CONFIG } from './config' 
import { useTheme } from './hooks/useTheme'
import { supabase } from './supabaseClient'
import { ShoppingCart } from 'lucide-react'
import MenuDisplay from './components/MenuDisplay'
import CartModal from './components/CartModal'
import CheckoutModal from './components/CheckoutModal'
import OrderTracker from './components/OrderTracker'
import InvoiceView from './components/InvoiceView'
import './App.css'

function App() {
  const [plats, setPlats] = useState([])
  const [panier, setPanier] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [message, setMessage] = useState(null)
  const [userId, setUserId] = useState('')
  const [numeroTable, setNumeroTable] = useState(null)
  const [activeTab, setActiveTab] = useState('menu') // 'menu' ou 'factures'
  
  const { theme, loading: themeLoading, ready: themeReady } = useTheme()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tableParam = params.get('table')
    const userParam = params.get('uuid')

    if (tableParam) {
      setNumeroTable(parseInt(tableParam))
    }

    let id = userParam || localStorage.getItem('fastorder_user_id')
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
      localStorage.setItem('fastorder_user_id', id)
    }
    setUserId(id)
  }, [])

  useEffect(() => {
    if (themeReady) {
      fetchMenu()
    }
  }, [themeReady])

  useEffect(() => {
    if (userId && themeReady) {
      fetchPanier()
    }
  }, [userId, themeReady])

  // ✨ Realtime pour le menu
  useEffect(() => {
    if (!themeReady) return

    const menuChannel = supabase
      .channel('plats_realtime_client')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plats'
      }, () => {
        console.log('🔄 Menu mis à jour')
        fetchMenu()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(menuChannel)
    }
  }, [themeReady])

  // ✨ Realtime pour le panier
  useEffect(() => {
    if (!userId || !themeReady) return

    const panierChannel = supabase
      .channel('panier_realtime_client')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'panier_items',
        filter: `user_id=eq.${userId}`
      }, () => {
        console.log('🔄 Panier mis à jour')
        fetchPanier()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(panierChannel)
    }
  }, [userId, themeReady])

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
      const { data: existing } = await supabase
        .from('panier_items')
        .select('*')
        .eq('user_id', userId)
        .eq('plat_id', plat.id)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('panier_items')
          .update({ quantite: existing.quantite + quantite })
          .eq('id', existing.id)

        if (error) throw error
      } else {
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
      showMessage(`${plat.nom} ajouté au panier`, 'success')
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

  const handleCheckout = () => {
    if (panier.length === 0) return

    if (!numeroTable) {
      showMessage('Numéro de table manquant. Scannez le QR Code de votre table.', 'error')
      return
    }

    setShowCart(false)
    setShowCheckout(true)
  }

  const passerCommande = async ({ contact, mode_paiement }) => {
    try {
      const montantTotal = panier.reduce((sum, item) => 
        sum + (item.plats.prix * item.quantite), 0
      )

      const { data: commande, error: commandeError } = await supabase
        .from('commandes')
        .insert({
          user_id: userId,
          numero_table: numeroTable,
          montant_total: montantTotal,
          statut: 'En attente',
          contact: contact,
          mode_paiement: mode_paiement
        })
        .select()
        .single()

      if (commandeError) throw commandeError

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

      const { error: deleteError } = await supabase
        .from('panier_items')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      await fetchPanier()
      showMessage(`Commande passée avec succès !`, 'success')
    } catch (error) {
      console.error('Erreur commande:', error)
      showMessage('Erreur lors de la commande', 'error')
      throw error
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const cartCount = panier.reduce((sum, item) => sum + item.quantite, 0)

  if (themeLoading || !themeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-orange-500 mx-auto"></div>
            {APP_CONFIG.restaurant.logo && (
              <img 
                src={APP_CONFIG.restaurant.logo} 
                alt={APP_CONFIG.restaurant.nom}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full object-cover"
              />
            )}
          </div>
          <p className="text-gray-700 font-bold text-lg mb-2">
            {APP_CONFIG.restaurant.nom}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm sticky top-0 z-40 transition-colors"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4 mb-3">
            <div className="flex items-center gap-3 flex-1">
              {APP_CONFIG.restaurant.logo && (
                <img 
                  src={APP_CONFIG.restaurant.logo} 
                  alt={APP_CONFIG.restaurant.nom}
                  className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-white"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: theme.text.light }}>
                  {APP_CONFIG.restaurant.nom}
                </h1>
                {numeroTable && (
                  <p className="text-sm opacity-90" style={{ color: theme.text.light }}>
                    Table {numeroTable}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-110"
              style={{ backgroundColor: theme.accent }}
            >
              <ShoppingCart size={24} style={{ color: theme.text.primary }} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: theme.danger }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'menu' ? 'bg-white shadow-lg' : 'bg-white/20 hover:bg-white/30'
              }`}
              style={{ color: activeTab === 'menu' ? theme.primary : theme.text.light }}
            >
              🍽️ Menu
            </button>
            <button
              onClick={() => setActiveTab('factures')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'factures' ? 'bg-white shadow-lg' : 'bg-white/20 hover:bg-white/30'
              }`}
              style={{ color: activeTab === 'factures' ? theme.primary : theme.text.light }}
            >
              📄 Factures
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {message && (
        <div className={`fixed top-20 right-4 left-4 md:left-auto md:right-4 z-50 px-6 py-4 rounded-xl shadow-2xl animate-fade-in text-white font-semibold text-center md:text-left max-w-md`}
          style={{
            backgroundColor: message.type === 'success' ? theme.success : theme.danger,
            borderWidth: '2px',
            borderColor: message.type === 'success' ? theme.successHover : theme.dangerHover
          }}
        >
          {message.text}
        </div>
      )}

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {activeTab === 'menu' ? (
          <>
            {/* Message de bienvenue */}
            <div className="mb-8 bg-gradient-to-r rounded-3xl shadow-xl p-8 border-l-8 transform hover:scale-[1.02] transition-all"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primaryBg} 0%, white 100%)`,
                borderColor: theme.primary
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  👋
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
                    Bienvenue chez {APP_CONFIG.restaurant.nom} !
                  </h2>
                  <p className="text-xl text-gray-700 font-semibold">
                    {APP_CONFIG.restaurant.slogan}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 text-lg">
                📱 Commandez directement depuis votre table {numeroTable && `n°${numeroTable}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: `${theme.success}20`, color: theme.success }}
                >
                  ✓ Menu en temps réel
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: `${theme.info}20`, color: theme.info }}
                >
                  ✓ Commande rapide
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: `${theme.accent}20`, color: theme.primary }}
                >
                  ✓ Paiement mobile
                </span>
              </div>
            </div>

            <MenuDisplay plats={plats} loading={loading} onAddToCart={addToCart} />
          </>
        ) : (
          <InvoiceView userId={userId} />
        )}
      </main>

      {/* Modal Panier */}
      <CartModal
        show={showCart}
        panier={panier}
        onClose={() => setShowCart(false)}
        onRemove={removeFromCart}
        onOrder={handleCheckout}
      />

      {/* Modal Checkout */}
      {showCheckout && (
        <CheckoutModal
          panier={panier}
          numeroTable={numeroTable}
          onClose={() => setShowCheckout(false)}
          onConfirm={passerCommande}
        />
      )}

      {/* Tracker de commande en temps réel */}
      <OrderTracker userId={userId} />
    </div>
  )
}

export default App