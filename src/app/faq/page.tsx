import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQ_KO } from '@/lib/faqData'

export const metadata: Metadata = {
  title: '상세페이지 FAQ — 스마트스토어·쿠팡·Amazon 총정리 | PageAI',
  description: '스마트스토어, 쿠팡, Amazon JP, Tmall 상세페이지에 관한 자주 묻는 질문 15가지. AI 자동 생성, 금칙어, 다국어 지원까지 총정리.',
  keywords: ['스마트스토어 상세페이지', '쿠팡 상세페이지', 'Amazon 상품 페이지', '상세페이지 FAQ', 'AI 상세페이지 생성'],
  alternates: {
    canonical: 'https://pagebeer.beer/faq',
    languages: {
      'en': 'https://pagebeer.beer/en/faq',
      'ja': 'https://pagebeer.beer/ja/faq',
      'zh': 'https://pagebeer.beer/zh/faq',
    },
  },
  openGraph: {
    title: '상세페이지 FAQ — 스마트스토어·쿠팡·Amazon 총정리',
    description: 'AI 상세페이지 생성에 관한 자주 묻는 질문 15가지',
    url: 'https://pagebeer.beer/faq',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_KO.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function FaqKoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#0B1120] text-white">
        <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0B1120]/95 backdrop-blur z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-[10px] font-black">AI</span>
              </div>
              <span className="font-black text-white text-sm">PageAI</span>
            </Link>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <Link href="/en/faq" className="hover:text-white transition-colors">EN</Link>
              <Link href="/ja/faq" className="hover:text-white transition-colors">JA</Link>
              <Link href="/zh/faq" className="hover:text-white transition-colors">ZH</Link>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">무료 시작</Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">FAQ</span>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              스마트스토어·쿠팡·Amazon<br />상세페이지 자주 묻는 질문
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">AI 상세페이지 자동 생성, 금칙어 제거, 다국어 지원에 관한 궁금증을 해결해드립니다.</p>
          </div>

          <div className="space-y-3">
            {FAQ_KO.map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none hover:bg-white/5 transition-colors">
                  <span className="font-bold text-white text-sm pr-4">{item.q}</span>
                  <span className="text-blue-400 text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">{item.a}</div>
              </details>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-black text-white mb-3">지금 바로 시작해보세요</h2>
            <p className="text-gray-400 mb-6 text-sm">스마트스토어·쿠팡·Amazon JP·Tmall 상세페이지를 5분 만에 AI로 자동 생성</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
            >
              PageAI로 상세페이지 자동 생성하기 →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
