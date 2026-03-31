import type { Metadata } from 'next'
import Link from 'next/link'
import DescriptionGeneratorClient from './DescriptionGeneratorClient'

export const metadata: Metadata = {
  title: 'Free AI Product Description Generator — Amazon, Shopify, Tmall | PageAI',
  description: 'Generate a free AI product description preview for Amazon JP, Shopify, Tmall, and Rakuten. Enter your product name and features — see your listing instantly.',
  keywords: ['free AI product description generator', 'Amazon listing generator free', 'Shopify product description AI', 'Tmall listing writer', 'product page generator online'],
  alternates: { canonical: 'https://pagebeer.beer/en/tools/description-generator' },
  openGraph: {
    title: 'Free AI Product Description Generator — Amazon, Shopify, Tmall',
    description: 'Preview AI-generated product descriptions for top global marketplaces.',
    url: 'https://pagebeer.beer/en/tools/description-generator',
  },
}

export default function DescriptionGeneratorPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/en/tools/keyword-checker" className="text-xs text-gray-500 hover:text-white transition-colors">Keyword Checker</Link>
            <Link href="/login" className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">Start Free</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <span className="text-xs font-black bg-violet-500/15 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full mb-4 inline-block">
            Free Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Free AI Product Description<br />Generator — Amazon, Shopify, Tmall
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            Enter your product name and key features, choose a marketplace, and preview an AI-generated listing instantly.
          </p>
        </div>

        <DescriptionGeneratorClient />

        <div className="mt-14 text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10">
          <h2 className="text-xl font-black text-white mb-3">Get the Full Version — 4 Languages, All Platforms</h2>
          <p className="text-gray-400 text-sm mb-2">PageAI generates complete, platform-optimized product pages in Korean, English, Japanese, and Chinese — simultaneously.</p>
          <p className="text-gray-500 text-xs mb-6">Amazon JP · Tmall · Rakuten · Shopify · Smartstore · Coupang</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-500/30">
            Generate Full Version with PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
