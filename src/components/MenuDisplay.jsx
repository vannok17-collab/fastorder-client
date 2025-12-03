import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

function MenuDisplay({ plats, loading, onAddToCart }) {
  const [quantities, setQuantities] = useState({})

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="ml-4 text-gray-600">Chargement du menu...</p>
      </div>
    )
  }

  if (plats.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg">Aucun plat disponible pour le moment</p>
      </div>
    )
  }

  // Grouper par catégorie
  const categories = plats.reduce((acc, plat) => {
    if (!acc[plat.categorie]) {
      acc[plat.categorie] = []
    }
    acc[plat.categorie].push(plat)
    return acc
  }, {})

  const handleQuantityChange = (platId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [platId]: Math.max(1, (prev[platId] || 1) + delta)
    }))
  }

  const handleAddToCart = (plat) => {
    const quantity = quantities[plat.id] || 1
    onAddToCart(plat, quantity)
    // Réinitialiser la quantité après ajout
    setQuantities(prev => ({
      ...prev,
      [plat.id]: 1
    }))
  }

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([categorie, platsCategorie]) => (
        <div key={categorie}>
          {/* Titre de catégorie */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-500">
            {categorie}
          </h2>

          {/* Grille de plats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platsCategorie.map(plat => (
              <div
                key={plat.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                {plat.image_url && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={plat.image_url}
                      alt={plat.nom}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Non+Disponible'
                      }}
                    />
                  </div>
                )}

                {/* Contenu */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {plat.nom}
                  </h3>

                  {plat.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {plat.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    {/* Prix */}
                    <span className="text-2xl font-bold text-orange-500">
                      {plat.prix.toLocaleString()} FCFA
                    </span>
                  </div>

                  {/* Sélecteur de quantité */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(plat.id, -1)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                        disabled={(quantities[plat.id] || 1) <= 1}
                      >
                        <Minus size={20} className="text-gray-600" />
                      </button>
                      <span className="px-4 font-semibold text-gray-800">
                        {quantities[plat.id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(plat.id, 1)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        <Plus size={20} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Bouton Ajouter */}
                    <button
                      onClick={() => handleAddToCart(plat)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MenuDisplay