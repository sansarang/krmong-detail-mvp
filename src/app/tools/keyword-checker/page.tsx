import type { Metadata } from 'next'
import Link from 'next/link'
import KeywordCheckerClient from './KeywordCheckerClient'

export const metadata: Metadata = {
  title: '스마트스토어·쿠팡 금칙어 검사기 — 무료 | PageAI',
  description: '스마트스토어·쿠팡 판매 금지 단어를 실시간으로 감지해드립니다. 텍스트 붙여넣기만 하면 금칙어 즉시 하이라이트 + 대체 단어 추천.',
  keywords: ['스마트스토어 금칙어', '쿠팡 금칙어 검사기', '상세페이지 금칙어', '온라인 쇼핑몰 금칙어'],
  alternates: { canonical: 'https://pagebeer.beer/tools/keyword-checker' },
  openGraph: {
    title: '스마트스토어·쿠팡 금칙어 검사기 — 무료',
    description: '상세페이지 글에서 금칙어를 즉시 찾아드립니다.',
    url: 'https://pagebeer.beer/tools/keyword-checker',
  },
}

export default function KeywordCheckerPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tools/seo-checker" className="text-xs text-gray-500 hover:text-white transition-colors">SEO 점수 체커</Link>
            <Link href="/login" className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">무료 시작</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <span className="text-xs font-black bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1 rounded-full mb-4 inline-block">
            무료 도구
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            스마트스토어·쿠팡<br />금칙어 검사기 — 무료
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            상세페이지 글을 붙여넣으면 금칙어를 실시간으로 감지하고 대체 단어를 추천해드립니다.
          </p>
        </div>

        <KeywordCheckerClient />

        <div className="mt-14 text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10">
          <h2 className="text-xl font-black text-white mb-3">금칙어 없는 상세페이지를 AI로 자동 생성</h2>
          <p className="text-gray-400 text-sm mb-6">PageAI는 처음부터 금칙어를 사용하지 않는 최적화된 상세페이지를 자동으로 작성해드립니다.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-500/30">
            PageAI로 금칙어 없는 글 자동 생성 →
          </Link>
        </div>
      </div>
    </main>
  )
}
