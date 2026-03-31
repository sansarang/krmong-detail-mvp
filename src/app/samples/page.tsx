import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '스마트스토어·쿠팡 상세페이지 샘플 모음 | PageAI 무료',
  description: '뷰티·식품·패션·전자기기 등 카테고리별 스마트스토어·쿠팡 상세페이지 무료 샘플. AI로 5분 만에 내 제품 상세페이지 자동 생성.',
  keywords: ['스마트스토어 상세페이지 샘플', '쿠팡 상세페이지 예시', 'AI 상세페이지 자동생성', '상세페이지 무료 샘플'],
  alternates: { canonical: 'https://pagebeer.beer/samples' },
  openGraph: {
    title: '카테고리별 상세페이지 샘플 — PageAI',
    description: 'AI가 생성한 상세페이지 샘플을 카테고리별로 확인하세요.',
    url: 'https://pagebeer.beer/samples',
  },
}

const CATEGORIES = [
  { slug: '뷰티',    label: '💄 뷰티·화장품', desc: '스킨케어, 메이크업, 향수' },
  { slug: '식품',    label: '🍎 식품·건강식',  desc: '건강식품, 간편식, 음료' },
  { slug: '패션',    label: '👗 패션·의류',    desc: '의류, 신발, 가방, 액세서리' },
  { slug: '전자기기', label: '📱 전자기기',    desc: '스마트폰, 노트북, 주변기기' },
  { slug: '생활용품', label: '🏠 생활용품',    desc: '인테리어, 청소, 수납용품' },
  { slug: '반려동물', label: '🐾 반려동물',    desc: '사료, 간식, 장난감, 용품' },
  { slug: '스포츠',  label: '💪 스포츠·아웃도어', desc: '운동기구, 아웃도어, 스포츠웨어' },
  { slug: '유아동',  label: '🧸 유아·아동',   desc: '장난감, 의류, 육아용품' },
]

export default function SamplesIndexPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">
            로그인 →
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-16">
        {/* SEO h1 */}
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">
            무료 샘플
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            스마트스토어·쿠팡<br />상세페이지 샘플 모음
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            카테고리별 실제 판매에 쓰이는 수준의 AI 생성 상세페이지 샘플입니다.
            내 제품도 5분 만에 동일한 수준으로 자동 생성할 수 있어요.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/samples/${cat.slug}`}
              className="group bg-white/5 hover:bg-white/10 border border-white/8 hover:border-blue-500/40 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/10">
              <p className="text-lg mb-2">{cat.label}</p>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{cat.desc}</p>
              <p className="text-[10px] text-blue-400 font-bold mt-3 group-hover:text-blue-300">샘플 보기 →</p>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10">
          <h2 className="text-xl font-black text-white mb-3">내 제품 상세페이지 자동 생성</h2>
          <p className="text-gray-400 text-sm mb-6">제품 정보만 입력하면 AI가 판매에 최적화된 상세페이지를 5분 안에 완성해드립니다.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-500/30">
            PageAI로 자동 생성하기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
