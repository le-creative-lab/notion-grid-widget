export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { url } = req.query
  if (!url || !url.includes('canva.com')) {
    return res.status(400).json({ error: 'URL Canva invalide' })
  }

  try {
    // Étape 1 : appel à l'API oEmbed de Canva
    const oembedUrl = `https://www.canva.com/oembed?url=${encodeURIComponent(url)}&format=json`

    const oembedRes = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NotionGridWidget/1.0)',
        'Accept': 'application/json',
      }
    })

    if (!oembedRes.ok) {
      return res.status(200).json({ fallback: true, url })
    }

    const data = await oembedRes.json()

    // Étape 2 : on a une thumbnail_url ? On la proxie comme image
    if (data.thumbnail_url) {
      const imgRes = await fetch(data.thumbnail_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NotionGridWidget/1.0)',
        }
      })

      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') || 'image/png'
        const buffer = await imgRes.arrayBuffer()
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=3600')
        return res.send(Buffer.from(buffer))
      }
    }

    // Étape 3 : pas de thumbnail mais on a le HTML embed ?
    // On extrait l'URL depuis le HTML
    if (data.html) {
      const srcMatch = data.html.match(/src="([^"]+)"/)
      if (srcMatch) {
        return res.status(200).json({
          fallback: true,
          embedUrl: srcMatch[1],
          title: data.title || '',
        })
      }
    }

    return res.status(200).json({ fallback: true, url, title: data.title || '' })

  } catch (err) {
    console.error('Canva proxy error:', err)
    return res.status(200).json({ fallback: true, url })
  }
}
