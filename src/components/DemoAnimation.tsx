'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const SLIDES = [
  '/demo/slide1.png',
  '/demo/slide2.png',
  '/demo/slide3.png',
  '/demo/slide4.png',
  '/demo/slide5.png',
]

type SlideCaption = { badge: string; title: string; desc: string }

const CAPTIONS: Record<Lang, SlideCaption[]> = {
  ko: [
    {
      badge: '결과 미리보기',
      title: 'AI가 6개 섹션 자동 완성',
      desc: '후킹 헤드라인부터 구매 유도 CTA까지 전문 카피라이팅 수준으로 30~45초 만에 생성됩니다.',
    },
    {
      badge: '채널 발행 키트',
      title: '플랫폼별 최적화 가이드 자동 생성',
      desc: '네이버·쿠팡·티스토리·Instagram 등 각 채널 규격에 맞는 제목 길이, 금칙어, 태그 규칙을 자동 제공합니다.',
    },
    {
      badge: '전환 팁 & 훅 문장',
      title: '팔리는 문장을 바로 복사',
      desc: '플랫폼별 전환 팁, 패키징 체크리스트, 훅 문장 3안을 원클릭으로 복사해 바로 쓸 수 있습니다.',
    },
    {
      badge: 'A/B 카피',
      title: '제목·본문 3안 자동 생성',
      desc: 'A·B·C 3가지 제목안과 첫 문장안 — 각각 독립 복사 및 해당 섹션에 바로 적용 가능합니다.',
    },
    {
      badge: 'B2B + 에셋 키트',
      title: 'B2B 근거 레이어 & 썸네일 키트',
      desc: '경영진 요약·슬라이드·각주와 채널별 썸네일 문구·슬롯 플랜·안전 영역까지 한 번에 제공합니다.',
    },
  ],
  en: [
    {
      badge: 'Result Preview',
      title: 'AI completes 6 sections automatically',
      desc: 'From hook headline to purchase CTA — professional copywriting quality generated in 30–45 seconds.',
    },
    {
      badge: 'Channel Publish Kit',
      title: 'Platform-specific guides auto-generated',
      desc: 'Titles, tags, restricted words, and rules optimized for Naver, Coupang, Tistory, Instagram, and more.',
    },
    {
      badge: 'Conversion Tips & Hooks',
      title: 'Copy selling sentences instantly',
      desc: 'Platform conversion tips, packaging checklist, and 3 hook variants — one-click copy, ready to paste.',
    },
    {
      badge: 'A/B Copy',
      title: '3 title & body variants auto-generated',
      desc: 'A·B·C headline and opening sentence variants — copy independently or apply directly to any section.',
    },
    {
      badge: 'B2B + Asset Kit',
      title: 'B2B evidence layer & thumbnail kit',
      desc: 'Exec summary, slides, footnotes + channel thumbnail copy, slot plan, and safe zones — all in one place.',
    },
  ],
  ja: [
    {
      badge: '結果プレビュー',
      title: 'AIが6セクションを自動完成',
      desc: 'フックヘッドラインから購入CTAまで、プロレベルのコピーを30〜45秒で生成します。',
    },
    {
      badge: 'チャネル発行キット',
      title: 'プラットフォーム別最適化ガイド自動生成',
      desc: 'アメブロ・楽天・Instagram など各チャネルの文字数制限・禁止ワード・タグ規則を自動で提供します。',
    },
    {
      badge: '転換ヒント & フック文',
      title: '売れる文章をすぐコピー',
      desc: 'プラットフォーム別転換ヒント、パッケージチェック、フック文3案をワンクリックでコピーできます。',
    },
    {
      badge: 'A/Bコピー',
      title: 'タイトル・本文3案を自動生成',
      desc: 'A·B·C 3種のタイトル案と冒頭文案 — それぞれ独立コピー・セクションへの即時適用が可能です。',
    },
    {
      badge: 'B2B + アセットキット',
      title: 'B2B根拠レイヤー & サムネイルキット',
      desc: '経営陣要約・スライド・脚注 + チャネル別サムネイル文・スロットプラン・安全領域を一括提供します。',
    },
  ],
  zh: [
    {
      badge: '结果预览',
      title: 'AI自动生成6个板块',
      desc: '从钩子标题到购买CTA，30~45秒内生成专业文案，开箱即用。',
    },
    {
      badge: '渠道发布套件',
      title: '各平台专项优化指南自动生成',
      desc: '为淘宝、小红书、微信、Instagram等各渠道自动提供标题长度、违禁词、标签规则。',
    },
    {
      badge: '转化技巧 & 钩子句',
      title: '一键复制高转化文案',
      desc: '各平台转化技巧、包装检查清单、3套钩子句方案——一键复制，立即可用。',
    },
    {
      badge: 'A/B文案',
      title: '标题·正文3套方案自动生成',
      desc: 'A·B·C三套标题与开头句方案——各自独立复制或直接应用到对应板块。',
    },
    {
      badge: 'B2B + 素材套件',
      title: 'B2B证据层 & 缩略图套件',
      desc: '高管摘要·PPT·注释 + 各渠道缩略图文案·槽位规划·安全区域，一站式提供。',
    },
  ],
}

