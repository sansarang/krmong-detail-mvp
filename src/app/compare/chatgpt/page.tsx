import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PageAI vs ChatGPT — 글로벌 상세페이지 생성 비교 | PageAI',
  description: 'PageAI와 ChatGPT의 상세페이지 생성 능력을 마켓별 최적화, 금칙어 제거, 4개 언어 지원, 생성 시간, 가격 항목으로 직접 비교합니다.',
  keywords: ['PageAI vs ChatGPT', 'AI 상세페이지 비교', '스마트스토어 AI', '쿠팡 AI 글쓰기', 'Amazon JP 상품 페이지 AI'],
  alternates: { canonical: 'https://pagebeer.beer/compare/chatgpt' },
  openGraph: {
    title: 'PageAI vs ChatGPT — 글로벌 상세페이지 생성 비교',
    description: '마켓별 최적화부터 금칙어 제거까지 항목별 직접 비교',
    url: 'https://pagebeer.beer/compare/chatgpt',
  },
}

const rows = [
  { label: '마켓별 최적화',         pageai: '스마트스토어·쿠팡·Amazon JP·Tmall·Shopify 전용 포맷 자동 적용', chatgpt: '일반 텍스트 생성 — 플랫폼 규칙 미반영' },
  { label: '4개 언어 동시 생성',    pageai: '한·영·일·중 1클릭 동시 생성 (문화 현지화 포함)', chatgpt: '수동 번역 요청 필요, 현지화 수준 낮음' },
  { label: '금칙어 자동 제거',       pageai: '스마트스토어·쿠팡·Amazon·Tmall 금칙어 자동 감지 및 대체', chatgpt: '금칙어 규칙 미학습 — 직접 검토 필요' },
  { label: '플랫폼 포맷 자동 적용', pageai: 'Amazon A+, Tmall 爆款, 楽天 スタイル 자동 적용', chatgpt: '포맷 없음 — 직접 프롬프트 설계 필요' },
  { label: 'Amazon A+ 지원',        pageai: '✅ A+ Content 구조 자동 생성', chatgpt: '❌ A+ 특화 학습 없음' },
  { label: '가격',                   pageai: '무료 플랜 제공 (월 3개)', chatgpt: 'ChatGPT Plus $20/월 (범용)' },
  { label: '완성 시간',              pageai: '단일 언어 약 20초 / 4개 언어 약 90초', chatgpt: '수동 프롬프트 작성 + 반복 수정 필요 (30~60분)' },
]

export default function CompareChatGptKoPage() {
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
            <Link href="/compare/outsourcing" className="text-xs text-gray-400 hover:text-white transition-colors">AI vs 외주</Link>
            <Link href="/en/compare/chatgpt" className="text-xs text-gray-400 hover:text-white transition-colors">EN</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">무료 시작</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full mb-4 inline-block">비교 분석</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            PageAI vs ChatGPT<br />
            <span className="text-blue-400">글로벌 상세페이지 생성 비교</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">범용 AI와 EC 전문 AI의 차이 — 7가지 핵심 항목으로 직접 비교합니다.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/8 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 font-bold w-1/4">비교 항목</th>
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

        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: '⚡', title: '95% 시간 단축', desc: '30분 걸리던 상세페이지 작업이 90초로' },
            { icon: '🌏', title: '4개 언어 동시', desc: '한·영·일·중 문화 현지화까지 자동 처리' },
            { icon: '🛡️', title: '금칙어 0건', desc: '플랫폼 규칙 위반 없이 바로 업로드' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-black text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">직접 비교해보세요</h2>
          <p className="text-gray-400 mb-6 text-sm">무료 플랜으로 지금 바로 상세페이지 생성 — 신용카드 불필요</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
          >
            PageAI 무료로 시작하기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
