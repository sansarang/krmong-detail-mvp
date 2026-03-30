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
    { badge: '결과',    title: 'AI 결과 미리보기' },
    { badge: '채널',    title: '채널 발행 키트' },
    { badge: '전환',    title: '전환 팁 & 훅 문장' },
    { badge: 'A/B',     title: 'A/B 카피 3안' },
    { badge: 'B2B',     title: 'B2B + 에셋 키트' },
  ],
  en: [
    { badge: 'Result',   title: 'AI Result Preview' },
    { badge: 'Channel',  title: 'Channel Publish Kit' },
    { badge: 'Convert',  title: 'Tips & Hook Sentences' },
    { badge: 'A/B',      title: 'A/B Copy Variants' },
    { badge: 'B2B',      title: 'B2B + Asset Kit' },
  ],
  ja: [
    { badge: '結果',      title: 'AI結果プレビュー' },
    { badge: 'チャネル',  title: 'チャネル発行キット' },
    { badge: '転換',      title: 'ヒント & フック文' },
    { badge: 'A/B',       title: 'A/Bコピー3案' },
    { badge: 'B2B',       title: 'B2B + アセットキット' },
  ],
  zh: [
    { badge: '结果',   title: 'AI结果预览' },
    { badge: '渠道',   title: '渠道发布套件' },
    { badge: '转化',   title: '技巧 & 钩子句' },
    { badge: 'A/B',    title: 'A/B文案三套' },
    { badge: 'B2B',    title: 'B2B + 素材套件' },
  ],
}

/* 5장 × 2 = 10장으로 무한 루프 */
const DOUBLED = [...SLIDES, ...SLIDES]

export default function DemoAnimation({ lang = 'ko' }: { lang?: Lang }) {
  const labels = LABELS[lang] ?? LABELS.ko
  /* 라벨도 2배로 복제 */
  const doubled = [...labels, ...labels]

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-5 animate-demo-marquee" style={{ width: 'max-content' }}>
        {DOUBLED.map((src, i) => {
          const idx = i % SLIDES.length
          const lbl = doubled[i]
          return (
            <div key={i} className="flex-none" style={{ width: 260 }}>
              {/* label */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: `${ACCENT[idx]}18`, color: ACCENT[idx] }}
                >
                  {lbl.badge}
                </span>
                <span className="text-[11px] font-bold text-gray-600 truncate">
                  {lbl.title}
                </span>
              </div>
              {/* card */}
              <div
                className="rounded-xl overflow-hidden border border-gray-100 shadow-md bg-white"
                style={{ borderTop: `3px solid ${ACCENT[idx]}` }}
              >
                <Image
                  src={src}
                  alt={lbl.title}
                  width={520}
                  height={900}
                  className="w-full h-auto block"
                  priority={i < 2}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
