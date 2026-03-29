'use client'
import { useState, useEffect } from 'react'

interface Trend {
  title: string
  traffic: string
  related: string[]
}

interface Props {
  geo?: string // 'KR' | 'US' | 'JP' etc.
  /** @deprecated use variant */
  compact?: boolean
  variant?: 'default' | 'compact' | 'strip'
}

export default function TrendWidget({ geo = 'KR', compact = false, variant }: Props) {
  const v = variant ?? (compact ? 'compact' : 'default')
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/trends?geo=${geo}`)
      .then(r => r.json())
      .then(data => {
        if (data.trends?.length > 0) {
          setTrends(data.trends)
          setUpdatedAt(data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '')
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [geo])

  const geoLabel: Record<string, string> = {
    KR: '🇰🇷 한국', US: '🇺🇸 미국', JP: '🇯🇵 일본', TW: '🇹🇼 대만', CN: '🇨🇳 中国',
  }

  const trendsUrl = `https://trends.google.com/trending?geo=${geo}`

  if (v === 'strip') {
    const loop = trends.length > 0 ? [...trends, ...trends] : []
    return (
      <div className="w-full border-y border-amber-200/40 bg-gradient-to-r from-rose-50/60 via-white to-amber-50/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2 flex items-center gap-2 sm:gap-3">
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-black text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 tracking-tight">
            <span className="text-amber-300">🔥</span>
            급상승
          </span>
          <div className="flex-1 min-w-0 overflow-hidden relative h-7 flex items-center">
            {loading ? (
              <div className="flex gap-3 w-full">
                <div className="h-2.5 flex-1 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ) : error || loop.length === 0 ? (
              <p className="text-[11px] text-gray-400 truncate">트렌드를 불러오는 중…</p>
            ) : (
              <div className="flex gap-8 whitespace-nowrap animate-marquee items-center">
                {loop.map((t, i) => (
                  <a
                    key={`${t.title}-${i}`}
                    href={`https://www.google.com/search?q=${encodeURIComponent(t.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] sm:text-xs font-bold text-gray-700 hover:text-black hover:underline shrink-0"
                  >
                    {t.title}
                    {t.traffic ? <span className="text-gray-300 font-medium ml-1">{t.traffic}</span> : null}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a
            href={trendsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[10px] sm:text-xs font-black text-gray-500 hover:text-black whitespace-nowrap"
          >
            Trends →
          </a>
        </div>
      </div>
    )
  }

  if (v === 'compact') {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black text-black flex items-center gap-1.5">
            <span className="text-red-500">🔥</span> 실시간 급상승
          </p>
          {updatedAt && <p className="text-[9px] text-gray-300">{updatedAt} 기준</p>}
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-3 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-gray-400">데이터를 불러올 수 없습니다</p>
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
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3">
              <div className="w-6 h-5 bg-gray-100 rounded animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-gray-100 rounded animate-pulse mb-1.5" style={{ width: `${70 + Math.random() * 20}%` }} />
                <div className="h-2.5 bg-gray-50 rounded animate-pulse" style={{ width: `${40 + Math.random() * 20}%` }} />
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
