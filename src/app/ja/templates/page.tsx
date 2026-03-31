import type { Metadata } from 'next'
import Link from 'next/link'
import EnTemplateDownloadClient from '@/app/en/templates/EnTemplateDownloadClient'

export const metadata: Metadata = {
  title: '無料商品ページテンプレート — Amazon JP・楽天・Shopify | PageAI',
  description: 'Amazon JP、楽天、Tmall、Shopifyの商品ページテンプレート4種をメールアドレス入力で無料ダウンロード。プロ品質のテンプレートで売上アップ。',
  keywords: ['Amazon JP テンプレート 無料', '楽天 商品ページ テンプレート', 'Shopify 商品説明 テンプレート', 'Tmall テンプレート'],
  alternates: { canonical: 'https://pagebeer.beer/ja/templates' },
}

export default function TemplatesJaPage() {
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
            <Link href="/en/templates" className="hover:text-white transition-colors">EN</Link>
            <Link href="/zh/templates" className="hover:text-white transition-colors">ZH</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">無料で始める</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-violet-500/15 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full mb-4 inline-block">無料ダウンロード</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            無料商品ページテンプレート<br />
            <span className="text-violet-400">Amazon JP・楽天・Shopify</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">プロ品質の商品ページテンプレート4種をメールアドレス入力で無料ダウンロード。</p>
        </div>

        <EnTemplateDownloadClient />

        <div className="mt-16 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">テンプレート不要 — 5分で自動生成</h2>
          <p className="text-gray-400 mb-6 text-sm">商品情報を入力するだけ。Amazon JP・楽天・Tmall・Shopifyの商品ページを4言語同時に自動生成。</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm">
            PageAIでカスタムテンプレートを生成 →
          </Link>
        </div>
      </div>
    </main>
  )
}
