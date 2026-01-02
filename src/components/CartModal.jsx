import { X, Trash2, ShoppingBag } from 'lucide-react'
import { APP_CONFIG } from '../config'

function CartModal({ show, panier, onClose, onRemove, onOrder }) {
  if (!show) return null

  const montantTotal = panier.reduce(
    (sum, item) => sum + (item.plats.prix * item.quantite),
    0
  )

  const handleRemove = (itemId, platNom) => {
    if (window.confirm(`Retirer ${platNom} du panier ?`)) {
      onRemove(itemId)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="text-white p-6 flex justify-between items-center shadow-lg"
          style={{ background: `linear-gradient(to right, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.primaryHover})` }}
        >
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ShoppingBag size={28} />
              <span>Mon Panier</span>
            </h2>
            <p className="text-sm mt-1 opacity-90">
              {panier.length} article{panier.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <X size={28} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {panier.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="bg-gray-100 p-8 rounded-full mb-6">
                <ShoppingBag size={80} className="text-gray-300" />
              </div>
              <p className="text-xl font-semibold mb-2">Votre panier est vide</p>
              <p className="text-sm text-gray-400">Ajoutez des plats pour commander</p>
            </div>
          ) : (
            <div className="space-y-4">
              {panier.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  {item.plats.image_url && (
                    <img
                      src={item.plats.image_url}
                      alt={item.plats.nom}
                      className="w-24 h-24 object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                      }}
                    />
                  )}

                  {/* Détails */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {item.plats.nom}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="bg-gray-100 px-2 py-1 rounded-lg">
                        {item.plats.prix.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                      </span>
                      <span>×</span>
                      <span className="font-semibold px-2 py-1 rounded-lg"
                        style={{ 
                          backgroundColor: `${APP_CONFIG.theme.primary}20`,
                          color: APP_CONFIG.theme.primary
                        }}
                      >
                        {item.quantite}
                      </span>
                    </div>
                    <p className="font-bold text-lg"
                      style={{ color: APP_CONFIG.theme.primary }}
                    >
                      {(item.plats.prix * item.quantite).toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                    </p>
                  </div>

                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => handleRemove(item.id, item.plats.nom)}
                    className="p-3 rounded-xl transition-all hover:scale-110"
                    style={{ 
                      color: APP_CONFIG.theme.danger,
                      backgroundColor: `${APP_CONFIG.theme.danger}10`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${APP_CONFIG.theme.danger}20`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${APP_CONFIG.theme.danger}10`}
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {panier.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-6 space-y-4 shadow-lg">
            {/* Total */}
            <div className="p-4 rounded-xl"
              style={{ 
                background: `linear-gradient(to right, ${APP_CONFIG.theme.primary}15, ${APP_CONFIG.theme.primary}25)`
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-lg">Total</span>
                <span className="text-3xl font-bold"
                  style={{ color: APP_CONFIG.theme.primary }}
                >
                  {montantTotal.toLocaleString()} <span className="text-xl">{APP_CONFIG.options.deviseMonnaie}</span>
                </span>
              </div>
            </div>
            
            {/* Bouton Commander */}
            <button
              onClick={onOrder}
              className="w-full text-white py-4 rounded-xl transition-all font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(to right, ${APP_CONFIG.theme.success}, ${APP_CONFIG.theme.successHover})` }}
            >
              Commander Maintenant
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartModal