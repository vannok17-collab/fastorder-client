// fastorder-client/src/components/CartModal.jsx
import { X, Trash2, ShoppingCart } from 'lucide-react'
import { APP_CONFIG } from '../config'

function CartModal({ show, panier, onClose, onRemove, onOrder }) {
  if (!show) return null

  const montantTotal = panier.reduce((sum, item) => 
    sum + (item.plats.prix * item.quantite), 0
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center"
          style={{ background: `linear-gradient(135deg, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})` }}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={28} className="text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Mon Panier</h2>
              <p className="text-white/80 text-sm">
                {panier.length} article{panier.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {panier.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">Votre panier est vide</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-3 rounded-xl font-semibold transition-all text-white"
                style={{ backgroundColor: APP_CONFIG.theme.primary }}
              >
                Parcourir le menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {panier.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl hover:shadow-md transition-all"
                >
                  {item.plats.image_url && (
                    <img 
                      src={item.plats.image_url} 
                      alt={item.plats.nom}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {item.plats.nom}
                    </h3>
                    <p className="text-gray-600">
                      {item.plats.prix.toLocaleString()} {APP_CONFIG.options.deviseMonnaie} × {item.quantite}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-xl" style={{ color: APP_CONFIG.theme.primary }}>
                      {(item.plats.prix * item.quantite).toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                    </p>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="mt-2 text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {panier.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-800">Total</span>
              <span className="text-3xl font-bold" style={{ color: APP_CONFIG.theme.primary }}>
                {montantTotal.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Continuer mes achats
              </button>
              <button
                onClick={onOrder}
                className="flex-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl text-white"
                style={{ backgroundColor: APP_CONFIG.theme.success, flex: 2 }}
              >
                Passer la commande →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal