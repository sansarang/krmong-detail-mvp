import type { Metadata } from 'next'
import Link from 'next/link'
import EnTemplateDownloadClient from './EnTemplateDownloadClient'

export const metadata: Metadata = {
  title: 'Free Product Page Templates — Amazon JP, Shopify, Tmall, Rakuten | PageAI',
  description: 'Download 4 free product page templates for Amazon JP, Shopify, Tmall, and Rakuten. Enter email to get instant access.',
  keywords: ['Amazon product page template free', 'Shopify product description template', 'Tmall listing template', 'Rakuten template download'],
  alternates: {
    canonical: 'https://pagebeer.beer/en/templates',
    languages: { 'ko': 'https://pagebeer.beer/templates' },
  },
  openGraph: {
    title: 'Free Product Page Templates — Amazon JP, Shopify, Tmall, Rakuten',
    description: '4 free professional templates for global e-commerce platforms',
    url: 'https://pagebeer.beer/en/templates',
  },
}

export default function TemplatesEnPage() {
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
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link href="/templates" className="hover:text-white transition-colors">KO</Link>
            <Link href="/ja/templates" className="hover:text-white transition-colors">JA</Link>
            <Link href="/zh/templates" className="hover:text-white transition-colors">ZH</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-violet-500/15 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full mb-4 inline-block">Free Download</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Free Product Page Templates<br />
            <span className="text-violet-400">Amazon JP, Shopify, Tmall, Rakuten</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Professional-grade templates for global e-commerce platforms. Enter your email to download instantly.</p>
        </div>

        <EnTemplateDownloadClient />

        <div className="mt-16 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Skip the template — generate in 5 min</h2>
          <p className="text-gray-400 mb-6 text-sm">Just enter your product info. PageAI auto-generates Amazon JP · Shopify · Tmall · Rakuten pages in all 4 languages.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm">
            Generate Custom Templates with PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
