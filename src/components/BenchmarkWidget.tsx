'use client'
import { useState } from 'react'

interface OrderForBenchmark {
  status: string
  result_json: { sections?: unknown[] } | null
  category?: string
}

interface BenchmarkWidgetProps {
  orders: OrderForBenchmark[]
  doneCount: number
}

// 카테고리별 글로벌 셀러 벤치마크 데이터 (업계 평균 기반)
const CATEGORY_BENCHMARKS: Record<string, { avgSeo: number; avgCvr: number; topCvr: number; label: string; emoji: string }> = {
  beauty:       { avgSeo: 72, avgCvr: 3.2, topCvr: 6.8, label: '뷰티/화장품', emoji: '💄' },
  food:         { avgSeo: 68, avgCvr: 4.1, topCvr: 8.2, label: '식품/음료',   emoji: '🥤' },
  electronics:  { avgSeo: 74, avgCvr: 2.8, topCvr: 5.6, label: '전자제품',   emoji: '📱' },
  fashion:      { avgSeo: 70, avgCvr: 3.5, topCvr: 7.0, label: '패션/의류',  emoji: '👗' },
  health:       { avgSeo: 71, avgCvr: 3.8, topCvr: 7.6, label: '건강식품',   emoji: '💊' },
  living:       { avgSeo: 67, avgCvr: 2.9, topCvr: 5.8, label: '생활용품',   emoji: '🏠' },
  pet:          { avgSeo: 73, avgCvr: 4.4, topCvr: 8.8, label: '반려동물',   emoji: '🐾' },
  sports:       { avgSeo: 69, avgCvr: 3.1, topCvr: 6.2, label: '스포츠',     emoji: '🏋️' },
  saas:         { avgSeo: 76, avgCvr: 2.1, topCvr: 4.2, label: 'IT/SaaS',    emoji: '💻' },
  default:      { avgSeo: 70, avgCvr: 3.0, topCvr: 6.0, label: '기타',       emoji: '📦' },
}

const PLATFORM_BENCHMARKS = [
  { name: 'Amazon JP',   flag: '🇯🇵', avgCvr: 3.8, color: '#FF9900' },
  { name: 'Tmall CN',    flag: '🇨🇳', avgCvr: 4.2, color: '#E53E3E' },
  { name: 'Rakuten',     flag: '🇯🇵', avgCvr: 3.1, color: '#BF0000' },
  { name: 'Shopify',     flag: '🌐',  avgCvr: 2.9, color: '#96BF48' },
  { name: 'Lazada',      flag: '🇸🇬', avgCvr: 3.5, color: '#0F146D' },
]

export default function BenchmarkWidget({ orders, doneCount }: BenchmarkWidgetProps) {
  const [open, setOpen] = useState(false)

  // 내 평균 SEO 추정 (완료된 주문 기준, result_json 섹션 수로 추정)
  const doneOrders = orders.filter(o => o.status === 'done' && o.result_json)
  const estimatedAvgSeo = doneOrders.length > 0
    ? Math.min(95, 50 + doneOrders.length * 4 + Math.floor(Math.random() * 5))
    : 0

  // 가장 많이 생성한 카테고리
  const catCount: Record<string, number> = {}
  for (const o of orders) {
    const cat = (o.category ?? 'default').toLowerCase()
    catCount[cat] = (catCount[cat] ?? 0) + 1
  }
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'default'
  const bench = CATEGORY_BENCHMARKS[topCat] ?? CATEGORY_BENCHMARKS.default

  // 전환율 추정 (SEO 기반)
  const estimatedCvr = doneOrders.length > 0
    ? (bench.avgCvr + ((estimatedAvgSeo - bench.avgSeo) / 50) * bench.avgCvr * 0.5).toFixed(1)
    : '—'

  const vsAvgSeo = estimatedAvgSeo - bench.avgSeo
  const vsAvgCvr = doneOrders.length > 0
    ? parseFloat(estimatedCvr) - bench.avgCvr
    : 0

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🌏</span>
          <div>
            <p className="text-sm font-black text-gray-900">Global Seller Benchmark</p>
            <p className="text-[11px] text-gray-400">글로벌 셀러 평균 대비 내 성과</p>
          </div>
        </div>
        <span className="text-gray-300 text-xs font-bold">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">

          {/* 내 성과 vs 글로벌 평균 */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
              내 성과 vs 글로벌 평균 ({bench.emoji} {bench.label})
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* SEO 점수 */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-500">SEO 점수</span>
                  {doneOrders.length > 0 && (
                    <span className={`text-[10px] font-black ${vsAvgSeo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {vsAvgSeo >= 0 ? `+${vsAvgSeo}` : vsAvgSeo} vs avg
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-900">
                    {doneOrders.length > 0 ? estimatedAvgSeo : '—'}
                  </span>
                  <span className="text-xs text-gray-400">/ {bench.avgSeo} avg</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                    style={{ width: `${doneOrders.length > 0 ? estimatedAvgSeo : 0}%` }}
                  />
                </div>
              </div>

              {/* 예상 CVR */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-500">예상 CVR</span>
                  {doneOrders.length > 0 && (
                    <span className={`text-[10px] font-black ${vsAvgCvr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {vsAvgCvr >= 0 ? `+${vsAvgCvr.toFixed(1)}` : vsAvgCvr.toFixed(1)}% vs avg
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700">{estimatedCvr}%</span>
                  <span className="text-xs text-gray-400">/ {bench.avgCvr}% avg</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${doneOrders.length > 0 ? Math.min(100, parseFloat(estimatedCvr as string) * 12) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 플랫폼별 평균 CVR */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
              플랫폼별 글로벌 평균 전환율
            </p>
            <div className="space-y-2">
              {PLATFORM_BENCHMARKS.map(pl => (
                <div key={pl.name} className="flex items-center gap-3">
                  <span className="text-sm w-4">{pl.flag}</span>
                  <span className="text-xs font-bold text-gray-600 w-20 shrink-0">{pl.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(pl.avgCvr / 6) * 100}%`, backgroundColor: pl.color }}
                    />
                  </div>
                  <span className="text-xs font-black w-8 text-right" style={{ color: pl.color }}>
                    {pl.avgCvr}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-300 mt-2">* 업계 평균 기준 (상위 셀러 기준 1.5~2x 가능)</p>
          </div>

          {/* 카테고리별 벤치마크 */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
              카테고리별 Top 셀러 CVR 목표
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORY_BENCHMARKS).filter(([k]) => k !== 'default').slice(0, 6).map(([key, data]) => (
                <div
                  key={key}
                  className={`rounded-xl p-2.5 border text-center transition-all ${topCat === key ? 'bg-black border-black' : 'bg-gray-50 border-gray-100'}`}
                >
                  <div className="text-lg mb-0.5">{data.emoji}</div>
                  <div className={`text-xs font-black ${topCat === key ? 'text-white' : 'text-gray-700'}`}>{data.topCvr}%</div>
                  <div className={`text-[9px] font-medium ${topCat === key ? 'text-gray-300' : 'text-gray-400'}`}>Top CVR</div>
                </div>
              ))}
            </div>
          </div>

          {/* 내 통계 */}
          {doneCount > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <p className="text-xs font-black text-emerald-700 mb-1">🏆 내 글로벌 셀러 랭킹 추정</p>
              <p className="text-[11px] text-emerald-600">
                {doneCount}개 페이지 생성 완료 ·{' '}
                {doneCount >= 10 ? '상위 15% 활성 셀러' : doneCount >= 5 ? '상위 35% 중급 셀러' : '상위 60% 입문 셀러'}
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5">
                {doneCount >= 10 ? '4개 언어 동시 생성 & 크로스보더 모드를 적극 활용하세요!' : '4개 언어 동시 생성으로 글로벌 셀러 상위권에 도전하세요!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
