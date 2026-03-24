export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'URL manquante' })

  // Vérifie que c'est bien un lien Canva
  if (!url.includes('canva.com')) {
    return res.status(400).json({ error: 'URL non autorisée' })
  }

  try {
    // Extrait l'ID du design Canva
    const match = url.match(/canva\.com\/design\/([^\/\?]+)/)
    if (!match) return res.status(400).json({ error: 'Lien Canva invalide' })

    const designId = match[1]

    // Essaie de récupérer la miniature via l'URL de preview Canva
    const previewUrls = [
      `https://www.canva.com/design/${designId}/thumbnail`,
      `https://www.canva.com/design/${designId}/view`,
    ]

    let imageResponse = null

    for (const previewUrl of previewUrls) {
      try {
        const response = await fetch(previewUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NotionGridWidget/1.0)',
            'Accept': 'text/html,application/xhtml+xml,image/*,*/*',
          },
          redirect: 'follow',
        })

        if (response.ok) {
          const contentType = response.headers.get('content-type') || ''

          // Si c'est une image directe, on la renvoie
          if (contentType.startsWith('image/')) {
            const buffer = await response.arrayBuffer()
            res.setHeader('Content-Type', contentType)
            res.setHeader('Cache-Control', 'public, max-age=3600')
            return res.send(Buffer.from(buffer))
          }

          // Si c'est du HTML, on cherche l'og:image dans le HTML
          if (contentType.startsWith('text/html')) {
            const html = await response.text()
            const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
              || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)

            if (ogImageMatch && ogImageMatch[1]) {
              imageResponse = ogImageMatch[1]
              break
            }
          }
        }
      } catch (e) {
        continue
      }
    }

    if (imageResponse) {
      // Fetch l'image trouvée et la proxy
      const imgRes = await fetch(imageResponse, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NotionGridWidget/1.0)' }
      })
      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') || 'image/png'
        const buffer = await imgRes.arrayBuffer()
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=3600')
        return res.send(Buffer.from(buffer))
      }
    }

    // Fallback : renvoie un JSON avec le lien embed pour que le widget affiche un placeholder cliquable
    return res.status(200).json({
      fallback: true,
      embedUrl: `https://www.canva.com/design/${match[1]}/view`,
      designId: match[1],
    })

  } catch (err) {
    console.error('Canva proxy error:', err)
    return res.status(500).json({ error: 'Impossible de récupérer le visuel Canva' })
  }
}
