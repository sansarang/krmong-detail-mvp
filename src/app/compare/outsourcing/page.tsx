import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI 상세페이지 vs 외주 — 비용·시간·품질 글로벌 비교 | PageAI',
  description: 'AI 상세페이지 자동 생성과 외주 대행의 비용, 완성 시간, 언어 지원, 플랫폼 지원, 수정 횟수를 직접 비교합니다.',
  keywords: ['AI 상세페이지 외주 비교', '상세페이지 외주 비용', 'AI vs 대행사', '상세페이지 비용 절감'],
  alternates: { canonical: 'https://pagebeer.beer/compare/outsourcing' },
  openGraph: {
    title: 'AI 상세페이지 vs 외주 — 비용·시간·품질 비교',
    description: '외주 비용 95% 절감 — AI 상세페이지 생성으로',
    url: 'https://pagebeer.beer/compare/outsourcing',
  },
}

const rows = [
  { label: '비용',           ai: '월 정액 (무료 플랜 포함)', outsource: '건당 5만~30만원 이상' },
  { label: '완성 시간',      ai: '90초 (4개 언어 동시)', outsource: '3~7일 (단일 언어)' },
  { label: '언어 지원',      ai: '한·영·일·중 동시 생성', outsource: '언어별 별도 비용 발생' },
  { label: '플랫폼 지원',    ai: '스마트스토어·쿠팡·Amazon JP·Tmall·Shopify 등 10개+', outsource: '특정 플랫폼 전문가 추가 섭외 필요' },
  { label: '수정 횟수',      ai: '무제한 재생성', outsource: '1~2회 수정 포함, 이후 추가 비용' },
  { label: '24시간 이용',    ai: '✅ 연중무휴 즉시 생성', outsource: '❌ 업무 시간 외 불가' },
  { label: '금칙어 처리',    ai: '✅ 자동 제거', outsource: '별도 검수 필요 (누락 위험)' },
]

export default function CompareOutsourcingKoPage() {
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
            <Link href="/compare/chatgpt" className="text-xs text-gray-400 hover:text-white transition-colors">AI vs ChatGPT</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">무료 시작</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1 rounded-full mb-4 inline-block">비용 비교</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            AI 상세페이지 vs 외주<br />
            <span className="text-green-400">비용·시간·품질 글로벌 비교</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">외주 대행사에 맡기는 것과 AI로 직접 생성하는 것, 숫자로 직접 비교합니다.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { value: '95%', label: '비용 절감', sub: '외주 대비 평균 절감율', color: 'text-green-400' },
            { value: '200x', label: '빠른 속도', sub: '3일 → 90초', color: 'text-blue-400' },
            { value: '10+', label: '플랫폼 지원', sub: '스마트스토어~Lazada', color: 'text-violet-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6 text-center">
              <div className={`text-4xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="font-bold text-white mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/8 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 font-bold w-1/4">비교 항목</th>
                <th className="text-left px-6 py-4 font-black text-green-400 w-3/8">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[9px] font-black text-white">AI</span>
                    PageAI
                  </span>
                </th>
                <th className="text-left px-6 py-4 font-bold text-gray-300 w-3/8">외주 대행</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                  <td className="px-6 py-4 font-bold text-white text-xs">{row.label}</td>
                  <td className="px-6 py-4 text-green-400 text-xs leading-relaxed">{row.ai}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs leading-relaxed">{row.outsource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">외주 비용을 95% 줄이세요</h2>
          <p className="text-gray-400 mb-6 text-sm">지금 무료로 시작 — 스마트스토어, 쿠팡, Amazon JP 즉시 생성</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black px-8 py-4 rounded-xl transition-colors text-sm"
          >
            PageAI로 외주 비용 95% 절감 →
          </Link>
        </div>
      </div>
    </main>
  )
}
