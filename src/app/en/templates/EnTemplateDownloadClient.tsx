'use client'
import { useState } from 'react'

const TEMPLATES = [
  { id: 'amazon-jp-beauty',    title: 'Amazon JP Beauty Template',     badge: 'Amazon JP',  badgeColor: 'bg-yellow-500/20 text-yellow-400', desc: 'A+ Content style beauty listing with ingredient highlights, before/after structure, and conversion-focused CTA.',     icon: '💄' },
  { id: 'shopify-electronics', title: 'Shopify Electronics Template',  badge: 'Shopify',    badgeColor: 'bg-green-500/20 text-green-400',  desc: 'Global-ready electronics product page with spec tables, feature highlights, and SEO meta structure.',            icon: '💻' },
  { id: 'tmall-food',          title: 'Tmall Food Template',           badge: 'Tmall',      badgeColor: 'bg-red-500/20 text-red-400',      desc: 'Tmall 爆款-style food listing with origin story, nutrition section, and social proof structure.',                 icon: '🍜' },
  { id: 'rakuten-fashion',     title: 'Rakuten Fashion Template',      badge: 'Rakuten',    badgeColor: 'bg-orange-500/20 text-orange-400', desc: 'Rakuten-style Japanese fashion listing with polite copy, size guide, and seasonal appeal sections.',              icon: '👗' },
]

export default function EnTemplateDownloadClient() {
  const [selected, setSelected] = useState<string | null>(null)
  const [emails, setEmails] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, { url: string } | { error: string }>>({})
  const [loading, setLoading] = useState<string | null>(null)

  const handleDownload = async (templateId: string) => {
    const email = emails[templateId]?.trim()
    if (!email) return
    setLoading(templateId)
    try {
      const res = await fetch('/api/template-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, templateId, lang: 'en' }),
      })
      const data = await res.json()
      if (data.downloadUrl) {
        setResults(prev => ({ ...prev, [templateId]: { url: data.downloadUrl } }))
      } else {
        setResults(prev => ({ ...prev, [templateId]: { error: 'Please check your email address.' } }))
      }
    } catch {
      setResults(prev => ({ ...prev, [templateId]: { error: 'Server error. Please try again.' } }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {TEMPLATES.map(tpl => {
        const result = results[tpl.id]
        const isSuccess = result && 'url' in result
        const isError   = result && 'error' in result

        return (
          <div
            key={tpl.id}
            className="bg-white/5 border border-white/8 hover:border-blue-500/30 rounded-2xl p-6 transition-all cursor-pointer"
            onClick={() => setSelected(selected === tpl.id ? null : tpl.id)}
          >
            <div className="text-3xl mb-3">{tpl.icon}</div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tpl.badgeColor} border-current/20 mb-2 inline-block`}>
              {tpl.badge}
            </span>
            <h3 className="font-black text-white mb-2">{tpl.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{tpl.desc}</p>

            {!isSuccess ? (
              <div className={`overflow-hidden transition-all duration-300 ${selected === tpl.id ? 'max-h-40' : 'max-h-0'}`}>
                <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={emails[tpl.id] || ''}
                    onChange={e => setEmails(prev => ({ ...prev, [tpl.id]: e.target.value }))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleDownload(tpl.id)}
                    disabled={loading === tpl.id}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {loading === tpl.id ? 'Loading...' : 'Free Download'}
                  </button>
                </div>
                {isError && <p className="text-red-400 text-xs mt-2">{'error' in result ? result.error : ''}</p>}
              </div>
            ) : (
              <a href={'url' in result ? result.url : '#'} target="_blank" rel="noopener noreferrer"
                className="block text-center bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                onClick={e => e.stopPropagation()}>
                ✅ Open Download Link
              </a>
            )}

            {selected !== tpl.id && !isSuccess && (
              <button className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors">
                Enter email to download free →
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
