import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PageAI vs ChatGPT — 天猫·Amazon 商品详情页生成对比 | PageAI',
  description: 'PageAI与ChatGPT天猫、Amazon、Shopify商品详情页生成能力对比。平台优化、4语言同步生成、违禁词过滤等7个维度详细对比。',
  keywords: ['PageAI vs ChatGPT', 'AI商品详情页对比', '天猫详情页AI', 'Amazon商品页面AI'],
  alternates: { canonical: 'https://pagebeer.beer/zh/compare/chatgpt' },
}

const rows = [
  { label: '平台优化',       pageai: '自动适用天猫、Amazon JP A+、Shopify、乐天等专属格式', chatgpt: '通用文本生成 — 未针对平台规则优化' },
  { label: '4语言同步生成',  pageai: '一键生成韩·英·日·中，含文化本地化', chatgpt: '需手动发送翻译请求，本地化质量较低' },
  { label: '违禁词自动过滤', pageai: '自动检测天猫、Amazon、Shopify违禁词并替换', chatgpt: '未学习平台规则 — 需人工审查' },
  { label: 'Amazon A+支持',  pageai: '✅ 自动生成A+ Content格式', chatgpt: '❌ 无A+专项训练' },
  { label: '价格',           pageai: '免费计划（每月3个），付费计划可选', chatgpt: 'ChatGPT Plus $20/月（通用）' },
  { label: '完成时间',       pageai: '单语言约20秒 / 4语言约90秒', chatgpt: '手动提示词+反复修改需30-60分钟' },
  { label: '跨境电商支持',   pageai: '支持10+全球平台', chatgpt: '每次需重新设计提示词' },
]

export default function CompareZhChatgptPage() {
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
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">免费开始</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full mb-4 inline-block">对比分析</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            PageAI vs ChatGPT<br />
            <span className="text-blue-400">天猫·Amazon 商品详情页生成对比</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">通用AI与电商专用AI的差异 — 7个核心维度直接对比。</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/8 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 font-bold w-1/4">对比项目</th>
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
          <h2 className="text-2xl font-black text-white mb-3">立即免费体验</h2>
          <p className="text-gray-400 mb-6 text-sm">天猫·Amazon·Shopify·乐天 商品详情页，90秒4语言同步生成</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm">
            免费开始使用PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
