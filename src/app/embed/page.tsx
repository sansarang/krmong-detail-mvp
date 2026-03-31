import type { Metadata } from 'next'
import Link from 'next/link'
import EmbedCopyClient from './EmbedCopyClient'

export const metadata: Metadata = {
  title: '무료 금칙어 검사 위젯 — 내 사이트에 설치하기 | PageAI',
  description: '스마트스토어·쿠팡·Amazon 금칙어 검사 위젯을 내 블로그/사이트에 무료로 설치하세요. iframe 한 줄이면 끝.',
  keywords: ['금칙어 검사 위젯', '상세페이지 도구', '금칙어 검사기 설치', '스마트스토어 위젯'],
  alternates: {
    canonical: 'https://pagebeer.beer/embed',
    languages: { 'en': 'https://pagebeer.beer/en/embed' },
  },
}

export default function EmbedKoPage() {
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
            <Link href="/en/embed" className="text-xs text-gray-400 hover:text-white transition-colors">EN</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">무료 시작</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">무료 위젯</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            무료 금칙어 검사 위젯<br />
            <span className="text-blue-400">내 사이트에 설치하기</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">블로그, 쇼핑몰, 판매자 커뮤니티에 금칙어 검사기를 무료로 삽입하세요. 코드 한 줄로 설치 완료.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <div>
            <h2 className="font-black text-white mb-6 text-lg">방법 1 — iframe 삽입</h2>
            <p className="text-xs text-gray-400 mb-3">게시글, 블로그 본문, HTML 페이지 어디에나 삽입 가능합니다.</p>
            <EmbedCopyClient
              label="iframe 코드 복사"
              code={`<iframe\n  src="https://pagebeer.beer/widget/keyword-checker"\n  width="100%"\n  height="420"\n  style="border:none;border-radius:12px"\n  allow="clipboard-write"\n></iframe>`}
            />

            <h2 className="font-black text-white mb-4 text-lg mt-10">방법 2 — 플로팅 버튼 스크립트</h2>
            <p className="text-xs text-gray-400 mb-3">사이트 어디서든 우측 하단에 "금칙어 검사" 버튼이 뜨고, 클릭하면 팝업으로 열립니다.</p>
            <EmbedCopyClient
              label="script 코드 복사"
              code={`<script src="https://pagebeer.beer/widget.js"></script>`}
            />
          </div>

          <div>
            <h2 className="font-black text-white mb-4 text-lg">미리보기</h2>
            <div className="rounded-2xl overflow-hidden border border-white/8" style={{ height: '420px' }}>
              <iframe
                src="/widget/keyword-checker"
                width="100%"
                height="420"
                style={{ border: 'none' }}
                title="금칙어 검사 위젯 미리보기"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-12">
          <h3 className="font-black text-white mb-3">위젯 기능</h3>
          <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-400">
            {['한국어 / 영어 전환 가능', '실시간 금칙어 감지 및 하이라이트', '대체 단어 자동 추천', '"Powered by PageAI" 링크 항상 표시', '모바일 완전 호환', '추가 JS 의존성 없음'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">직접 만들어보세요</h2>
          <p className="text-gray-400 mb-6 text-sm">PageAI로 금칙어 없는 상세페이지를 5분 만에 자동 생성</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm">
            PageAI로 상세페이지 자동 생성하기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
