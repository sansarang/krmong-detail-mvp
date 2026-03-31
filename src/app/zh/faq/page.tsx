import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQ_ZH } from '@/lib/faqData'

export const metadata: Metadata = {
  title: '商品详情页FAQ — 天猫·Amazon·Shopify | PageAI',
  description: '关于天猫、Amazon、Shopify商品详情页AI自动生成的常见问题15个。多语言支持、违禁词过滤、生成速度等详细解答。',
  keywords: ['天猫详情页', 'Amazon商品页面', 'AI商品描述生成', 'Shopify独立站', '跨境电商内容'],
  alternates: {
    canonical: 'https://pagebeer.beer/zh/faq',
    languages: {
      'ko': 'https://pagebeer.beer/faq',
      'en': 'https://pagebeer.beer/en/faq',
      'ja': 'https://pagebeer.beer/ja/faq',
    },
  },
  openGraph: {
    title: '商品详情页自动生成 常见问题 — 天猫·Amazon·Shopify',
    description: 'AI商品详情页生成常见问题15个',
    url: 'https://pagebeer.beer/zh/faq',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ZH.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function FaqZhPage() {
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
              <Link href="/en/faq" className="hover:text-white transition-colors">EN</Link>
              <Link href="/ja/faq" className="hover:text-white transition-colors">JA</Link>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">免费开始</Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">常见问题</span>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              商品详情页自动生成<br />
              <span className="text-blue-400">常见问题 — 天猫·Amazon·Shopify</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">关于AI商品详情页生成、多语言支持、违禁词过滤的常见问题解答。</p>
          </div>

          <div className="space-y-3">
            {FAQ_ZH.map((item, i) => (
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
            <h2 className="text-2xl font-black text-white mb-3">立即5分钟开始生成</h2>
            <p className="text-gray-400 mb-6 text-sm">天猫·Amazon·Shopify·楽天 商品详情页，4种语言同时生成</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
            >
              用PageAI自动生成商品详情页 →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
