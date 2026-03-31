import type { Metadata } from 'next'
import Link from 'next/link'
import EnKeywordCheckerClient from './EnKeywordCheckerClient'

export const metadata: Metadata = {
  title: 'Amazon & Shopify Prohibited Words Checker — Free | PageAI',
  description: 'Instantly detect prohibited and restricted words in your Amazon, Shopify, and Tmall product listings. Free real-time checker with replacement suggestions.',
  keywords: ['Amazon prohibited words checker', 'Shopify restricted words', 'product listing compliance', 'Amazon listing rules', 'free keyword checker ecommerce'],
  alternates: { canonical: 'https://pagebeer.beer/en/tools/keyword-checker' },
  openGraph: {
    title: 'Amazon & Shopify Prohibited Words Checker — Free',
    description: 'Paste your listing text and instantly detect restricted words.',
    url: 'https://pagebeer.beer/en/tools/keyword-checker',
  },
}

export default function EnKeywordCheckerPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/en/tools/description-generator" className="text-xs text-gray-500 hover:text-white transition-colors">Description Generator</Link>
            <Link href="/login" className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">Start Free</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <span className="text-xs font-black bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1 rounded-full mb-4 inline-block">
            Free Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Amazon & Shopify Prohibited<br />Words Checker — Free
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            Paste your product listing and we&apos;ll instantly flag restricted words with safer replacement suggestions.
          </p>
        </div>

        <EnKeywordCheckerClient />

        <div className="mt-14 text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10">
          <h2 className="text-xl font-black text-white mb-3">Generate Compliant Listings from Scratch</h2>
          <p className="text-gray-400 text-sm mb-6">PageAI writes listings that are already compliant — no prohibited words, fully optimized for Amazon JP, Shopify, Tmall, and Rakuten.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-500/30">
            Generate Compliant Listing with PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
