'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const SLIDES = [
  '/demo/slide1.png',
  '/demo/slide2.png',
  '/demo/slide3.png',
  '/demo/slide4.png',
  '/demo/slide5.png',
]

/* objectPosition per slide — show the most informative part */
const OBJ_POS = ['top', 'top', '20%', 'top', 'top']

const ACCENT = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9']

type Tab = { icon: string; label: string; desc: string }

const TABS: Record<Lang, Tab[]> = {
  ko: [
    { icon: '✦', label: 'AI 결과',       desc: '6개 섹션 자동 완성 · 섹션별 미리보기' },
    { icon: '📤', label: '채널 발행 키트', desc: '플랫폼별 제목·태그·금칙어 가이드' },
    { icon: '💡', label: '전환 팁 & 훅',  desc: '훅 문장 3안 + 패키징 체크리스트' },
    { icon: '🔀', label: 'A/B 카피',      desc: '제목·본문 A·B·C안 원클릭 복사' },
    { icon: '🏢', label: 'B2B + 에셋',    desc: 'B2B 근거 레이어 & 썸네일 키트' },
  ],
  en: [
    { icon: '✦', label: 'AI Result',      desc: '6 sections auto-completed' },
    { icon: '📤', label: 'Channel Kit',   desc: 'Platform-specific titles, tags & rules' },
    { icon: '💡', label: 'Tips & Hooks',  desc: '3 hook variants + packaging checklist' },
    { icon: '🔀', label: 'A/B Copy',      desc: '3 title & body variants, one-click copy' },
    { icon: '🏢', label: 'B2B + Assets',  desc: 'B2B evidence layer & thumbnail kit' },
  ],
  ja: [
    { icon: '✦', label: 'AI結果',         desc: '6セクション自動完成・プレビュー' },
    { icon: '📤', label: 'チャネルキット', desc: 'プラットフォーム別タイトル・タグ・禁止ワード' },
    { icon: '💡', label: 'ヒント & フック', desc: 'フック文3案 + パッケージチェック' },
    { icon: '🔀', label: 'A/Bコピー',     desc: 'タイトル・本文A·B·C案をワンクリックコピー' },
    { icon: '🏢', label: 'B2B + アセット', desc: 'B2B根拠レイヤー & サムネイルキット' },
  ],
  zh: [
    { icon: '✦', label: 'AI结果',         desc: '6个板块自动生成·分板块预览' },
    { icon: '📤', label: '渠道发布套件',   desc: '各平台标题·标签·违禁词指南' },
    { icon: '💡', label: '技巧 & 钩子',    desc: '3套钩子句 + 包装检查清单' },
    { icon: '🔀', label: 'A/B文案',       desc: '标题·正文A·B·C方案一键复制' },
    { icon: '🏢', label: 'B2B + 素材',    desc: 'B2B证据层 & 缩略图套件' },
  ],
}

const AUTO_MS = 4000   // 탭당 머무는 시간

export default function DemoAnimation({ lang = 'ko' }: { lang?: Lang }) {
  const tabs    = TABS[lang] ?? TABS.ko
  const [cur, setCur]         = useState(0)
  const [imgVisible, setImgVisible] = useState(true)
  const [progress, setProgress]     = useState(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function switchTo(idx: number) {
    if (idx === cur) return
    setImgVisible(false)
    setTimeout(() => { setCur(idx); setProgress(0); setImgVisible(true) }, 260)
  }

  /* progress bar + auto-advance */
  useEffect(() => {
    setProgress(0)
    const step  = 50                       // ms per tick
    const ticks = AUTO_MS / step
    let   t     = 0
    progressRef.current = setInterval(() => {
      t++
      setProgress(Math.min((t / ticks) * 100, 100))
      if (t >= ticks) {
        clearInterval(progressRef.current!)
        setImgVisible(false)
        setTimeout(() => {
          setCur(c => (c + 1) % SLIDES.length)
          setProgress(0)
          setImgVisible(true)
        }, 260)
      }
    }, step)
    return () => clearInterval(progressRef.current!)
  }, [cur])

  const tab = tabs[cur]

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* ── Tab bar ── */}
      <div className="flex gap-1 mb-0 overflow-x-auto pb-0 hide-scrollbar">
        {tabs.map((t, i) => {
          const active = i === cur
          return (
            <button
              key={i}
              type="button"
              onClick={() => switchTo(i)}
              className={`relative flex-1 min-w-[100px] text-left px-3 py-3 rounded-t-xl transition-all duration-200 border-b-0 focus:outline-none ${
                active
                  ? 'bg-white border border-gray-200 border-b-white z-10 shadow-sm'
                  : 'bg-gray-50 border border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">{t.icon}</span>
                <span
                  className="text-[11px] font-black whitespace-nowrap"
                  style={{ color: active ? ACCENT[i] : '#6B7280' }}
                >
                  {t.label}
                </span>
              </div>
              <p className={`text-[9px] leading-tight ${active ? 'text-gray-500' : 'text-gray-400'} hidden sm:block`}>
                {t.desc}
              </p>
              {/* progress bar */}
              {active && (
                <div className="absolute bottom-0 left-0 h-0.5 rounded-b-sm transition-none" style={{ width: `${progress}%`, background: ACCENT[i] }} />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Screenshot frame ── */}
      <div
        className="rounded-b-2xl rounded-tr-2xl overflow-hidden border border-gray-200 shadow-xl bg-white"
        style={{ border: `1.5px solid ${ACCENT[cur]}33` }}
      >
        {/* browser address bar */}
        <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-100 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded-md h-5 flex items-center px-2 max-w-xs mx-auto">
            <span className="text-[9px] text-gray-400 font-medium truncate">pageai.kr/order/abc123</span>
          </div>
          <div
            className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background: `${ACCENT[cur]}18`, color: ACCENT[cur] }}
          >
            {tab.icon} {tab.label}
          </div>
        </div>

        {/* image */}
        <div
          className="transition-all duration-260"
          style={{ opacity: imgVisible ? 1 : 0, transform: imgVisible ? 'translateY(0)' : 'translateY(6px)' }}
        >
          <Image
            src={SLIDES[cur]}
            alt={tab.label}
            width={900}
            height={560}
            className="w-full"
            style={{
              display: 'block',
              height: 420,
              objectFit: 'cover',
              objectPosition: OBJ_POS[cur],
            }}
            priority={cur === 0}
          />
        </div>

        {/* bottom accent bar */}
        <div
          className="h-1 transition-all duration-500"
          style={{ background: `linear-gradient(90deg, ${ACCENT[cur]}, ${ACCENT[(cur + 1) % ACCENT.length]})` }}
        />
      </div>

      <p className="text-center text-[11px] text-gray-300 mt-4 font-medium">
        {lang === 'ko' ? '탭을 클릭하거나 자동으로 전환됩니다'
         : lang === 'en' ? 'Click a tab or watch it auto-advance'
         : lang === 'ja' ? 'タブをクリックするか自動切替'
         : '点击标签或等待自动切换'}
      </p>
    </div>
  )
}
