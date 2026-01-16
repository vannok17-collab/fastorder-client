// fastorder-client/src/components/CheckoutModal.jsx
import { useState } from 'react'
import { X, Mail, Phone, CreditCard, Banknote } from 'lucide-react'
import { APP_CONFIG } from '../config'

function CheckoutModal({ panier, numeroTable, onClose, onConfirm }) {
  const [step, setStep] = useState(1) // 1: Contact, 2: Paiement, 3: Confirmation
  const [contact, setContact] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [loading, setLoading] = useState(false)

  const paymentMethods = [
    { id: 'wave', name: 'Wave', icon: '📱', color: '#00D9B1', description: 'Paiement mobile Wave' },
    { id: 'orange_money', name: 'Orange Money', icon: '🟠', color: '#FF6600', description: 'Orange Money' },
    { id: 'mtn_momo', name: 'MTN Mobile Money', icon: '💛', color: '#FFCC00', description: 'MTN MoMo' },
    { id: 'moov_money', name: 'Moov Money', icon: '🔵', color: '#0066CC', description: 'Moov Money' },
    { id: 'carte', name: 'Carte Bancaire', icon: '💳', color: '#4A5568', description: 'Visa, Mastercard' },
    { id: 'especes', name: 'Espèces', icon: '💵', color: '#10b981', description: 'Payer en espèces' }
  ]

  const montantTotal = panier.reduce((sum, item) => sum + (item.plats.prix * item.quantite), 0)

  const validateContact = () => {
    if (!contact.trim()) {
      alert('❌ Veuillez entrer votre email ou téléphone')
      return false
    }

    // Vérifier si c'est un email ou un téléphone
    const isEmail = contact.includes('@')
    const isPhone = /^[0-9\s+()-]{8,}$/.test(contact)

    if (!isEmail && !isPhone) {
      alert('❌ Format invalide. Entrez un email (ex: nom@email.com) ou un téléphone (ex: 0712345678)')
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (validateContact()) {
        setStep(2)
      }
    }
  }

  const handleConfirmOrder = async () => {
    if (!selectedPayment) {
      alert('❌ Veuillez sélectionner un mode de paiement')
      return
    }

    setLoading(true)

    try {
      // Simuler l'initiation du paiement pour les modes électroniques
      if (['wave', 'orange_money', 'mtn_momo', 'moov_money', 'carte'].includes(selectedPayment.id)) {
        // TODO: Intégrer l'API de paiement ici
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('💳 Paiement initié:', {
          method: selectedPayment.name,
          contact: contact,
          amount: montantTotal
        })
      }

      // Passer la commande avec les informations
      await onConfirm({
        contact: contact,
        mode_paiement: selectedPayment.id
      })

      setStep(3)

      // Fermer après 2 secondes
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (!panier || panier.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center"
          style={{ background: `linear-gradient(135deg, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})` }}
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {step === 1 && '📋 Vos coordonnées'}
              {step === 2 && '💳 Mode de paiement'}
              {step === 3 && '✅ Commande confirmée'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Table {numeroTable} • {montantTotal.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Étape 1 : Contact */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 font-semibold flex items-center gap-2">
                  <Mail size={20} />
                  Pour recevoir votre facture et suivre votre commande
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email ou Téléphone *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="exemple@email.com ou 0712345678"
                    className="w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-lg"
                    style={{ borderColor: APP_CONFIG.theme.primary }}
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {contact.includes('@') ? <Mail size={20} /> : <Phone size={20} />}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Entrez votre email ou votre numéro de téléphone
                </p>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl text-white"
                style={{ backgroundColor: APP_CONFIG.theme.primary }}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Étape 2 : Paiement */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Contact :</span>
                  <span className="font-bold">{contact}</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  ← Modifier
                </button>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  Choisissez votre mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedPayment?.id === method.id ? 'ring-4 shadow-lg' : 'hover:shadow-md'
                      }`}
                      style={{
                        borderColor: selectedPayment?.id === method.id ? method.color : '#e5e7eb',
                        backgroundColor: selectedPayment?.id === method.id ? `${method.color}15` : 'white',
                        ringColor: `${method.color}40`
                      }}
                    >
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <div className="font-bold text-sm mb-1">{method.name}</div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPayment && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800 mb-2">
                    📝 Récapitulatif
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode de paiement :</span>
                      <span className="font-bold">{selectedPayment.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant :</span>
                      <span className="font-bold text-lg" style={{ color: APP_CONFIG.theme.primary }}>
                        {montantTotal.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  disabled={loading}
                >
                  ← Retour
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading || !selectedPayment}
                  className="flex-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: APP_CONFIG.theme.success, flex: 2 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Traitement...
                    </div>
                  ) : (
                    `✓ Confirmer la commande`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Confirmation */}
          {step === 3 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce"
                style={{ backgroundColor: `${APP_CONFIG.theme.success}20` }}
              >
                <span className="text-5xl">✅</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Commande confirmée !
              </h3>
              <p className="text-gray-600 text-lg mb-2">
                Votre commande a été envoyée avec succès
              </p>
              <p className="text-gray-500">
                Vous recevrez la facture par {contact.includes('@') ? 'email' : 'SMS'}
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-blue-800 font-semibold">
                  📱 Suivez l'état de votre commande en bas de l'écran
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal