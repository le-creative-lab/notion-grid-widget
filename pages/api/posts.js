import { getDatabasePosts } from '../../lib/notion'

export default async function handler(req, res) {
  // CORS pour permettre l'embed Notion
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { token, db } = req.query

  if (!token || !db) {
    return res.status(400).json({ error: 'Paramètres manquants : token et db sont requis.' })
  }

  try {
    const posts = await getDatabasePosts(token, db)
    res.status(200).json({ posts })
  } catch (err) {
    console.error('Notion API error:', err)
    if (err.code === 'unauthorized') {
      return res.status(401).json({ error: 'Token Notion invalide. Vérifie ton Integration Token.' })
    }
    if (err.code === 'object_not_found') {
      return res.status(404).json({ error: 'Base de données introuvable. Vérifie l\'ID et que l\'intégration a bien accès.' })
    }
    res.status(500).json({ error: 'Erreur lors de la récupération des données Notion.' })
  }
}
