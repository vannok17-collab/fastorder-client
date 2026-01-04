// fastorder-client/src/components/OrderTracker.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { APP_CONFIG } from '../config'
import { Clock, Package, CheckCircle } from 'lucide-react'

function OrderTracker({ userId }) {
  const [derniereCommande, setDerniereCommande] = useState(null)
  const [showNotif, setShowNotif] = useState(false)
  const notifTimeoutRef = useRef(null)

  // Mémoriser fetchDerniereCommande avec useCallback
  const fetchDerniereCommande = useCallback(async () => {
    if (!userId) return
    
    try {
      const { data } = await supabase
        .from('commandes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setDerniereCommande(data)
      }
    } catch (err) {
      // Pas de commande encore
      console.log('Aucune commande trouvée', err.message)
    }
  }, [userId])

  // Fonction pour gérer la mise à jour de la commande
  const handleCommandeUpdate = useCallback((newCommande) => {
    console.log('🔔 Commande mise à jour:', newCommande)
    
    // Utiliser queueMicrotask pour sortir du contexte de l'effet
    queueMicrotask(() => {
      setDerniereCommande(newCommande)
      setShowNotif(true)
      
      // Annuler le timeout précédent s'il existe
      if (notifTimeoutRef.current) {
        clearTimeout(notifTimeoutRef.current)
      }
      
      // Masquer la notification après 5 secondes
      notifTimeoutRef.current = setTimeout(() => {
        setShowNotif(false)
      }, 5000)
    })
  }, [])

useEffect(() => {
  if (!userId) return

  // Appeler fetchDerniereCommande dans une fonction async locale
  const loadCommande = async () => {
    await fetchDerniereCommande()
  }
  loadCommande()

  // S'abonner aux changements en temps réel
  const channel = supabase
    .channel('commandes_realtime')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'commandes',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      handleCommandeUpdate(payload.new)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
    if (notifTimeoutRef.current) {
      clearTimeout(notifTimeoutRef.current)
    }
  }
}, [userId, fetchDerniereCommande, handleCommandeUpdate])

  const getStatutInfo = (statut) => {
    switch (statut) {
      case 'En attente':
        return {
          icon: <Clock size={24} />,
          color: APP_CONFIG.theme.warning,
          bg: `${APP_CONFIG.theme.warning}20`,
          text: 'Votre commande est en attente',
          description: 'Nous préparons votre commande'
        }
      case 'En préparation':
        return {
          icon: <Package size={24} />,
          color: APP_CONFIG.theme.info,
          bg: `${APP_CONFIG.theme.info}20`,
          text: 'Votre commande est en préparation',
          description: 'Le chef est à l\'œuvre !'
        }
      case 'Terminée':
        return {
          icon: <CheckCircle size={24} />,
          color: APP_CONFIG.theme.success,
          bg: `${APP_CONFIG.theme.success}20`,
          text: 'Votre commande est prête !',
          description: 'Bon appétit !'
        }
      default:
        return null
    }
  }

  const statutInfo = derniereCommande ? getStatutInfo(derniereCommande.statut) : null
  if (!derniereCommande || !statutInfo || derniereCommande.statut === 'Terminée') return null

  return (
    <>
      {/* Notification flottante (popup) */}
      {showNotif && (
        <div className="fixed top-24 left-4 right-4 md:left-auto md:right-4 z-50 max-w-md animate-fade-in"
          style={{
            backgroundColor: 'white',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="p-4 rounded-lg border-l-4"
            style={{ borderColor: statutInfo.color }}
          >
            <div className="flex items-start gap-3">
              <div style={{ color: statutInfo.color }}>
                {statutInfo.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{statutInfo.text}</p>
                <p className="text-sm text-gray-600 mt-1">{statutInfo.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Table {derniereCommande.numero_table} • {derniereCommande.montant_total.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de statut fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-30 shadow-2xl"
        style={{ backgroundColor: 'white', borderTop: `3px solid ${statutInfo.color}` }}
      >
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-2 rounded-full"
              style={{ backgroundColor: statutInfo.bg, color: statutInfo.color }}
            >
              {statutInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate">{statutInfo.text}</p>
              <p className="text-sm text-gray-600">{statutInfo.description}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500">Table {derniereCommande.numero_table}</p>
              <p className="font-bold"
                style={{ color: statutInfo.color }}
              >
                {derniereCommande.montant_total.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderTracker