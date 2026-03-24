import { Client } from '@notionhq/client'

export function getNotionClient(token) {
  return new Client({ auth: token })
}

export async function getDatabasePosts(token, databaseId) {
  const notion = getNotionClient(token)

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: 60,
  })

  return response.results.map((page) => {
    const props = page.properties

    // Récupère le titre (première propriété de type title)
    const titleProp = Object.values(props).find(p => p.type === 'title')
    const title = titleProp?.title?.[0]?.plain_text || 'Sans titre'

    // Récupère le statut
    const statusProp = props['Statut'] || props['Status'] || props['statut'] || props['status']
    let status = 'draft'
    if (statusProp?.type === 'select') {
      const val = statusProp.select?.name?.toLowerCase() || ''
      if (val.includes('publié') || val.includes('publie') || val.includes('posted') || val.includes('live')) status = 'posted'
      else if (val.includes('programmé') || val.includes('programme') || val.includes('scheduled')) status = 'scheduled'
    } else if (statusProp?.type === 'status') {
      const val = statusProp.status?.name?.toLowerCase() || ''
      if (val.includes('publié') || val.includes('publie') || val.includes('posted') || val.includes('done')) status = 'posted'
      else if (val.includes('programmé') || val.includes('programme') || val.includes('scheduled') || val.includes('in progress')) status = 'scheduled'
    }

    // Récupère l'image : d'abord URL externe (Canva), ensuite fichier attaché
    let imageUrl = null

    // Cherche une propriété URL (pour Canva)
    const urlProp = props['Image'] || props['Canva'] || props['URL'] || props['Cover'] || props['Visual']
      || Object.values(props).find(p => p.type === 'url')
    if (urlProp?.type === 'url' && urlProp.url) {
      imageUrl = urlProp.url
    }

    // Cherche une propriété fichier/media
    if (!imageUrl) {
      const fileProp = Object.values(props).find(p => p.type === 'files' && p.files?.length > 0)
      if (fileProp) {
        const file = fileProp.files[0]
        imageUrl = file.type === 'external' ? file.external.url : file.file?.url
      }
    }

    // Cover de la page Notion
    if (!imageUrl && page.cover) {
      imageUrl = page.cover.type === 'external' ? page.cover.external.url : page.cover.file?.url
    }

    // Récupère la date de publication prévue
    const dateProp = props['Date'] || props['Publish Date'] || props['Publication']
      || Object.values(props).find(p => p.type === 'date')
    const date = dateProp?.date?.start || null

    // Récupère la plateforme
    const platformProp = props['Plateforme'] || props['Platform'] || props['platform']
    const platform = platformProp?.select?.name || platformProp?.multi_select?.[0]?.name || 'Instagram'

    return {
      id: page.id,
      title,
      status,
      imageUrl,
      date,
      platform,
      notionUrl: page.url,
    }
  })
}
