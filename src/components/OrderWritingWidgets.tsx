'use client'

import { useState } from 'react'
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
    title: '번역 · 웹검색 · 지도',
    translate: '번역기 (새 탭)',
    translateHint: '섹션을 편집하다가 다른 탭에서 번역 후, 본문에 붙여넣을 수 있어요.',
    webSearch: '웹 검색',
    webSearchHint: '사실 확인·스펙·경쟁사 문구 등을 찾을 때 사용하세요.',
    webSearchPh: '검색어 (예: 성분 히알루론산 효능)',
    webSearchBtn: 'Google 검색',
    map: '지도',
    mapPh: '주소 또는 장소 검색 (예: 강남역 카페)',
    mapOpenTab: 'Google 지도에서 열기',
    mapShow: '미리보기',
  },
  en: {
    title: 'Translate · web · map',
    translate: 'Translator (new tab)',
    translateHint: 'Edit a section, then paste translated or researched text from another tab.',
    webSearch: 'Web search',
    webSearchHint: 'Look up specs, facts, or competitor copy while you write.',
    webSearchPh: 'Query (e.g. hyaluronic acid benefits)',
    webSearchBtn: 'Search Google',
    map: 'Map',
    mapPh: 'Address or place (e.g. Shibuya Station)',
    mapOpenTab: 'Open in Google Maps',
    mapShow: 'Preview',
  },
  ja: {
    title: '翻訳・検索・地図',
    translate: '翻訳（新しいタブ）',
    translateHint: 'セクション編集中に別タブで翻訳し、本文に貼り付けできます。',
    webSearch: 'ウェブ検索',
    webSearchHint: '仕様・事実・競合表現の確認に。',
    webSearchPh: '検索ワード（例：成分 ヒアルロン酸）',
    webSearchBtn: 'Googleで検索',
    map: '地図',
    mapPh: '住所や場所（例：渋谷駅）',
    mapOpenTab: 'Googleマップで開く',
    mapShow: 'プレビュー',
  },
  zh: {
    title: '翻译 · 搜索 · 地图',
    translate: '翻译（新标签）',
    translateHint: '编辑区块时可在新标签翻译后再粘贴回正文。',
    webSearch: '网页搜索',
    webSearchHint: '查规格、事实或竞品表述时使用。',
    webSearchPh: '搜索词（如：玻尿酸 功效）',
    webSearchBtn: 'Google 搜索',
    map: '地图',
    mapPh: '地址或地点（如：三里屯）',
    mapOpenTab: '在 Google 地图打开',
    mapShow: '预览',
  },
}

const TL = ['ko', 'en', 'ja', 'zh'] as const

export default function OrderWritingWidgets({ uiLang }: { uiLang: UiLang }) {
  const t = COPY[uiLang]
  const [webQuery, setWebQuery] = useState('')
  const [mapQuery, setMapQuery] = useState('')
  const [showEmbed, setShowEmbed] = useState(false)
  const embedSrc =
    mapQuery.trim().length > 1
      ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery.trim())}&output=embed`
      : ''

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 space-y-4">
      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{t.title}</p>

      <div>
        <p className="text-xs font-bold text-gray-700 mb-1">{t.translate}</p>
        <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">{t.translateHint}</p>
        <div className="flex flex-wrap gap-2">
          {TL.map(tl => (
            <a
              key={tl}
              href={`https://translate.google.com/?sl=auto&tl=${tl}&op=translate`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              → {tl.toUpperCase()}
            </a>
          ))}
          <a
            href="https://www.deepl.com/translator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            DeepL
          </a>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-700 mb-1">{t.webSearch}</p>
        <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">{t.webSearchHint}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={webQuery}
            onChange={e => setWebQuery(e.target.value)}
            placeholder={t.webSearchPh}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <a
            href={
              webQuery.trim()
                ? `https://www.google.com/search?q=${encodeURIComponent(webQuery.trim())}`
                : 'https://www.google.com'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black transition-all inline-flex items-center justify-center shrink-0 text-center"
          >
            {t.webSearchBtn}
          </a>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-700 mb-2">{t.map}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={mapQuery}
            onChange={e => setMapQuery(e.target.value)}
            placeholder={t.mapPh}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowEmbed(e => !e)}
              disabled={!embedSrc}
              className="text-xs font-bold px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all"
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
              className="text-xs font-bold px-3 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-all inline-flex items-center justify-center"
            >
              {t.mapOpenTab}
            </a>
          </div>
        </div>
        {showEmbed && embedSrc && (
          <iframe
            title="map-preview"
            src={embedSrc}
            className="w-full h-48 rounded-xl border border-gray-200 mt-3 bg-gray-100"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    </div>
  )
}
