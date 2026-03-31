'use client'
import { useState } from 'react'

const MARKETS = [
  { id: 'amazon',  label: 'Amazon JP', icon: '🟠', active: 'border-orange-500/50 bg-orange-500/10 text-orange-400' },
  { id: 'shopify', label: 'Shopify',   icon: '🟢', active: 'border-green-500/50 bg-green-500/10 text-green-400' },
  { id: 'tmall',   label: 'Tmall',     icon: '🔴', active: 'border-red-500/50 bg-red-500/10 text-red-400' },
  { id: 'rakuten', label: 'Rakuten',   icon: '🔴', active: 'border-rose-500/50 bg-rose-500/10 text-rose-400' },
]

interface PreviewSection { title: string; body: string }

function buildPreview(name: string, features: string, market: string): PreviewSection[] {
  const fname = name || 'Your Product'
  const flist = features
    ? features.split('\n').filter(Boolean).map(f => f.trim())
    : ['Premium quality construction', 'Easy to use design', 'Long-lasting performance']

  if (market === 'amazon') {
    return [
      { title: '📦 Product Overview', body: `Introducing ${fname} — engineered for performance and built to last. Whether you're a first-time buyer or a seasoned user, ${fname} delivers consistent results that exceed expectations.` },
      { title: '✅ Key Features', body: flist.map(f => `• ${f}`).join('\n') },
      { title: "🎯 Who It's For", body: `${fname} is ideal for everyday use. Designed with ease of use in mind, it fits naturally into any routine — at home, in the office, or on the go.` },
      { title: '📋 In the Box', body: `• 1× ${fname}\n• User manual\n• Warranty card` },
    ]
  }
  if (market === 'shopify') {
    return [
      { title: `The Story Behind ${fname}`, body: `We built ${fname} because we believed something better was possible. Every detail — from materials to finish — was chosen with purpose.` },
      { title: 'What Makes It Different', body: flist.map(f => `→ ${f}`).join('\n') },
      { title: 'Built for Real Life', body: `${fname} is designed to keep up with you — reliable enough for daily use, refined enough to feel premium every time.` },
    ]
  }
  if (market === 'tmall') {
    return [
      { title: `【${fname}】爆款推荐 — Top-Selling Highlights`, body: `Premium craftsmanship. Trusted by thousands of buyers. ${fname} combines functionality with style — the perfect choice for discerning shoppers.` },
      { title: '⭐ Product Advantages', body: flist.map(f => `✦ ${f}`).join('\n') },
      { title: '🛡 Quality Assurance', body: `Every ${fname} passes our rigorous 3-stage quality control process before shipping. Backed by a 30-day satisfaction guarantee.` },
      { title: '📦 Packaging & Delivery', body: `Arrives in premium protective packaging. Express shipping available. Authentic product guaranteed.` },
    ]
  }
  return [
    { title: `${fname} — 選ばれる理由`, body: `${fname}は、品質へのこだわりと使いやすさを追求した逸品です。多くのお客様にご愛用いただいています。\n\n(${fname} — crafted for quality and everyday ease, loved by thousands of customers.)` },
    { title: '商品の特長 / Key Features', body: flist.map(f => `◎ ${f}`).join('\n') },
    { title: 'ご購入前に / Before You Buy', body: `商品の詳細はご注文前にご確認ください。\n(Please review all product details before ordering. We're happy to answer questions.)` },
  ]
}

export default function DescriptionGeneratorClient() {
  const [name, setName] = useState('')
  const [features, setFeatures] = useState('')
  const [market, setMarket] = useState('amazon')
  const [generated, setGenerated] = useState(false)

  const preview = buildPreview(name, features, market)
  const selectedMarket = MARKETS.find(m => m.id === market)

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Product Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Wireless Noise-Cancelling Earbuds Pro"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">
            Key Features <span className="text-gray-600 font-normal normal-case">(one per line)</span>
          </label>
          <textarea
            value={features}
            onChange={e => setFeatures(e.target.value)}
            placeholder={"Active noise cancellation (ANC)\n36-hour battery life\nIPX5 water resistance\nBluetooth 5.3"}
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Target Marketplace</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MARKETS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMarket(m.id)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black border transition-all ${
                  market === m.id ? m.active + ' border-2' : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-400'
                }`}
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setGenerated(true)}
          disabled={!name.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl text-sm transition-all"
        >
          {generated ? '🔄 Regenerate Preview' : '✨ Generate Preview'}
        </button>
      </div>

      {generated && name.trim() && (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/3">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Preview —</span>
            <span className="text-[10px] font-black text-gray-400">{selectedMarket?.label}</span>
            <span className="ml-auto text-[9px] font-bold text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-full">Sample preview only</span>
          </div>
          <div className="p-6 space-y-5">
            {preview.map((sec, i) => (
              <div key={i}>
                <h3 className="text-sm font-black text-white mb-2">{sec.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{sec.body}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 px-6 py-4 bg-white/3">
            <p className="text-xs text-gray-600">
              This is a simplified preview. The full PageAI version includes 6–10 sections, SEO keywords, cultural localization, and 4-language simultaneous output.
            </p>
          </div>
        </div>
      )}

      {!generated && (
        <div className="text-center py-10 text-gray-600 text-sm">
          Enter your product name and click Generate Preview.
        </div>
      )}
    </div>
  )
}
