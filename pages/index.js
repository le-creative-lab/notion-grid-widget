import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [token, setToken]   = useState('')
  const [dbId, setDbId]     = useState('')
  const [url, setUrl]       = useState('')
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  function generate() {
    if (!token.trim() || !dbId.trim()) return
    const base = window.location.origin
    const cleanDb = dbId.trim().replace(/-/g, '').slice(0, 32)
    const formattedDb = [cleanDb.slice(0,8), cleanDb.slice(8,12), cleanDb.slice(12,16), cleanDb.slice(16,20), cleanDb.slice(20)].join('-')
    setUrl(`${base}/widget?token=${token.trim()}&db=${formattedDb}`)
    setTestResult(null)
  }

  async function testConnection() {
    if (!token.trim() || !dbId.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      const cleanDb = dbId.trim().replace(/-/g, '').slice(0, 32)
      const formattedDb = [cleanDb.slice(0,8), cleanDb.slice(8,12), cleanDb.slice(12,16), cleanDb.slice(16,20), cleanDb.slice(20)].join('-')
      const res = await fetch(`/api/posts?token=${token.trim()}&db=${formattedDb}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTestResult({ success: true, count: data.posts.length })
    } catch (e) {
      setTestResult({ success: false, message: e.message })
    } finally {
      setTesting(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Head>
        <title>Notion Grid Widget — Générateur</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.header}>
            <div style={s.logo}>◼◼◼</div>
            <h1 style={s.title}>Notion Grid Widget</h1>
            <p style={s.subtitle}>Visualise ta grille Instagram directement dans Notion ✨</p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>1. Connecte ta base Notion</h2>
            <p style={s.help}>
              Crée une intégration sur <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" style={s.link}>notion.so/my-integrations</a>,
              copie le <strong>Internal Integration Token</strong>, et invite l'intégration dans ta base de données.
            </p>

            <label style={s.label}>Integration Token (commence par <code>secret_</code>)</label>
            <input
              style={s.input}
              type="password"
              placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={e => setToken(e.target.value)}
            />

            <label style={s.label}>ID de ta base de données</label>
            <input
              style={s.input}
              type="text"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={dbId}
              onChange={e => setDbId(e.target.value)}
            />
            <p style={s.helpSmall}>
              L'ID se trouve dans l'URL de ta base Notion : notion.so/monworkspace/<strong>ICI</strong>?v=...
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>2. Configure ta base Notion</h2>
            <p style={s.help}>Ta base doit avoir ces propriétés (les noms exacts ou leurs équivalents anglais) :</p>
            <div style={s.propList}>
              {[
                { name: 'Statut', type: 'Sélection ou Statut', values: 'Brouillon, Programmé, Publié' },
                { name: 'Image', type: 'URL', values: 'Lien de ton visuel Canva (partage > copier le lien)' },
                { name: 'Date', type: 'Date', values: 'Date de publication prévue' },
                { name: 'Plateforme', type: 'Sélection', values: 'Instagram, TikTok, LinkedIn...' },
              ].map(p => (
                <div key={p.name} style={s.propItem}>
                  <span style={s.propName}>{p.name}</span>
                  <span style={s.propType}>{p.type}</span>
                  <span style={s.propValues}>{p.values}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.btnRow}>
            <button style={s.btnSecondary} onClick={testConnection} disabled={!token || !dbId || testing}>
              {testing ? 'Test en cours…' : 'Tester la connexion'}
            </button>
            <button style={s.btnPrimary} onClick={generate} disabled={!token || !dbId}>
              Générer mon lien widget
            </button>
          </div>

          {testResult && (
            <div style={{ ...s.alert, ...(testResult.success ? s.alertSuccess : s.alertError) }}>
              {testResult.success
                ? `✓ Connexion réussie ! ${testResult.count} post${testResult.count > 1 ? 's' : ''} trouvé${testResult.count > 1 ? 's' : ''} dans ta base.`
                : `✗ ${testResult.message}`}
            </div>
          )}

          {url && (
            <div style={s.result}>
              <p style={s.resultLabel}>Ton lien widget :</p>
              <div style={s.urlBox}>
                <code style={s.urlText}>{url}</code>
                <button style={s.copyBtn} onClick={copy}>{copied ? '✓ Copié !' : 'Copier'}</button>
              </div>
              <div style={s.instructions}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Pour intégrer dans Notion :</p>
                <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.8, color: '#374151' }}>
                  <li>Ouvre ta page Notion</li>
                  <li>Tape <code style={s.code}>/embed</code> et sélectionne "Embed"</li>
                  <li>Colle ton lien et clique sur "Embed link"</li>
                  <li>Redimensionne le bloc à ta convenance 🎉</li>
                </ol>
              </div>
              <a href={url} target="_blank" rel="noreferrer" style={s.previewLink}>
                Prévisualiser mon widget →
              </a>
            </div>
          )}
        </div>

        <footer style={s.footer}>
          Propulsé par le Creative Lab 💛 · <a href="https://lecreativelab.fr" style={s.link} target="_blank" rel="noreferrer">lecreativelab.fr</a>
        </footer>
      </div>
    </>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#fafaf9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    padding: '32px 28px',
    width: '100%',
    maxWidth: 560,
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 20,
    letterSpacing: 4,
    color: '#374151',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 6px',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    margin: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px',
  },
  help: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: 12,
  },
  helpSmall: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#111827',
    background: '#fff',
    boxSizing: 'border-box',
  },
  propList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 8,
  },
  propItem: {
    display: 'grid',
    gridTemplateColumns: '90px 120px 1fr',
    gap: 8,
    padding: '8px 10px',
    background: '#f9fafb',
    borderRadius: 6,
    fontSize: 12,
    alignItems: 'center',
  },
  propName: {
    fontWeight: 600,
    color: '#111827',
    fontFamily: 'monospace',
  },
  propType: {
    color: '#6366f1',
    fontStyle: 'italic',
  },
  propValues: {
    color: '#6b7280',
    lineHeight: 1.4,
  },
  btnRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
  },
  btnPrimary: {
    flex: 1,
    padding: '10px 16px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 16px',
    background: 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  alert: {
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  alertSuccess: {
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
  },
  alertError: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  },
  result: {
    background: '#f5f3ff',
    border: '1px solid #e0e7ff',
    borderRadius: 10,
    padding: '16px',
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4338ca',
    margin: '0 0 8px',
  },
  urlBox: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  urlText: {
    flex: 1,
    fontSize: 11,
    color: '#374151',
    background: '#fff',
    border: '1px solid #e0e7ff',
    borderRadius: 6,
    padding: '6px 8px',
    wordBreak: 'break-all',
    lineHeight: 1.5,
  },
  copyBtn: {
    flexShrink: 0,
    padding: '7px 14px',
    background: '#4338ca',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },
  instructions: {
    background: '#fff',
    border: '1px solid #e0e7ff',
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 12,
  },
  code: {
    background: '#e0e7ff',
    color: '#4338ca',
    padding: '1px 5px',
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  previewLink: {
    display: 'inline-block',
    fontSize: 13,
    color: '#4338ca',
    fontWeight: 500,
    textDecoration: 'none',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#9ca3af',
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
  },
}
