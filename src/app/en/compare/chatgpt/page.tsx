import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PageAI vs ChatGPT — Amazon, Shopify, Tmall Product Page | PageAI',
  description: 'Side-by-side comparison of PageAI vs ChatGPT for global e-commerce product page generation: platform optimization, 4-language output, prohibited words, and pricing.',
  keywords: ['PageAI vs ChatGPT', 'AI product description generator comparison', 'Amazon product page AI', 'Shopify product description AI'],
  alternates: {
    canonical: 'https://pagebeer.beer/en/compare/chatgpt',
    languages: { 'ko': 'https://pagebeer.beer/compare/chatgpt' },
  },
  openGraph: {
    title: 'PageAI vs ChatGPT — Global Product Description Generator Comparison',
    description: 'Platform optimization, 4-language output, prohibited words removal — compared',
    url: 'https://pagebeer.beer/en/compare/chatgpt',
  },
}

const rows = [
  { label: 'Platform Optimization', pageai: 'Auto-applies Smartstore, Coupang, Amazon JP A+, Tmall, Shopify formats', chatgpt: 'Generic text output — no platform-specific formatting' },
  { label: '4-Language Simultaneous', pageai: 'KO·EN·JA·ZH in 1 click with cultural localization', chatgpt: 'Manual translation prompts required, low localization quality' },
  { label: 'Prohibited Words Removal', pageai: 'Auto-detects Amazon, Shopify, Tmall prohibited words and replaces them', chatgpt: 'No platform rule training — manual review required' },
  { label: 'Platform Format Application', pageai: 'Amazon A+, Tmall 爆款, Rakuten style auto-applied', chatgpt: 'No format — manual prompt engineering required each time' },
  { label: 'Amazon A+ Support',         pageai: '✅ A+ Content structure auto-generated', chatgpt: '❌ No A+-specific training' },
  { label: 'Pricing',                   pageai: 'Free plan (3/month), paid plans available', chatgpt: 'ChatGPT Plus $20/month (general purpose)' },
  { label: 'Time to Complete',          pageai: 'Single language ~20s / 4 languages ~90s', chatgpt: 'Manual prompting + revisions needed (30–60 min)' },
]

export default function CompareEnChatgptPage() {
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
            <Link href="/en/compare/outsourcing" className="text-xs text-gray-400 hover:text-white transition-colors">AI vs Outsourcing</Link>
            <Link href="/compare/chatgpt" className="text-xs text-gray-400 hover:text-white transition-colors">KO</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full mb-4 inline-block">Comparison</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            PageAI vs ChatGPT<br />
            <span className="text-blue-400">Global Product Description Generator Comparison</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">E-commerce-specialized AI vs general-purpose AI — 7 key dimensions compared.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/8 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 font-bold w-1/4">Comparison</th>
                <th className="text-left px-6 py-4 font-black text-blue-400 w-3/8">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[9px] font-black text-white">AI</span>
                    PageAI
                  </span>
                </th>
                <th className="text-left px-6 py-4 font-bold text-gray-300 w-3/8">ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                  <td className="px-6 py-4 font-bold text-white text-xs">{row.label}</td>
                  <td className="px-6 py-4 text-green-400 text-xs leading-relaxed">{row.pageai}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs leading-relaxed">{row.chatgpt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: '⚡', title: '95% Faster', desc: '30-min manual work → 90 seconds' },
            { icon: '🌏', title: '4 Languages', desc: 'Cultural localization included' },
            { icon: '🛡️', title: 'Zero Violations', desc: 'Platform rules auto-enforced' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-black text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Try it yourself — free</h2>
          <p className="text-gray-400 mb-6 text-sm">Generate Amazon JP · Shopify · Tmall · Rakuten product pages in 90 seconds</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Start Free with PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
