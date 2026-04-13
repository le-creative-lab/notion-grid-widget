import { Client } from '@notionhq/client'

export function getNotionClient(token) {
  return new Client({ auth: token })
}

export async function getDatabasePosts(token, databaseId) {
  const notion = getNotionClient(token)

  const response = await notion.databases.query({
    database_id: databaseId,
    // Tri par date de publication si disponible, sinon par date de création
    sorts: [
      { property: 'Date de publication', direction: 'descending' },
      { timestamp: 'created_time', direction: 'descending' },
    ],
    page_size: 60,
  })

  return response.results.map((page) => {
    const props = page.properties

    const titleProp = Object.values(props).find(p => p.type === 'title')
    const title = titleProp?.title?.[0]?.plain_text || 'Sans titre'

    // Statut
    const statusProp = props['Statut'] || props['Status'] || props['statut'] || props['status']
    let status = 'draft'
    if (statusProp?.type === 'select') {
      const val = statusProp.select?.name?.toLowerCase() || ''
      if (val.includes('publié') || val.includes('publie') || val.includes('posted')) status = 'posted'
      else if (val.includes('programmé') || val.includes('programme') || val.includes('scheduled')) status = 'scheduled'
    } else if (statusProp?.type === 'status') {
      const val = statusProp.status?.name?.toLowerCase() || ''
      if (val.includes('publié') || val.includes('done')) status = 'posted'
      else if (val.includes('programmé') || val.includes('in progress')) status = 'scheduled'
    }

    // Image — priorité : fichier uploadé > URL externe
    let imageUrl = null

    const fileProp = props['Fichier image'] || props['fichier image'] || props['Fichier']
      || Object.values(props).find(p => p.type === 'files' && p.files?.length > 0)
    if (fileProp?.files?.length > 0) {
      const file = fileProp.files[0]
      imageUrl = file.type === 'external' ? file.external?.url : file.file?.url
    }

    if (!imageUrl) {
      const urlProp = props['Image'] || props['Canva'] || props['URL'] || props['Cover']
        || Object.values(props).find(p => p.type === 'url')
      if (urlProp?.type === 'url' && urlProp.url) imageUrl = urlProp.url
    }

    if (!imageUrl && page.cover) {
      imageUrl = page.cover.type === 'external' ? page.cover.external.url : page.cover.file?.url
    }

    // Date
    const dateProp = props['Date'] || props['Date de publication'] || props['Publication']
      || Object.values(props).find(p => p.type === 'date')
    const date = dateProp?.date?.start || null

    // Plateforme
    const platformProp = props['Plateforme'] || props['Platform']
    const platform = platformProp?.select?.name || platformProp?.multi_select?.[0]?.name || 'Instagram'

    // Pinné
    const pinnedProp = props['Pinné'] || props['Pinned'] || props['Pin']
    const pinned = pinnedProp?.checkbox === true

    // Masqué
    const hiddenProp = props['Masqué'] || props['Hidden'] || props['Masque']
    const hidden = hiddenProp?.checkbox === true

    return { id: page.id, title, status, imageUrl, date, platform, pinned, hidden, notionUrl: page.url }
  })
}