const BADGE_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
]

const ACCENT_COLORS = [
  '#6366F1', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#0EA5E9', // sky
]

export default function DemoAnimation({ lang = 'ko' }: { lang?: Lang }) {
  const captions = CAPTIONS[lang] ?? CAPTIONS.ko
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % SLIDES.length)
        setVisible(true)
      }, 320)
    }, 4200)
    return () => clearInterval(interval)
  }, [])

  function goTo(idx: number) {
    if (idx === current) return
    setVisible(false)
    setTimeout(() => { setCurrent(idx); setVisible(true) }, 320)
  }

  const cap = captions[current]

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-8 md:gap-12 items-start"
        style={{ minHeight: 540 }}
      >
        {/* ── LEFT: caption ── */}
        <div
          className="flex flex-col gap-5 transition-all duration-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
        >
          {/* step indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
              style={{ background: ACCENT_COLORS[current] }}
            >
              {current + 1}
            </div>
            <span
              className={`text-[11px] font-black px-2.5 py-1 rounded-full ${BADGE_COLORS[current]}`}
            >
              {cap.badge}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
            {cap.title}
          </h3>

          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
            {cap.desc}
          </p>

          {/* progress dots */}
          <div className="flex items-center gap-2 pt-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className="transition-all duration-300 rounded-full focus:outline-none"
                style={{
                  width:  i === current ? 28 : 8,
                  height: 8,
                  background: i === current ? ACCENT_COLORS[current] : '#E5E7EB',
                }}
              />
            ))}
          </div>

          {/* prev / next */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-800 transition-all text-sm"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo((current + 1) % SLIDES.length)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-800 transition-all text-sm"
            >
              →
            </button>
          </div>
        </div>

        {/* ── RIGHT: screenshot frame ── */}
        <div
          className="relative rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl shadow-gray-200/80"
          style={{
            opacity:   visible ? 1 : 0,
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(6px)',
            border: `1.5px solid ${ACCENT_COLORS[current]}22`,
          }}
        >
          {/* top browser bar */}
          <div className="flex items-center gap-1.5 bg-gray-50 border-b border-gray-100 px-3 py-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            <div className="mx-2 flex-1 bg-gray-200/60 rounded-full h-4 flex items-center px-2">
              <span className="text-[9px] text-gray-400 font-medium">pageai.kr/order/…</span>
            </div>
          </div>

          {/* image */}
          <div
            className="bg-gray-50 flex items-start justify-center"
            style={{ height: 520, overflowY: 'auto', overflowX: 'hidden' }}
          >
            <Image
              src={SLIDES[current]}
              alt={cap.title}
              width={700}
              height={1400}
              className="w-full h-auto"
              style={{ display: 'block' }}
              priority={current === 0}
            />
          </div>

          {/* colored bottom accent line */}
          <div
            className="h-0.5 w-full transition-all duration-500"
            style={{ background: `linear-gradient(90deg, ${ACCENT_COLORS[current]}, ${ACCENT_COLORS[(current + 1) % ACCENT_COLORS.length]})` }}
          />
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 mt-8 font-medium">
        {lang === 'ko' ? '실제 서비스 화면 · 클릭하여 탐색'
         : lang === 'en' ? 'Actual product screenshots · click to explore'
         : lang === 'ja' ? '実際のサービス画面 · クリックして閲覧'
         : '真实产品截图 · 点击浏览'}
      </p>
    </div>
  )
}
