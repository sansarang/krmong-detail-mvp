import type { Metadata } from 'next'
import Link from 'next/link'
import TemplateDownloadClient from './TemplateDownloadClient'

export const metadata: Metadata = {
  title: '스마트스토어·쿠팡·Amazon 상세페이지 템플릿 무료 다운로드 | PageAI',
  description: '스마트스토어 뷰티, 쿠팡 전자기기, Amazon JP 식품, 네이버 블로그 리뷰 템플릿을 이메일 입력 후 무료로 다운로드하세요.',
  keywords: ['상세페이지 템플릿 무료', '스마트스토어 템플릿', '쿠팡 상세페이지 양식', 'Amazon JP 템플릿'],
  alternates: {
    canonical: 'https://pagebeer.beer/templates',
    languages: {
      'en': 'https://pagebeer.beer/en/templates',
      'ja': 'https://pagebeer.beer/ja/templates',
      'zh': 'https://pagebeer.beer/zh/templates',
    },
  },
  openGraph: {
    title: '상세페이지 템플릿 무료 다운로드',
    description: '스마트스토어·쿠팡·Amazon JP 템플릿 4종 무료 제공',
    url: 'https://pagebeer.beer/templates',
  },
}

export default function TemplatesKoPage() {
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
            <Link href="/en/templates" className="hover:text-white transition-colors">EN</Link>
            <Link href="/ja/templates" className="hover:text-white transition-colors">JA</Link>
            <Link href="/zh/templates" className="hover:text-white transition-colors">ZH</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">무료 시작</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-violet-500/15 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full mb-4 inline-block">무료 다운로드</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            스마트스토어·쿠팡·Amazon<br />
            <span className="text-violet-400">상세페이지 템플릿 무료 다운로드</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">전문가가 만든 상세페이지 템플릿 4종을 이메일 입력 후 무료로 받아가세요.</p>
        </div>

        <TemplateDownloadClient />

        <div className="mt-16 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">템플릿 없이도 5분이면 완성</h2>
          <p className="text-gray-400 mb-6 text-sm">PageAI로 제품 정보만 입력하면 스마트스토어·쿠팡·Amazon JP·Tmall 상세페이지를 자동 생성</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
          >
            PageAI로 템플릿 자동 생성하기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
