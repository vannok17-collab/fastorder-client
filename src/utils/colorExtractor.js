// fastorder-client/src/utils/colorExtractor.js
// fastorder-manager/src/utils/colorExtractor.js (même fichier pour les deux)

/**
 * Extrait les couleurs dominantes d'une image
 * @param {string} imageUrl - URL de l'image
 * @returns {Promise<Object>} - Objet contenant les couleurs du thème
 */
export const extractColorsFromLogo = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    img.onload = () => {
      try {
        // Créer un canvas pour analyser l'image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Redimensionner pour optimiser la performance
        const maxSize = 200
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Obtenir les données de pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        
        // Extraire les couleurs
        const colors = []
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const a = pixels[i + 3]
          
          // Ignorer les pixels transparents et trop clairs/foncés
          if (a > 128 && !(r > 240 && g > 240 && b > 240) && !(r < 20 && g < 20 && b < 20)) {
            colors.push({ r, g, b })
          }
        }
        
        // Trouver les couleurs dominantes par clustering
        const dominantColors = findDominantColors(colors, 5)
        
        // Trier par saturation pour obtenir les couleurs les plus vives
        const sortedColors = dominantColors.sort((a, b) => {
          const satA = getSaturation(a.r, a.g, a.b)
          const satB = getSaturation(b.r, b.g, b.b)
          return satB - satA
        })
        
        // Identifier les couleurs principales
        const primary = sortedColors[0] // Couleur la plus saturée
        const secondary = sortedColors[1] || primary
        const accent = sortedColors[2] || primary
        
        // Créer le thème complet
        const theme = {
          primary: rgbToHex(primary.r, primary.g, primary.b),
          primaryHover: darkenColor(primary.r, primary.g, primary.b, 0.15),
          primaryLight: lightenColor(primary.r, primary.g, primary.b, 0.2),
          primaryBg: lightenColor(primary.r, primary.g, primary.b, 0.9),
          
          secondary: rgbToHex(secondary.r, secondary.g, secondary.b),
          accent: rgbToHex(accent.r, accent.g, accent.b),
          
          success: "#10b981",
          successHover: "#059669",
          warning: "#f59e0b",
          info: "#3b82f6",
          danger: "#ef4444",
          dangerHover: "#dc2626",
          
          text: {
            primary: "#111827",
            secondary: "#6b7280",
            light: "#ffffff"
          },
          
          background: {
            primary: "#ffffff",
            secondary: "#f9fafb",
          }
        }
        
        resolve(theme)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'))
    }
    
    // Ajouter timestamp pour éviter le cache
    img.src = imageUrl + '?t=' + Date.now()
  })
}

/**
 * Trouve les couleurs dominantes par clustering simple
 */
function findDominantColors(colors, numColors) {
  if (colors.length === 0) {
    return [{ r: 255, g: 128, b: 0 }] // Couleur par défaut orange
  }
  
  // Initialiser les clusters avec des couleurs aléatoires
  const clusters = []
  const step = Math.floor(colors.length / numColors)
  
  for (let i = 0; i < numColors && i * step < colors.length; i++) {
    clusters.push({ ...colors[i * step], count: 0 })
  }
  
  // Assigner chaque couleur au cluster le plus proche
  const clusterAssignments = new Array(clusters.length).fill(0).map(() => [])
  
  colors.forEach(color => {
    let minDist = Infinity
    let closestCluster = 0
    
    clusters.forEach((cluster, idx) => {
      const dist = colorDistance(color, cluster)
      if (dist < minDist) {
        minDist = dist
        closestCluster = idx
      }
    })
    
    clusterAssignments[closestCluster].push(color)
  })
  
  // Calculer la moyenne de chaque cluster
  return clusterAssignments
    .filter(cluster => cluster.length > 0)
    .map(cluster => {
      const sum = cluster.reduce((acc, c) => ({
        r: acc.r + c.r,
        g: acc.g + c.g,
        b: acc.b + c.b
      }), { r: 0, g: 0, b: 0 })
      
      return {
        r: Math.round(sum.r / cluster.length),
        g: Math.round(sum.g / cluster.length),
        b: Math.round(sum.b / cluster.length)
      }
    })
}

/**
 * Calcule la distance entre deux couleurs
 */
function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  )
}

/**
 * Calcule la saturation d'une couleur
 */
function getSaturation(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  
  if (max === 0) return 0
  return delta / max
}

/**
 * Convertit RGB en HEX
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')
}

/**
 * Assombrit une couleur
 */
function darkenColor(r, g, b, factor) {
  const newR = Math.max(0, Math.round(r * (1 - factor)))
  const newG = Math.max(0, Math.round(g * (1 - factor)))
  const newB = Math.max(0, Math.round(b * (1 - factor)))
  return rgbToHex(newR, newG, newB)
}

/**
 * Éclaircit une couleur
 */
function lightenColor(r, g, b, factor) {
  const newR = Math.min(255, Math.round(r + (255 - r) * factor))
  const newG = Math.min(255, Math.round(g + (255 - g) * factor))
  const newB = Math.min(255, Math.round(b + (255 - b) * factor))
  return rgbToHex(newR, newG, newB)
}