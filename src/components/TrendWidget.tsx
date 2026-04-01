'use client'
import { useState, useEffect, useMemo } from 'react'

interface Trend {
  title: string
  traffic: string
  related: string[]
}

/** API 실패·빈 응답 시에도 스트립에 항상 표시 (Vercel 등 RSS 차단 대비) */
const CLIENT_STRIP_FALLBACK: Record<string, Trend[]> = {
  KR: [
    { title: '스마트스토어 상세페이지', traffic: '50,000+', related: [] },
    { title: 'AI 글쓰기 도구', traffic: '30,000+', related: [] },
    { title: '쿠팡 상품 등록', traffic: '40,000+', related: [] },
    { title: '보도자료 작성법', traffic: '10,000+', related: [] },
    { title: '블로그 글쓰기 SEO', traffic: '60,000+', related: [] },
  ],
  US: [
    { title: 'AI content writing tools', traffic: '100K+', related: [] },
    { title: 'Amazon product listing', traffic: '80K+', related: [] },
    { title: 'Shopify store setup', traffic: '60K+', related: [] },
    { title: 'press release template', traffic: '40K+', related: [] },
    { title: 'blog post ideas', traffic: '50K+', related: [] },
  ],
  JP: [
    { title: 'AI文章生成ツール', traffic: '30,000+', related: [] },
    { title: 'ネットショップ集客', traffic: '20,000+', related: [] },
    { title: 'ブログ収益化', traffic: '25,000+', related: [] },
    { title: 'プレスリリース書き方', traffic: '8,000+', related: [] },
    { title: '商品ページCV率改善', traffic: '15,000+', related: [] },
  ],
  CN: [
    { title: 'AI写作工具', traffic: '200,000+', related: [] },
    { title: '电商商品描述', traffic: '150,000+', related: [] },
    { title: '内容营销策略', traffic: '80,000+', related: [] },
    { title: '商业计划书模板', traffic: '60,000+', related: [] },
    { title: 'SEO关键词优化', traffic: '90,000+', related: [] },
  ],
}

type UiLocale = 'ko' | 'en' | 'ja' | 'zh'

function uiLocaleFromGeo(geo: string, override?: UiLocale): UiLocale {
  if (override) return override
  if (geo === 'US') return 'en'
  if (geo === 'JP') return 'ja'
  if (geo === 'CN' || geo === 'TW') return 'zh'
  return 'ko'
}

const STRIP_UI: Record<UiLocale, { badge: string; trendsCta: string }> = {
  ko: { badge: '급상승', trendsCta: 'Trends →' },
  en: { badge: 'Trending', trendsCta: 'Trends →' },
  ja: { badge: '急上昇', trendsCta: 'Trends →' },
  zh: { badge: '热搜', trendsCta: 'Google 趋势 →' },
}

interface Props {
  geo?: string // 'KR' | 'US' | 'JP' etc.
  /** 스트립 라벨 언어 (미지정 시 geo로 추정) */
  uiLocale?: UiLocale
  /** @deprecated use variant */
  compact?: boolean
  variant?: 'default' | 'compact' | 'strip'
}

