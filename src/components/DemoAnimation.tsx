'use client'
import Image from 'next/image'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const SLIDES = [
  '/demo/slide1.png',
  '/demo/slide2.png',
  '/demo/slide3.png',
  '/demo/slide4.png',
  '/demo/slide5.png',
]

const ACCENT = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9']

type SlideLabel = { badge: string; title: string }

const LABELS: Record<Lang, SlideLabel[]> = {
  ko: [
    { badge: '01', title: 'AI 결과 미리보기' },
    { badge: '02', title: '채널 발행 키트' },
    { badge: '03', title: '전환 팁 & 훅 문장' },
    { badge: '04', title: 'A/B 카피 3안' },
    { badge: '05', title: 'B2B + 에셋 키트' },
  ],
  en: [
    { badge: '01', title: 'AI Result Preview' },
    { badge: '02', title: 'Channel Publish Kit' },
    { badge: '03', title: 'Tips & Hook Sentences' },
    { badge: '04', title: 'A/B Copy Variants' },
    { badge: '05', title: 'B2B + Asset Kit' },
  ],
  ja: [
    { badge: '01', title: 'AI結果プレビュー' },
    { badge: '02', title: 'チャネル発行キット' },
    { badge: '03', title: 'ヒント & フック文' },
    { badge: '04', title: 'A/Bコピー3案' },
    { badge: '05', title: 'B2B + アセットキット' },
  ],
  zh: [
    { badge: '01', title: 'AI结果预览' },
    { badge: '02', title: '渠道发布套件' },
    { badge: '03', title: '技巧 & 钩子句' },
    { badge: '04', title: 'A/B文案三套' },
    { badge: '05', title: 'B2B + 素材套件' },
  ],
}

export default function DemoAnimation({ lang = 'ko' }: { lang?: Lang }) {
  const labels = LABELS[lang] ?? LABELS.ko

  return (
    <div className="w-full">
      {/* horizontal scroll container */}
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {SLIDES.map((src, i) => (
          <div
            key={i}
            className="flex-none flex flex-col"
            style={{ width: 260, scrollSnapAlign: 'start' }}
          >
            {/* label */}
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: `${ACCENT[i]}18`, color: ACCENT[i] }}
              >
                {labels[i].badge}
              </span>
              <span className="text-[11px] font-bold text-gray-700 truncate">
                {labels[i].title}
              </span>
            </div>

            {/* screenshot card */}
            <div
              className="rounded-xl overflow-hidden border border-gray-100 shadow-md bg-white flex-1"
              style={{ borderTop: `3px solid ${ACCENT[i]}` }}
            >
              <Image
                src={src}
                alt={labels[i].title}
                width={520}
                height={900}
                className="w-full h-auto block"
                priority={i < 2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* scroll hint */}
      <p className="text-center text-[11px] text-gray-300 mt-1 font-medium">
        {lang === 'ko' ? '← 좌우로 스크롤하여 전체 기능 확인'
         : lang === 'en' ? '← scroll to see all features'
         : lang === 'ja' ? '← 左右にスクロールして確認'
         : '← 左右滑动查看全部功能'}
      </p>
    </div>
  )
}
