'use client'

import { useState } from 'react'
import { Languages } from 'lucide-react'
import type { UiLang } from '@/lib/uiLocale'

const COPY: Record<
  UiLang,
  {
    title: string
    translate: string
    translateHint: string
    webSearch: string
    webSearchHint: string
    webSearchPh: string
    webSearchBtn: string
    map: string
    mapPh: string
    mapOpenTab: string
    mapShow: string
  }
> = {
  ko: {
    title: '번역 · 검색 · 지도',
    translate: '번역기',
    translateHint: '새 탭에서 번역 후 본문에 붙여넣기',
    webSearch: '웹 검색',
    webSearchHint: '사실·스펙·표현 확인',
    webSearchPh: '검색어 입력',
    webSearchBtn: 'Google 검색',
    map: '지도',
    mapPh: '주소·장소',
    mapOpenTab: '지도 앱에서 열기',
    mapShow: '여기서 미리보기',
  },
  en: {
    title: 'Translate · search · map',
    translate: 'Translate',
    translateHint: 'Open in a new tab, then paste back',
    webSearch: 'Web search',
    webSearchHint: 'Facts, specs, wording',
    webSearchPh: 'Search query',
    webSearchBtn: 'Search Google',
    map: 'Map',
    mapPh: 'Address or place',
    mapOpenTab: 'Open in Maps',
    mapShow: 'Preview here',
  },
  ja: {
    title: '翻訳 · 検索 · 地図',
    translate: '翻訳',
    translateHint: '新しいタブで翻訳して貼り付け',
    webSearch: 'ウェブ検索',
    webSearchHint: '事実・仕様の確認',
    webSearchPh: 'キーワード',
    webSearchBtn: 'Googleで検索',
    map: '地図',
    mapPh: '住所・場所',
    mapOpenTab: 'マップで開く',
    mapShow: 'ここでプレビュー',
  },
  zh: {
    title: '翻译 · 搜索 · 地图',
    translate: '翻译',
    translateHint: '新标签翻译后粘贴',
    webSearch: '网页搜索',
    webSearchHint: '事实、规格、用语',
    webSearchPh: '输入关键词',
    webSearchBtn: 'Google 搜索',
    map: '地图',
    mapPh: '地址或地点',
    mapOpenTab: '在地图中打开',
    mapShow: '在此预览',
  },
}

const TL = ['ko', 'en', 'ja', 'zh'] as const

const sectionClass =
  'rounded-xl border border-zinc-200/90 bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] w-full min-w-0 box-border'

export default function OrderWritingWidgets({ uiLang }: { uiLang: UiLang }) {
  const t = COPY[uiLang]
  const [webQuery, setWebQuery] = useState('')
  const [mapQuery, setMapQuery] = useState('')
  const [showEmbed, setShowEmbed] = useState(false)
  const embedSrc =
    mapQuery.trim().length > 1
      ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery.trim())}&output=embed`
      : ''

  const chipClass =
    'inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50/80 px-2 py-1.5 text-[10px] font-bold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white'

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 border-b border-zinc-100 pb-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white">
          <Languages className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{t.title}</p>
          <p className="truncate text-[9px] text-zinc-400">{t.translateHint}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* 번역 */}
        <section className={sectionClass} aria-label={t.translate}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-indigo-600">{t.translate}</p>
          <div className="grid w-full grid-cols-2 gap-1.5">
            {TL.map(tl => (
              <a
                key={tl}
                href={`https://translate.google.com/?sl=auto&tl=${tl}&op=translate`}
                target="_blank"
                rel="noopener noreferrer"
                className={chipClass}
              >
                → {tl.toUpperCase()}
              </a>
            ))}
            <a
              href="https://www.deepl.com/translator"
              target="_blank"
              rel="noopener noreferrer"
              className={`${chipClass} col-span-2`}
            >
              DeepL
            </a>
          </div>
        </section>

        {/* 웹 검색 — 입력과 버튼을 세로로 고정 (좁은 사이드바 대응) */}
        <section className={sectionClass} aria-label={t.webSearch}>
          <p className="mb-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">{t.webSearch}</p>
          <p className="mb-2 text-[9px] leading-snug text-zinc-400">{t.webSearchHint}</p>
          <div className="flex w-full min-w-0 flex-col gap-2">
            <input
              value={webQuery}
              onChange={e => setWebQuery(e.target.value)}
              placeholder={t.webSearchPh}
              className="box-border w-full min-w-0 rounded-lg border border-zinc-200 bg-zinc-50/50 px-2.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
            <a
              href={
                webQuery.trim()
                  ? `https://www.google.com/search?q=${encodeURIComponent(webQuery.trim())}`
                  : 'https://www.google.com'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="box-border flex w-full min-w-0 items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-center text-[11px] font-bold text-white transition-colors hover:bg-black"
            >
              {t.webSearchBtn}
            </a>
          </div>
        </section>

        {/* 지도 */}
        <section className={sectionClass} aria-label={t.map}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-sky-700">{t.map}</p>
          <div className="flex w-full min-w-0 flex-col gap-2">
            <input
              value={mapQuery}
              onChange={e => setMapQuery(e.target.value)}
              placeholder={t.mapPh}
              className="box-border w-full min-w-0 rounded-lg border border-zinc-200 bg-zinc-50/50 px-2.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
            <button
              type="button"
              onClick={() => setShowEmbed(e => !e)}
              disabled={!embedSrc}
              className="box-border w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.mapShow}
            </button>
            <a
              href={
                mapQuery.trim()
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery.trim())}`
                  : 'https://www.google.com/maps'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="box-border flex w-full min-w-0 items-center justify-center rounded-lg bg-sky-600 px-3 py-2 text-center text-[11px] font-bold text-white transition-colors hover:bg-sky-700"
            >
              {t.mapOpenTab}
            </a>
          </div>
          {showEmbed && embedSrc && (
            <iframe
              title="map-preview"
              src={embedSrc}
              className="mt-2 box-border h-40 w-full min-w-0 rounded-lg border border-zinc-200 bg-zinc-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </section>
      </div>
    </div>
  )
}