export default function TrendWidget({ geo = 'KR', uiLocale, compact = false, variant }: Props) {
  const v = variant ?? (compact ? 'compact' : 'default')
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState('')
  const [error, setError] = useState(false)

  const stripLoc = uiLocaleFromGeo(geo, uiLocale)
  const stripLabels = STRIP_UI[stripLoc]

  const [trendSkeletonRows] = useState(() =>
    Array.from({ length: 8 }, () => ({
      mainPct: 70 + Math.random() * 20,
      subPct: 40 + Math.random() * 20,
    })),
  )

  useEffect(() => {
    let cancelled = false
    const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    const locales: Record<UiLocale, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' }

    fetch(`/api/trends?geo=${geo}`)
      .then(async r => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json() as Promise<{ trends?: Trend[]; updatedAt?: string }>
      })
      .then(data => {
        if (cancelled) return
        if (data.trends?.length) {
          setTrends(data.trends)
          setUpdatedAt(data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString(locales[stripLoc], timeOpts) : '')
          setError(false)
        } else {
          setTrends([])
          setError(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTrends([])
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [geo, uiLocale, stripLoc])

  const geoLabel: Record<string, string> = {
    KR: '🇰🇷 한국', US: '🇺🇸 미국', JP: '🇯🇵 일본', TW: '🇹🇼 대만', CN: '🇨🇳 中国',
  }

  const trendsUrl = `https://trends.google.com/trending?geo=${geo}`

  const stripFbKey = geo === 'TW' ? 'CN' : geo
  const stripFallback = CLIENT_STRIP_FALLBACK[stripFbKey] ?? CLIENT_STRIP_FALLBACK.KR
  const effectiveStripTrends = useMemo(() => {
    if (loading) return []
    return trends.length > 0 ? trends : stripFallback
  }, [loading, trends, stripFallback])

  if (v === 'strip') {
    const loop = effectiveStripTrends.length > 0 ? [...effectiveStripTrends, ...effectiveStripTrends] : []
    return (
      <div className="w-full border-y border-amber-100/50 bg-gradient-to-r from-amber-50/40 via-white to-rose-50/30">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2">
          <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-black text-white text-[9px] font-black px-1.5 py-0.5 tracking-tight">
            <span className="text-amber-300 text-[8px]">🔥</span>
            {stripLabels.badge}
          </span>
          <div className="flex-1 min-w-0 overflow-hidden relative h-5 sm:h-5 flex items-center">
            {loading ? (
              <div className="h-1.5 w-full max-w-[min(100%,320px)] bg-gray-100 rounded-full animate-pulse" />
            ) : (
              <div className="flex gap-6 sm:gap-8 whitespace-nowrap animate-marquee items-center">
                {loop.map((t, i) => (
                  <a
                    key={`${t.title}-${i}`}
                    href={`https://www.google.com/search?q=${encodeURIComponent(t.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] sm:text-[10px] font-semibold text-gray-600 hover:text-black hover:underline shrink-0"
                  >
                    {t.title}
                    {t.traffic ? <span className="text-gray-300 font-medium ml-0.5">{t.traffic}</span> : null}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a
            href={trendsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[9px] font-bold text-gray-400 hover:text-black whitespace-nowrap"
          >
            {stripLabels.trendsCta}
          </a>
        </div>
      </div>
    )
  }

  const compactUI: Record<UiLocale, { title: string; asOf: string; noData: string }> = {
    ko: { title: '실시간 급상승', asOf: '기준', noData: '데이터를 불러올 수 없습니다' },
    en: { title: 'Trending Now', asOf: 'updated', noData: 'Unable to load data' },
    ja: { title: 'リアルタイム急上昇', asOf: '時点', noData: 'データを読み込めません' },
    zh: { title: '实时热搜', asOf: '更新', noData: '无法加载数据' },
  }
  const cu = compactUI[stripLoc]

  if (v === 'compact') {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black text-black flex items-center gap-1.5">
            <span className="text-red-500">🔥</span> {cu.title}
          </p>
          {updatedAt && <p className="text-[9px] text-gray-300">{updatedAt} {cu.asOf}</p>}
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-3 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-gray-400">{cu.noData}</p>
        ) : (
          <ol className="space-y-1.5">
            {trends.slice(0, 5).map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={`text-[9px] font-black w-4 shrink-0 ${i < 3 ? 'text-red-500' : 'text-gray-300'}`}>{i + 1}</span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(t.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-700 font-medium hover:text-black truncate transition-colors"
                >
                  {t.title}
                </a>
                {t.traffic && (
                  <span className="text-[9px] text-gray-300 shrink-0 ml-auto">{t.traffic}</span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-lg">🔥</span>
          <div>
            <p className="font-black text-sm text-black">실시간 급상승 검색어</p>
            <p className="text-[10px] text-gray-400">{geoLabel[geo] ?? geo} Google Trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {updatedAt && (
            <span className="text-[9px] text-gray-300 bg-gray-50 px-2 py-1 rounded-lg">{updatedAt} 기준</span>
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* 트렌드 목록 */}
      <div className="divide-y divide-gray-50">
        {loading ? (
          trendSkeletonRows.map((row, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3">
              <div className="w-6 h-5 bg-gray-100 rounded animate-pulse shrink-0" />
              <div className="flex-1">
                <div
                  className="h-3.5 bg-gray-100 rounded animate-pulse mb-1.5"
                  style={{ width: `${row.mainPct}%` }}
                />
                <div className="h-2.5 bg-gray-50 rounded animate-pulse" style={{ width: `${row.subPct}%` }} />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400 mb-2">Google Trends 데이터를 불러올 수 없습니다</p>
            <p className="text-xs text-gray-300">잠시 후 다시 시도해주세요</p>
          </div>
        ) : (
          trends.map((t, i) => (
            <a
              key={i}
              href={`https://www.google.com/search?q=${encodeURIComponent(t.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
            >
              {/* 순위 */}
              <span className={`text-sm font-black w-6 shrink-0 ${i < 3 ? 'text-red-500' : 'text-gray-300'}`}>
                {i + 1}
              </span>

              {/* 키워드 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black group-hover:underline truncate">{t.title}</p>
                {t.related.length > 0 && (
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{t.related.join(' · ')}</p>
                )}
              </div>

              {/* 검색량 */}
              {t.traffic && (
                <span className="text-[10px] font-bold text-gray-400 shrink-0 bg-gray-100 px-2 py-0.5 rounded-lg">
                  {t.traffic}
                </span>
              )}

              <span className="text-gray-200 text-xs group-hover:text-gray-400 shrink-0">↗</span>
            </a>
          ))
        )}
      </div>

      {/* 더보기 */}
      {!loading && !error && (
        <div className="px-5 py-3 border-t border-gray-100">
          <a
            href={trendsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-black font-medium transition-colors"
          >
            Google Trends에서 더보기 →
          </a>
        </div>
      )}
    </div>
  )
}
