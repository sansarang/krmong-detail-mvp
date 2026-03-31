import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQ_EN } from '@/lib/faqData'

export const metadata: Metadata = {
  title: 'Product Page FAQ — Amazon JP, Shopify, Tmall | PageAI',
  description: 'Frequently asked questions about AI product page generation for Amazon JP, Shopify, Tmall, and Rakuten. Multilingual support, prohibited words, and more.',
  keywords: ['Amazon JP product page', 'Shopify product description', 'AI product generator FAQ', 'Tmall listing', 'cross-border ecommerce'],
  alternates: {
    canonical: 'https://pagebeer.beer/en/faq',
    languages: {
      'ko': 'https://pagebeer.beer/faq',
      'ja': 'https://pagebeer.beer/ja/faq',
      'zh': 'https://pagebeer.beer/zh/faq',
    },
  },
  openGraph: {
    title: 'Product Page Generator FAQ — Amazon JP, Shopify, Tmall, Rakuten',
    description: '15 FAQs about AI product page generation for global platforms',
    url: 'https://pagebeer.beer/en/faq',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_EN.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function FaqEnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#0B1120] text-white">
        <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0B1120]/95 backdrop-blur z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-[10px] font-black">AI</span>
              </div>
              <span className="font-black text-white text-sm">PageAI</span>
            </Link>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <Link href="/faq" className="hover:text-white transition-colors">KO</Link>
              <Link href="/ja/faq" className="hover:text-white transition-colors">JA</Link>
              <Link href="/zh/faq" className="hover:text-white transition-colors">ZH</Link>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">Start Free</Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">FAQ</span>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Product Page Generator FAQ<br />
              <span className="text-blue-400">Amazon, Shopify, Tmall, Rakuten</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to know about AI-powered product page generation for global e-commerce platforms.</p>
          </div>

          <div className="space-y-3">
            {FAQ_EN.map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none hover:bg-white/5 transition-colors">
                  <span className="font-bold text-white text-sm pr-4">{item.q}</span>
                  <span className="text-blue-400 text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">{item.a}</div>
              </details>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-black text-white mb-3">Start generating in 5 minutes</h2>
            <p className="text-gray-400 mb-6 text-sm">Amazon JP · Shopify · Tmall · Rakuten product pages, all 4 languages at once</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
            >
              Generate Your Product Page with PageAI →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
