// fastorder-client/src/components/InvoiceView.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { APP_CONFIG } from '../config'
import { Download, Receipt } from 'lucide-react'

function InvoiceView({ userId }) {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchCommandes()

    // Realtime pour mettre à jour automatiquement
    const channel = supabase
      .channel('commandes_client_invoice')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'commandes',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchCommandes()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const fetchCommandes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('commandes')
        .select(`
          *,
          commandes_items (
            *,
            plats (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCommandes(data || [])
    } catch (error) {
      console.error('Erreur chargement factures:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = (commande) => {
    const items = commande.commandes_items
      .map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.plats.nom}</td>
          <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantite}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.prix_unitaire.toLocaleString()}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${(item.prix_unitaire * item.quantite).toLocaleString()}</td>
        </tr>
      `)
      .join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture ${commande.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f9fafb; }
          .invoice { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${APP_CONFIG.theme.primary}; }
          .logo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; }
          h1 { color: ${APP_CONFIG.theme.primary}; margin: 10px 0; font-size: 32px; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
          .info-box { background: ${APP_CONFIG.theme.primaryBg}; padding: 15px; border-radius: 10px; }
          .label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
          .value { font-size: 16px; font-weight: bold; color: ${APP_CONFIG.theme.primary}; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: ${APP_CONFIG.theme.primary}; color: white; padding: 12px; text-align: left; }
          .total { background: ${APP_CONFIG.theme.primaryBg}; font-size: 20px; font-weight: bold; padding: 15px !important; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid ${APP_CONFIG.theme.primary}; color: ${APP_CONFIG.theme.primary}; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <img src="${APP_CONFIG.restaurant.logo}" class="logo" />
            <h1>${APP_CONFIG.restaurant.nom}</h1>
            <p style="color: #6b7280; margin: 0;">${APP_CONFIG.restaurant.slogan}</p>
            <h2 style="color: ${APP_CONFIG.theme.primary}; margin: 15px 0 0;">FACTURE N° ${commande.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          
          <div class="info">
            <div class="info-box"><div class="label">Date</div><div class="value">${new Date(commande.created_at).toLocaleDateString('fr-FR')}</div></div>
            <div class="info-box"><div class="label">Heure</div><div class="value">${new Date(commande.created_at).toLocaleTimeString('fr-FR')}</div></div>
            <div class="info-box"><div class="label">Table</div><div class="value">Table ${commande.numero_table}</div></div>
            <div class="info-box"><div class="label">Statut</div><div class="value">${commande.statut}</div></div>
          </div>
          
          <table>
            <thead><tr><th>Article</th><th style="text-align: center;">Qté</th><th style="text-align: right;">P.U.</th><th style="text-align: right;">Total</th></tr></thead>
            <tbody>${items}</tbody>
            <tfoot>
              <tr class="total">
                <td colspan="3" style="text-align: right; color: ${APP_CONFIG.theme.primary};">TOTAL À PAYER</td>
                <td style="text-align: right; color: ${APP_CONFIG.theme.primary};">${commande.montant_total.toLocaleString()} ${APP_CONFIG.options.deviseMonnaie}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <p>✨ Merci de votre visite ! ✨</p>
            <p style="font-size: 14px; margin-top: 10px;">À bientôt chez ${APP_CONFIG.restaurant.nom}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Créer un Blob et télécharger
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Facture-${commande.id.slice(0, 8)}-${APP_CONFIG.restaurant.nom}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent"
          style={{ borderColor: `${APP_CONFIG.theme.primary}40`, borderTopColor: 'transparent' }}
        ></div>
      </div>
    )
  }

  if (commandes.length === 0) {
    return (
      <div className="text-center py-20">
        <Receipt size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune facture</h3>
        <p className="text-gray-500">Vos factures apparaîtront ici après avoir passé une commande</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r rounded-2xl shadow-lg p-6 border-l-8"
        style={{ 
          background: `linear-gradient(135deg, ${APP_CONFIG.theme.primaryBg} 0%, white 100%)`,
          borderColor: APP_CONFIG.theme.primary
        }}
      >
        <h2 className="text-3xl font-bold mb-2" style={{ color: APP_CONFIG.theme.primary }}>
          📄 Mes Factures
        </h2>
        <p className="text-gray-600">
          Retrouvez toutes vos factures et téléchargez-les
        </p>
      </div>

      <div className="grid gap-6">
        {commandes.map(commande => {
          const totalArticles = commande.commandes_items.reduce((sum, item) => sum + item.quantite, 0)

          return (
            <div key={commande.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              {/* Header */}
              <div className="p-6 border-l-4"
                style={{ 
                  backgroundColor: `${APP_CONFIG.theme.primary}10`,
                  borderColor: APP_CONFIG.theme.primary
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Facture N° {commande.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(commande.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Table {commande.numero_table}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    commande.statut === 'Terminée' ? 'bg-green-100 text-green-800' :
                    commande.statut === 'En préparation' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {commande.statut}
                  </span>
                </div>
              </div>

              {/* Articles */}
              <div className="p-6 space-y-3">
                {commande.commandes_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      <strong style={{ color: APP_CONFIG.theme.primary }}>{item.quantite}x</strong> {item.plats.nom}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {(item.prix_unitaire * item.quantite).toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                    </span>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Total ({totalArticles} article{totalArticles > 1 ? 's' : ''})
                  </span>
                  <span className="text-2xl font-bold" style={{ color: APP_CONFIG.theme.primary }}>
                    {commande.montant_total.toLocaleString()} {APP_CONFIG.options.deviseMonnaie}
                  </span>
                </div>

                {commande.mode_paiement && (
                  <div className="pt-3 text-sm text-gray-600">
                    <strong>Mode de paiement :</strong> {
                      commande.mode_paiement === 'especes' ? '💵 Espèces' :
                      commande.mode_paiement === 'wave' ? '📱 Wave' :
                      commande.mode_paiement === 'orange_money' ? '🟠 Orange Money' :
                      commande.mode_paiement === 'mtn_momo' ? '💛 MTN MoMo' :
                      commande.mode_paiement === 'moov_money' ? '🔵 Moov Money' :
                      '💳 Carte'
                    }
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 border-t">
                <button
                  onClick={() => downloadInvoice(commande)}
                  className="w-full py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-white"
                  style={{ backgroundColor: APP_CONFIG.theme.primary }}
                >
                  <Download size={20} />
                  Télécharger la facture
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InvoiceView