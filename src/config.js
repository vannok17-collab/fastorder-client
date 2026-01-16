// ============================================
// CONFIGURATION FASTORDER - CLIENT
// fastorder-client/src/config.js
// ============================================

import { extractColorsFromLogo } from './utils/colorExtractor'

export const APP_CONFIG = {
  restaurant: {
    nom: "KFC",
    slogan: "Bon à s’en lécher les doigts",
    logo: "https://th.bing.com/th/id/OIP.ReIBeMMEQ3Kojkzi8GuZPAHaHa?w=200&h=200&c=10&o=6&pid=genserp&rm=2",
  },

  // Couleurs par défaut (remplacées automatiquement par l'extraction)
  theme: {
    primary: "#f97316",
    primaryHover: "#ea580c",
    primaryLight: "#fb923c",
    primaryBg: "#fff7ed",
    secondary: "#dc2626",
    accent: "#fbbf24",
    success: "#10b981",
    successHover: "#059669",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
    }
  },

  options: {
    deviseMonnaie: "FCFA",
  }
}

// Fonction pour initialiser les couleurs depuis le logo
export const initializeThemeFromLogo = async () => {
  try {
    console.log('🎨 Extraction des couleurs du logo...')
    const extractedColors = await extractColorsFromLogo(APP_CONFIG.restaurant.logo)
    
    // Mettre à jour les couleurs
    APP_CONFIG.theme = extractedColors
    
    console.log('✅ Couleurs extraites:', extractedColors)
    return extractedColors
  } catch (error) {
    console.error('❌ Erreur extraction couleurs:', error)
    return APP_CONFIG.theme
  }
}