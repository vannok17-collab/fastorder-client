// ============================================
// EXTRACTEUR DE COULEURS DEPUIS LE LOGO
// ============================================

export const extractColorsFromLogo = async (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      
      // Compter les couleurs
      const colorCounts = {}
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]
        
        // Ignorer les pixels transparents et trop clairs/foncés
        if (a < 100 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
          continue
        }
        
        // Arrondir pour grouper les couleurs similaires
        const rr = Math.round(r / 10) * 10
        const gg = Math.round(g / 10) * 10
        const bb = Math.round(b / 10) * 10
        const key = `${rr},${gg},${bb}`
        
        colorCounts[key] = (colorCounts[key] || 0) + 1
      }
      
      // Trier par fréquence
      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([color]) => {
          const [r, g, b] = color.split(',').map(Number)
          return { r, g, b }
        })
      
      if (sortedColors.length === 0) {
        // Fallback si aucune couleur détectée
        resolve(getDefaultColors())
        return
      }
      
      // Extraire les 3 couleurs principales
      const primary = sortedColors[0]
      const secondary = sortedColors[1] || primary
      const accent = sortedColors[2] || secondary
      
      const colors = {
        primary: rgbToHex(primary.r, primary.g, primary.b),
        primaryHover: darken(rgbToHex(primary.r, primary.g, primary.b), 15),
        primaryLight: lighten(rgbToHex(primary.r, primary.g, primary.b), 20),
        primaryBg: lighten(rgbToHex(primary.r, primary.g, primary.b), 45),
        
        secondary: rgbToHex(secondary.r, secondary.g, secondary.b),
        accent: rgbToHex(accent.r, accent.g, accent.b),
        
        success: "#10b981",
        successHover: "#059669",
        successLight: "#d1fae5",
        
        danger: "#ef4444",
        dangerHover: "#dc2626",
        dangerLight: "#fee2e2",
        
        warning: "#f59e0b",
        warningLight: "#fef3c7",
        
        info: "#3b82f6",
        infoLight: "#dbeafe",
        
        text: {
          primary: "#111827",
          secondary: "#6b7280",
          light: "#9ca3af",
        },
        
        background: {
          primary: "#ffffff",
          secondary: "#f9fafb",
          dark: "#1f2937",
        }
      }
      
      resolve(colors)
    }
    
    img.onerror = () => {
      console.warn('Erreur chargement logo, utilisation des couleurs par défaut')
      resolve(getDefaultColors())
    }
    
    // Utiliser un proxy CORS pour charger l'image
    img.src = imageUrl.includes('http') 
      ? `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`
      : imageUrl
  })
}

// Convertir RGB en HEX
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Assombrir une couleur
const darken = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - Math.round(255 * (percent / 100)))
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * (percent / 100)))
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * (percent / 100)))
  return rgbToHex(r, g, b)
}

// Éclaircir une couleur
const lighten = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round(255 * (percent / 100)))
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100)))
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * (percent / 100)))
  return rgbToHex(r, g, b)
}

// Couleurs par défaut (fallback)
const getDefaultColors = () => ({
  primary: "#f97316",
  primaryHover: "#ea580c",
  primaryLight: "#fb923c",
  primaryBg: "#fff7ed",
  secondary: "#dc2626",
  accent: "#fbbf24",
  success: "#10b981",
  successHover: "#059669",
  successLight: "#d1fae5",
  danger: "#ef4444",
  dangerHover: "#dc2626",
  dangerLight: "#fee2e2",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  info: "#3b82f6",
  infoLight: "#dbeafe",
  text: {
    primary: "#111827",
    secondary: "#6b7280",
    light: "#9ca3af",
  },
  background: {
    primary: "#ffffff",
    secondary: "#f9fafb",
    dark: "#1f2937",
  }
})