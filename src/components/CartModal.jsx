import { X, Trash2, ShoppingBag } from 'lucide-react'

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
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <ShoppingBag size={24} />
            <span>Mon Panier</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-600 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-4">
          {panier.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag size={64} className="mb-4 text-gray-300" />
              <p className="text-lg">Votre panier est vide</p>
              <p className="text-sm mt-2">Ajoutez des plats pour commander</p>
            </div>
          ) : (
            <div className="space-y-4">
              {panier.map(item => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4"
                >
                  {/* Image */}
                  {item.plats.image_url && (
                    <img
                      src={item.plats.image_url}
                      alt={item.plats.nom}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80?text=Plat'
                      }}
                    />
                  )}

                  {/* Détails */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {item.plats.nom}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.plats.prix.toLocaleString()} FCFA × {item.quantite}
                    </p>
                    <p className="text-orange-500 font-bold mt-2">
                      {(item.plats.prix * item.quantite).toLocaleString()} FCFA
                    </p>
                  </div>

                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => handleRemove(item.id, item.plats.nom)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {panier.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-800">Total</span>
              <span className="text-orange-500">
                {montantTotal.toLocaleString()} FCFA
              </span>
            </div>

            {/* Bouton Commander */}
            <button
              onClick={onOrder}
              className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition font-bold text-lg shadow-lg"
            >
              Commander
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartModal