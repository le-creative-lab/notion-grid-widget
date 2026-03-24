import { useEffect, useState, useCallback, useRef } from 'react'
import Head from 'next/head'

const STATUS_CONFIG = {
  draft:     { label: 'Brouillon', color: '#b45309', bg: '#fef3c7' },
  scheduled: { label: 'Programmé', color: '#0369a1', bg: '#e0f2fe' },
  posted:    { label: 'Publié',    color: '#15803d', bg: '#dcfce7' },
}

export default function Widget() {
  const [posts, setPosts]           = useState([])
  const [filtered, setFiltered]     = useState([])
  const [filter, setFilter]         = useState('all')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [config, setConfig]         = useState(null)
  const [dragIndex, setDragIndex]   = useState(null)
  const [preview, setPreview]       = useState(null)
  const [order, setOrder]           = useState([])
  const intervalRef                 = useRef(null)

  // Lit les paramètres depuis l'URL : ?token=xxx&db=yyy
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const db     = params.get('db')
    if (token && db) setConfig({ token, db })
    else setError('Paramètres manquants dans l\'URL. Utilise le générateur de lien.')
  }, [])

  const fetchPosts = useCallback(async () => {
    if (!config) return
    try {
      const res  = await fetch(`/api/posts?token=${config.token}&db=${config.db}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosts(data.posts)
      setOrder(prev => {
        // Garde l'ordre existant, ajoute les nouveaux à la fin
        const existing = prev.filter(id => data.posts.find(p => p.id === id))
        const newIds   = data.posts.map(p => p.id).filter(id => !existing.includes(id))
        return [...existing, ...newIds]
      })
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [config])

  useEffect(() => {
    if (!config) return
    fetchPosts()
    intervalRef.current = setInterval(fetchPosts, 30000) // refresh auto toutes les 30s
    return () => clearInterval(intervalRef.current)
  }, [config, fetchPosts])

  // Applique filtre + ordre personnalisé
  useEffect(() => {
    const ordered = order.map(id => posts.find(p => p.id === id)).filter(Boolean)
    if (filter === 'all') setFiltered(ordered)
    else setFiltered(ordered.filter(p => p.status === filter))
  }, [posts, filter, order])

  // Drag & drop
  function onDragStart(i) { setDragIndex(i) }
  function onDragOver(e, i) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    setOrder(prev => {
      const newOrder = [...prev]
      const fromId   = filtered[dragIndex]?.id
      const toId     = filtered[i]?.id
      if (!fromId || !toId) return prev
      const fromIdx  = newOrder.indexOf(fromId)
      const toIdx    = newOrder.indexOf(toId)
      newOrder.splice(fromIdx, 1)
      newOrder.splice(toIdx, 0, fromId)
      return newOrder
    })
    setDragIndex(i)
  }
  function onDragEnd() { setDragIndex(null) }

  // Grille : toujours multiple de 3, min 9 cellules
  const totalCells = Math.max(9, Math.ceil(filtered.length / 3) * 3)
  const cells      = Array.from({ length: totalCells }, (_, i) => filtered[i] || null)

  if (!config && error) return <ErrorScreen message={error} />
  if (loading)          return <LoadingScreen />
  if (error)            return <ErrorScreen message={error} onRetry={fetchPosts} />

  return (
    <>
      <Head>
        <title>Grid Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.root}>
        {/* Filtres */}
        <div style={styles.filterRow}>
          {['all', 'draft', 'scheduled', 'posted'].map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `Tous (${posts.length})` : `${STATUS_CONFIG[f].label} (${posts.filter(p => p.status === f).length})`}
            </button>
          ))}
          <button style={styles.refreshBtn} onClick={fetchPosts} title="Actualiser">↻</button>
        </div>

        {/* Grille */}
        <div style={styles.grid}>
          {cells.map((post, i) => (
            <div
              key={post ? post.id : `empty-${i}`}
              style={{
                ...styles.cell,
                ...(dragIndex === i ? styles.cellDragging : {}),
              }}
              draggable={!!post}
              onDragStart={() => post && onDragStart(i)}
              onDragOver={(e) => post && onDragOver(e, i)}
              onDragEnd={onDragEnd}
              onClick={() => post && setPreview(post)}
            >
              {post ? (
                <>
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      style={styles.img}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                  ) : null}
                  <div style={{ ...styles.placeholder, display: post.imageUrl ? 'none' : 'flex' }}>
                    <span style={{ fontSize: 28 }}>🖼️</span>
                    <span style={styles.placeholderText}>{post.title}</span>
                  </div>
                  <div style={{ ...styles.statusBadge, background: STATUS_CONFIG[post.status].bg, color: STATUS_CONFIG[post.status].color }}>
                    {STATUS_CONFIG[post.status].label}
                  </div>
                  <div style={styles.hoverOverlay}>
                    <span style={styles.hoverTitle}>{post.title}</span>
                    {post.date && <span style={styles.hoverDate}>{new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </>
              ) : (
                <div style={styles.emptyCell}>+</div>
              )}
            </div>
          ))}
        </div>

        <p style={styles.hint}>Glisse pour réorganiser · Clique pour voir · Se rafraîchit auto depuis Notion</p>
      </div>

      {/* Modal preview */}
      {preview && (
        <div style={styles.modalBg} onClick={() => setPreview(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setPreview(null)}>✕</button>
            {preview.imageUrl && (
              <img src={preview.imageUrl} alt={preview.title} style={styles.modalImg} />
            )}
            <div style={styles.modalInfo}>
              <h3 style={styles.modalTitle}>{preview.title}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <span style={{ ...styles.statusBadge, position: 'static', fontSize: 12, padding: '3px 8px', background: STATUS_CONFIG[preview.status].bg, color: STATUS_CONFIG[preview.status].color }}>
                  {STATUS_CONFIG[preview.status].label}
                </span>
                {preview.platform && <span style={styles.platformBadge}>{preview.platform}</span>}
                {preview.date && <span style={styles.dateBadge}>{new Date(preview.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              </div>
              {preview.notionUrl && (
                <a href={preview.notionUrl} target="_blank" rel="noreferrer" style={styles.notionLink}>
                  Ouvrir dans Notion →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #374151', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ color: '#6b7280', fontSize: 14 }}>Chargement depuis Notion…</p>
    </div>
  )
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 20 }}>
        <p style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 8 }}>Oups, une erreur !</p>
        <p style={{ color: '#7f1d1d', fontSize: 14, marginBottom: onRetry ? 16 : 0 }}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            Réessayer
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  root: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '12px',
    background: '#fff',
    minHeight: '100vh',
  },
  filterRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterBtn: {
    padding: '4px 10px',
    fontSize: 12,
    borderRadius: 20,
    border: '1px solid #e5e7eb',
    background: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: '#111827',
    color: '#fff',
    borderColor: '#111827',
  },
  refreshBtn: {
    marginLeft: 'auto',
    padding: '4px 10px',
    fontSize: 16,
    borderRadius: 20,
    border: '1px solid #e5e7eb',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 3,
  },
  cell: {
    aspectRatio: '1',
    position: 'relative',
    background: '#f3f4f6',
    overflow: 'hidden',
    cursor: 'grab',
    borderRadius: 2,
  },
  cellDragging: {
    opacity: 0.4,
    cursor: 'grabbing',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    pointerEvents: 'none',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: '#f9fafb',
  },
  placeholderText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    padding: '0 6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '90%',
  },
  statusBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontSize: 9,
    padding: '2px 5px',
    borderRadius: 4,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  hoverOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 8,
    opacity: 0,
    transition: 'opacity 0.18s',
  },
  hoverTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 500,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  hoverDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  emptyCell: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d1d5db',
    fontSize: 20,
    cursor: 'default',
  },
  hint: {
    fontSize: 10,
    color: '#d1d5db',
    textAlign: 'center',
    marginTop: 8,
  },
  modalBg: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    maxWidth: 380,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 28,
    height: 28,
    cursor: 'pointer',
    fontSize: 13,
    zIndex: 1,
  },
  modalImg: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover',
    display: 'block',
  },
  modalInfo: {
    padding: '14px 16px 16px',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  platformBadge: {
    fontSize: 12,
    padding: '3px 8px',
    borderRadius: 4,
    background: '#f3f4f6',
    color: '#374151',
  },
  dateBadge: {
    fontSize: 12,
    padding: '3px 8px',
    borderRadius: 4,
    background: '#f3f4f6',
    color: '#374151',
  },
  notionLink: {
    display: 'inline-block',
    marginTop: 12,
    fontSize: 13,
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: 500,
  },
}
