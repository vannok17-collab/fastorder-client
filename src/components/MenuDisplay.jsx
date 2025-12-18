import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { APP_CONFIG } from '../config'

function MenuDisplay({ plats, loading, onAddToCart }) {
  const [quantities, setQuantities] = useState({})

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        <p className="ml-4 text-gray-600 text-lg">Chargement du menu...</p>
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
    setQuantities(prev => ({
      ...prev,
      [plat.id]: 1
    }))
  }

  return (
    <div className="space-y-12">
      {Object.entries(categories).map(([categorie, platsCategorie]) => (
        <div key={categorie} className="animate-fade-in">
          {/* Titre de catégorie amélioré */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 to-transparent"></div>
            <h2 className="text-3xl font-bold text-gray-800 mx-4 px-6 py-2 bg-orange-50 rounded-full">
              {categorie}
            </h2>
            <div className="flex-1 h-1 bg-gradient-to-l from-orange-500 to-transparent"></div>
          </div>

          {/* Grille de plats améliorée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {platsCategorie.map(plat => (
              <div
                key={plat.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                {/* Image avec overlay au survol */}
                <div className="relative h-52 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden group">
                  {plat.image_url ? (
                    <img
                      src={plat.image_url}
                      alt={plat.nom}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                  
                  {/* Badge "Disponible" */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Disponible
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {plat.nom}
                  </h3>

                  {plat.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                      {plat.description}
                    </p>
                  )}

                  {/* Prix stylisé */}
                  <div className="mb-4">
                    <span className="inline-block text-2xl font-bold px-4 py-2 rounded-xl"
                      style={{ 
                      color: APP_CONFIG.theme.primary,
                      backgroundColor: `${APP_CONFIG.theme.primary}15`
                      }}
                    >
                    {plat.prix.toLocaleString()} 
                    <span className="text-sm ml-1">{APP_CONFIG.options.deviseMonnaie}</span>
                    </span>
                  </div>

                  {/* Sélecteur de quantité amélioré */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
                      <button
                        onClick={() => handleQuantityChange(plat.id, -1)}
                        className="p-2 hover:bg-white rounded-lg transition disabled:opacity-50"
                        disabled={(quantities[plat.id] || 1) <= 1}
                      >
                        <Minus size={18} className="text-gray-700" />
                      </button>
                      <span className="px-4 font-bold text-gray-800 min-w-[40px] text-center">
                        {quantities[plat.id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(plat.id, 1)}
                        className="p-2 hover:bg-white rounded-lg transition"
                      >
                        <Plus size={18} className="text-gray-700" />
                      </button>
                    </div>

                    {/* Bouton Ajouter amélioré */}
                    <button
                      onClick={() => handleAddToCart(plat)}
                      className="flex-1 text-white px-4 py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      style={{ 
                    background: `linear-gradient(to right, ${APP_CONFIG.theme.primary}, ${APP_CONFIG.theme.secondary})`
                    }}
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