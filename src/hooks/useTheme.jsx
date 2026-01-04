// fastorder-client/src/hooks/useTheme.jsx
// fastorder-manager/src/hooks/useTheme.jsx (même fichier pour les deux)

import { useState, useEffect } from 'react'
import { APP_CONFIG, initializeThemeFromLogo } from '../config'

/**
 * Hook personnalisé pour gérer le thème avec extraction automatique des couleurs du logo
 * @returns {Object} { theme, loading, error, ready }
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(APP_CONFIG.theme)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true)
        console.log('🎨 Initialisation du thème depuis le logo...')
        
        // Utiliser votre fonction existante
        const extractedTheme = await initializeThemeFromLogo()
        
        console.log('✅ Thème chargé avec succès:', extractedTheme)
        setTheme(extractedTheme)
        setReady(true)
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement du thème:', err)
        setError(err.message || 'Erreur inconnue')
        // En cas d'erreur, utiliser les couleurs par défaut
        setTheme(APP_CONFIG.theme)
        setReady(true) // Quand même prêt avec les couleurs par défaut
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [])

  return { 
    theme,      // Le thème extrait du logo
    loading,    // true pendant le chargement
    error,      // Message d'erreur si échec
    ready       // true quand le thème est prêt (même en cas d'erreur avec fallback)
  }
}

/**
 * Hook simplifié si vous voulez juste savoir quand le thème est prêt
 */
export const useThemeReady = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        await initializeThemeFromLogo()
      } catch (err) {
        console.error('Erreur thème:', err)
      } finally {
        setReady(true)
      }
    }
    loadTheme()
  }, [])

  return ready
}