import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Product Page vs Outsourcing — Cost, Speed, Quality | PageAI',
  description: 'Compare AI product page generation vs outsourcing: cost savings up to 95%, 200x faster, supports 10+ platforms. Data-driven comparison for e-commerce sellers.',
  keywords: ['AI product page vs outsourcing', 'product description outsourcing cost', 'AI listing generator savings', 'ecommerce content automation'],
  alternates: { canonical: 'https://pagebeer.beer/en/compare/outsourcing' },
  openGraph: {
    title: 'AI Product Page vs Outsourcing — Cost, Speed, Quality Comparison',
    description: 'Save 95% vs outsourcing with AI product page generation',
    url: 'https://pagebeer.beer/en/compare/outsourcing',
  },
}

const rows = [
  { label: 'Cost',              ai: 'Monthly flat fee (free plan available)', outsource: '$50–$300+ per listing' },
  { label: 'Time to Deliver',   ai: '90 seconds (4 languages simultaneously)', outsource: '3–7 business days (single language)' },
  { label: 'Language Support',  ai: 'KO · EN · JA · ZH simultaneously', outsource: 'Separate cost per language' },
  { label: 'Platform Support',  ai: 'Smartstore · Coupang · Amazon JP · Tmall · Shopify + 10 more', outsource: 'Platform specialist required per platform' },
  { label: 'Revisions',         ai: 'Unlimited regeneration', outsource: '1–2 rounds included; additional cost after' },
  { label: '24/7 Availability', ai: '✅ Generate anytime, instantly', outsource: '❌ Business hours only' },
  { label: 'Prohibited Words',  ai: '✅ Auto-detected and replaced', outsource: 'Manual review required (risk of missing)' },
]

export default function CompareEnOutsourcingPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-white">
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0B1120]/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">AI</span>
            </div>
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/en/compare/chatgpt" className="text-xs text-gray-400 hover:text-white transition-colors">AI vs ChatGPT</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1 rounded-full mb-4 inline-block">Cost Comparison</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            AI Product Page vs Outsourcing<br />
            <span className="text-green-400">Cost, Speed, Quality Comparison</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Real numbers: what you save by switching from outsourcing to AI product page generation.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { value: '95%', label: 'Cost Savings', sub: 'vs typical outsourcing', color: 'text-green-400' },
            { value: '200×', label: 'Faster', sub: '3 days → 90 seconds', color: 'text-blue-400' },
            { value: '10+', label: 'Platforms', sub: 'Smartstore to Lazada', color: 'text-violet-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6 text-center">
              <div className={`text-4xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="font-bold text-white mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/8 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 font-bold w-1/4">Category</th>
                <th className="text-left px-6 py-4 font-black text-green-400 w-3/8">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[9px] font-black text-white">AI</span>
                    PageAI
                  </span>
                </th>
                <th className="text-left px-6 py-4 font-bold text-gray-300 w-3/8">Outsourcing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                  <td className="px-6 py-4 font-bold text-white text-xs">{row.label}</td>
                  <td className="px-6 py-4 text-green-400 text-xs leading-relaxed">{row.ai}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs leading-relaxed">{row.outsource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Save 95% starting today</h2>
          <p className="text-gray-400 mb-6 text-sm">Free plan · Generate Amazon JP, Shopify, Tmall in 90 seconds</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Save 95% vs Outsourcing with PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
