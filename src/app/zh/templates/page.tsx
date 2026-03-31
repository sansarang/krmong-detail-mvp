import type { Metadata } from 'next'
import Link from 'next/link'
import EnTemplateDownloadClient from '@/app/en/templates/EnTemplateDownloadClient'

export const metadata: Metadata = {
  title: '免费商品详情页模板 — 天猫·Amazon·Shopify | PageAI',
  description: '天猫、Amazon、Shopify、乐天商品详情页模板4套，输入邮箱免费下载。专业级模板助您快速上架。',
  keywords: ['天猫详情页模板免费', 'Amazon商品页面模板', 'Shopify商品描述模板', '乐天模板下载'],
  alternates: { canonical: 'https://pagebeer.beer/zh/templates' },
}

export default function TemplatesZhPage() {
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
            <Link href="/ja/templates" className="hover:text-white transition-colors">JA</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">免费开始</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-violet-500/15 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full mb-4 inline-block">免费下载</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            免费商品详情页模板<br />
            <span className="text-violet-400">天猫·Amazon·Shopify</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">4套专业级商品详情页模板，输入邮箱即可免费下载，助您快速打造爆款商品页面。</p>
        </div>

        <EnTemplateDownloadClient />

        <div className="mt-16 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">无需模板 — 5分钟自动生成</h2>
          <p className="text-gray-400 mb-6 text-sm">只需输入商品信息，PageAI自动生成天猫·Amazon·Shopify·乐天详情页，支持4语言同步。</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm">
            用PageAI生成自定义模板 →
          </Link>
        </div>
      </div>
    </main>
  )
}
