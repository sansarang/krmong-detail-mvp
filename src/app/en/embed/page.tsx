import type { Metadata } from 'next'
import Link from 'next/link'
import EmbedCopyClient from '@/app/embed/EmbedCopyClient'

export const metadata: Metadata = {
  title: 'Free Prohibited Words Checker Widget — Embed on Your Site | PageAI',
  description: 'Embed a free Amazon & Shopify prohibited words checker widget on your blog or website. One line of code, instant installation.',
  keywords: ['prohibited words checker widget', 'Amazon listing widget', 'Shopify compliance widget', 'embed keyword checker'],
  alternates: { canonical: 'https://pagebeer.beer/en/embed', languages: { 'ko': 'https://pagebeer.beer/embed' } },
}

export default function EmbedEnPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-white">
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0B1120]/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">AI</span>
            </div>
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/embed" className="text-xs text-gray-400 hover:text-white transition-colors">KO</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">Free Widget</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            Free Prohibited Words Checker Widget<br />
            <span className="text-blue-400">Embed on Your Site</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">Add a free Amazon & Shopify prohibited words checker to your blog or e-commerce site. One line of code, works everywhere.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <div>
            <h2 className="font-black text-white mb-4 text-lg">Option 1 — iframe Embed</h2>
            <p className="text-xs text-gray-400 mb-3">Works in blog posts, HTML pages, or any site that allows iframe embeds.</p>
            <EmbedCopyClient
              label="Copy iframe code"
              code={`<iframe\n  src="https://pagebeer.beer/widget/keyword-checker"\n  width="100%"\n  height="420"\n  style="border:none;border-radius:12px"\n  allow="clipboard-write"\n></iframe>`}
            />

            <h2 className="font-black text-white mb-4 text-lg mt-10">Option 2 — Floating Button Script</h2>
            <p className="text-xs text-gray-400 mb-3">Adds a persistent "Prohibited Words" floating button in the bottom-right of your site. Click to open as a popup.</p>
            <EmbedCopyClient
              label="Copy script tag"
              code={`<script src="https://pagebeer.beer/widget.js"></script>`}
            />
          </div>

          <div>
            <h2 className="font-black text-white mb-4 text-lg">Live Preview</h2>
            <div className="rounded-2xl overflow-hidden border border-white/8" style={{ height: '420px' }}>
              <iframe src="/widget/keyword-checker" width="100%" height="420" style={{ border: 'none' }} title="Widget preview" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-12">
          <h3 className="font-black text-white mb-3">Widget Features</h3>
          <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-400">
            {['Korean / English language toggle','Real-time prohibited word detection + highlight','Alternative word suggestions','Persistent "Powered by PageAI" credit link','Mobile-friendly','No external JS dependencies'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Generate compliant listings with AI</h2>
          <p className="text-gray-400 mb-6 text-sm">PageAI auto-removes prohibited words and generates Amazon JP, Shopify, Tmall listings in 90 seconds</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm">
            Generate Compliant Listing with PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
