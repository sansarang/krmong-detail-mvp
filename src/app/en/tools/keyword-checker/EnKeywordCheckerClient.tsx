'use client'
import { useState, useMemo } from 'react'

const FORBIDDEN: { word: string; alt: string }[] = [
  { word: 'guaranteed',            alt: 'designed to' },
  { word: 'cure',                  alt: 'support' },
  { word: 'prevent',               alt: 'help reduce the risk of' },
  { word: 'treat',                 alt: 'address' },
  { word: 'best in the world',     alt: 'top-rated' },
  { word: 'cheapest',              alt: 'competitively priced' },
  { word: '100% safe',             alt: 'thoroughly tested' },
  { word: 'miracle',               alt: 'remarkable' },
  { word: 'instant results',       alt: 'fast-acting' },
  { word: 'no side effects',       alt: 'gentle formula' },
  { word: 'fda approved',          alt: 'FDA registered facility' },
  { word: 'clinically proven',     alt: 'clinically tested' },
  { word: 'risk-free',             alt: 'satisfaction backed' },
  { word: 'scientifically proven', alt: 'research-backed' },
  { word: 'doctor recommended',    alt: 'developed with professionals' },
  { word: 'number 1',              alt: 'highly rated' },
  { word: '#1',                    alt: 'top choice' },
  { word: 'world class',           alt: 'premium quality' },
  { word: 'eliminate',             alt: 'significantly reduce' },
]

function buildHighlight(text: string, foundWords: string[]): string {
  let out = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  foundWords.forEach(w => {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    out = out.replace(re, m => `<mark class="bg-red-500/30 text-red-300 rounded px-0.5">${m}</mark>`)
  })
  return out
}

export default function EnKeywordCheckerClient() {
  const [text, setText] = useState('')

  const analysis = useMemo(() => {
    const lower = text.toLowerCase()
    return FORBIDDEN.filter(f => lower.includes(f.word))
  }, [text])

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Paste your listing text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your Amazon, Shopify, or Tmall product listing here..."
            className="w-full h-72 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <p className="text-xs text-gray-600 mt-1.5">{text.length.toLocaleString()} characters</p>
        </div>
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Highlighted result</label>
          <div
            className="w-full h-72 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 overflow-auto leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: text
                ? buildHighlight(text, analysis.map(f => f.word))
                : '<span class="text-gray-600">Prohibited words will be highlighted in red here.</span>',
            }}
          />
        </div>
      </div>

      <div className={`rounded-2xl border p-5 transition-all ${analysis.length > 0 ? 'bg-red-500/10 border-red-500/20' : text ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/8'}`}>
        {!text && <p className="text-sm text-gray-500 text-center">Paste your listing above to start the check.</p>}
        {text && analysis.length === 0 && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-black text-green-400">No prohibited words found!</p>
              <p className="text-xs text-gray-500 mt-0.5">This listing looks compliant with Amazon & Shopify guidelines.</p>
            </div>
          </div>
        )}
        {analysis.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-black text-red-400">{analysis.length} prohibited word{analysis.length > 1 ? 's' : ''} found</p>
                <p className="text-xs text-gray-500 mt-0.5">Replace these words to avoid listing rejection or suppression.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {analysis.map(item => (
                <div key={item.word} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-red-400 font-black text-sm line-through">{item.word}</span>
                    <span className="text-gray-500 text-xs">→</span>
                    <span className="text-green-400 font-bold text-sm">{item.alt}</span>
                  </div>
                  <p className="text-[10px] text-gray-600">Suggested replacement</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
