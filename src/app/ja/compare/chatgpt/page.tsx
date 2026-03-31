import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PageAI vs ChatGPT — Amazon JP・楽天 商品ページ生成 比較 | PageAI',
  description: 'PageAIとChatGPTのAmazon JP・楽天・Tmall商品ページ生成能力を比較。プラットフォーム最適化、4言語同時生成、禁止ワード除去など7項目で詳細比較。',
  keywords: ['PageAI vs ChatGPT', 'AI 商品ページ 比較', 'Amazon JP 商品ページ AI', '楽天 商品説明 AI'],
  alternates: {
    canonical: 'https://pagebeer.beer/ja/compare/chatgpt',
    languages: { 'ko': 'https://pagebeer.beer/compare/chatgpt', 'en': 'https://pagebeer.beer/en/compare/chatgpt' },
  },
}

const rows = [
  { label: 'プラットフォーム最適化', pageai: 'Amazon JP A+、楽天、Tmall、Shopifyの専用フォーマット自動適用', chatgpt: '汎用テキスト生成 — プラットフォームルール未対応' },
  { label: '4言語同時生成',          pageai: '韓・英・日・中を1クリックで文化ローカライズ込み同時生成', chatgpt: '手動翻訳リクエスト必要、ローカライズ品質低' },
  { label: '禁止ワード自動除去',      pageai: 'Amazon・楽天・Tmall禁止ワードを自動検出・代替', chatgpt: 'プラットフォームルール未学習 — 手動確認必要' },
  { label: 'Amazon A+対応',          pageai: '✅ A+ Contentフォーマット自動生成', chatgpt: '❌ A+特化学習なし' },
  { label: '価格',                   pageai: '無料プランあり（月3件）', chatgpt: 'ChatGPT Plus $20/月（汎用）' },
  { label: '完成時間',               pageai: '単一言語約20秒 / 4言語約90秒', chatgpt: '手動プロンプト＋修正で30〜60分' },
  { label: '越境EC対応',             pageai: '10以上のグローバルプラットフォーム対応', chatgpt: '個別プロンプト設計が毎回必要' },
]

export default function CompareJaChatgptPage() {
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
            <Link href="/compare/chatgpt" className="text-xs text-gray-400 hover:text-white transition-colors">KO</Link>
            <Link href="/en/compare/chatgpt" className="text-xs text-gray-400 hover:text-white transition-colors">EN</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">無料で始める</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full mb-4 inline-block">比較分析</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            PageAI vs ChatGPT<br />
            <span className="text-blue-400">Amazon JP・楽天 商品ページ生成 比較</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">汎用AIとEC専門AIの違い — 7つの重要項目で徹底比較します。</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/8 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 font-bold w-1/4">比較項目</th>
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

        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">今すぐ無料で試す</h2>
          <p className="text-gray-400 mb-6 text-sm">Amazon JP・楽天・Tmall・Shopifyの商品ページを90秒で4言語同時生成</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm">
            PageAIを無料で始める →
          </Link>
        </div>
      </div>
    </main>
  )
}
