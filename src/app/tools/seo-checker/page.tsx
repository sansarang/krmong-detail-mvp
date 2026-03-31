import type { Metadata } from 'next'
import Link from 'next/link'
import SeoCheckerClient from './SeoCheckerClient'

export const metadata: Metadata = {
  title: '상세페이지 SEO 점수 체커 — 무료 | PageAI',
  description: '스마트스토어·쿠팡 상세페이지의 SEO 최적화 점수를 즉시 분석해드립니다. 글자수·키워드·CTA·수치 포함 여부 등 5가지 항목 자동 분석.',
  keywords: ['상세페이지 SEO 점수', '스마트스토어 글 최적화', '쿠팡 상세페이지 최적화 방법', 'SEO 체커 무료'],
  alternates: { canonical: 'https://pagebeer.beer/tools/seo-checker' },
  openGraph: {
    title: '상세페이지 SEO 점수 체커 — 무료',
    description: '상세페이지 글의 SEO 점수를 5가지 항목으로 즉시 분석해드립니다.',
    url: 'https://pagebeer.beer/tools/seo-checker',
  },
}

export default function SeoCheckerPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tools/keyword-checker" className="text-xs text-gray-500 hover:text-white transition-colors">금칙어 검사기</Link>
            <Link href="/login" className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">무료 시작</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <span className="text-xs font-black bg-violet-500/15 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full mb-4 inline-block">
            무료 도구
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            상세페이지 SEO 점수 체커<br />— 무료
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            상세페이지 글을 붙여넣으면 5가지 SEO 항목을 분석해 총점과 개선 방법을 알려드립니다.
          </p>
        </div>

        <SeoCheckerClient />

        <div className="mt-14 text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10">
          <h2 className="text-xl font-black text-white mb-3">처음부터 SEO 최적화된 글을 AI가 자동 생성</h2>
          <p className="text-gray-400 text-sm mb-6">PageAI는 검색 노출, 전환율, 금칙어 방지까지 모두 고려한 상세페이지를 5분 안에 완성해드립니다.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-500/30">
            PageAI로 SEO 최적화 글 자동 생성 →
          </Link>
        </div>
      </div>
    </main>
  )
}
