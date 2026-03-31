'use client'
import { useState, useEffect } from 'react'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const STEPS: Record<Lang, { label: string; steps: string[]; platforms: string[]; langs: { flag: string; name: string; preview: string }[] }> = {
  ko: {
    label: '자동 발행 과정',
    steps: ['제품 정보 입력', 'AI 4개국어 동시 생성', '플랫폼별 최적화', '1-클릭 발행 완료'],
    platforms: ['Amazon JP', 'Tmall CN', 'Rakuten', 'Shopify'],
    langs: [
      { flag: '🇰🇷', name: '한국어', preview: '"피부 속부터 채우는 히알루론산 앰플. 2주 만에 피부결 개선 87%."' },
      { flag: '🇺🇸', name: 'English', preview: '"Deep hydration serum with 3% Hyaluronic Acid. 87% saw visibly smoother skin in 14 days."' },
      { flag: '🇯🇵', name: '日本語', preview: '"潤い成分ヒアルロン酸3%配合。使用2週間で87%の方が肌質改善を実感。"' },
      { flag: '🇨🇳', name: '中文',   preview: '"补水精华液，3%玻尿酸深层锁水。14天使用后87%用户感受到肌肤改善。"' },
    ],
  },
  en: {
    label: 'Auto-Publish Flow',
    steps: ['Enter Product Info', 'AI Generates 4 Languages', 'Platform Optimization', '1-Click Published'],
    platforms: ['Amazon JP', 'Tmall CN', 'Rakuten', 'Shopify'],
    langs: [
      { flag: '🇰🇷', name: '한국어', preview: '"피부 속부터 채우는 히알루론산 앰플. 2주 만에 피부결 개선 87%."' },
      { flag: '🇺🇸', name: 'English', preview: '"Deep hydration serum with 3% Hyaluronic Acid. 87% saw smoother skin in 14 days."' },
      { flag: '🇯🇵', name: '日本語', preview: '"潤い成分ヒアルロン酸3%配合。2週間で87%が肌質改善を実感。"' },
      { flag: '🇨🇳', name: '中文',   preview: '"补水精华液3%玻尿酸，14天87%用户感受肌肤改善。"' },
    ],
  },
  ja: {
    label: '自動発行フロー',
    steps: ['商品情報を入力', 'AI 4言語同時生成', 'プラットフォーム最適化', '1クリック発行完了'],
    platforms: ['Amazon JP', '天猫 CN', '楽天', 'Shopify'],
    langs: [
      { flag: '🇰🇷', name: '한국어', preview: '"피부 속부터 채우는 히알루론산 앰플. 87% 개선."' },
      { flag: '🇺🇸', name: 'English', preview: '"Deep hydration serum. 87% saw smoother skin in 14 days."' },
      { flag: '🇯🇵', name: '日本語', preview: '"ヒアルロン酸3%配合の潤い美容液。2週間で87%が実感。"' },
      { flag: '🇨🇳', name: '中文',   preview: '"3%玻尿酸精华，14天87%改善，天猫爆款推荐。"' },
    ],
  },
  zh: {
    label: '自动发布流程',
    steps: ['输入商品信息', 'AI 4语言同时生成', '各平台自动优化', '一键发布完成'],
    platforms: ['Amazon JP', '天猫全球购', '乐天', 'Shopify'],
    langs: [
      { flag: '🇰🇷', name: '한국어', preview: '"피부 속부터 채우는 히알루론산 앰플. 87% 개선."' },
      { flag: '🇺🇸', name: 'English', preview: '"Deep hydration serum. 87% smoother skin in 14 days."' },
      { flag: '🇯🇵', name: '日本語', preview: '"ヒアルロン酸3%配合。2週間で87%が改善を実感。"' },
      { flag: '🇨🇳', name: '中文',   preview: '"3%玻尿酸精华，14天87%用户改善，天猫爆款。"' },
    ],
  },
}

const ACCENT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899']
const PLATFORM_COLORS: Record<string, string> = {
  'Amazon JP': '#FF9900',
  'Tmall CN': '#E53E3E',
  'Tmall Global': '#E53E3E',
  '天猫 CN': '#E53E3E',
  '天猫全球购': '#E53E3E',
  'Rakuten': '#BF0000',
  '楽天': '#BF0000',
  '乐天': '#BF0000',
  'Shopify': '#96BF48',
}

export default function DemoAnimation({ lang = 'ko' }: { lang?: Lang }) {
  const data = STEPS[lang] ?? STEPS.ko
  const [step, setStep] = useState(0)
  const [langsVisible, setLangsVisible] = useState<boolean[]>([false, false, false, false])
  const [platformsVisible, setPlatformsVisible] = useState<boolean[]>([false, false, false, false])
  const [published, setPublished] = useState(false)
  const [running, setRunning] = useState(false)

  function resetAndRun() {
    setStep(0)
    setLangsVisible([false, false, false, false])
    setPlatformsVisible([false, false, false, false])
    setPublished(false)
    setRunning(true)
  }

  useEffect(() => {
    // Auto-start on mount
    const t = setTimeout(() => resetAndRun(), 800)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!running) return

    // Step 0 → 1 after 600ms
    const t1 = setTimeout(() => setStep(1), 600)

    // Step 1 → reveal langs one by one
    const t2 = setTimeout(() => { setStep(1); setLangsVisible([true, false, false, false]) }, 900)
    const t3 = setTimeout(() => setLangsVisible([true, true, false, false]), 1300)
    const t4 = setTimeout(() => setLangsVisible([true, true, true, false]), 1700)
    const t5 = setTimeout(() => setLangsVisible([true, true, true, true]), 2100)

    // Step 2 → platform optimization
    const t6 = setTimeout(() => setStep(2), 2700)
    const t7 = setTimeout(() => setPlatformsVisible([true, false, false, false]), 3000)
    const t8 = setTimeout(() => setPlatformsVisible([true, true, false, false]), 3350)
    const t9 = setTimeout(() => setPlatformsVisible([true, true, true, false]), 3700)
    const t10 = setTimeout(() => setPlatformsVisible([true, true, true, true]), 4050)

    // Step 3 → published
    const t11 = setTimeout(() => { setStep(3); setPublished(true) }, 4800)

    // Loop restart
    const tLoop = setTimeout(() => {
      setRunning(false)
      setTimeout(() => resetAndRun(), 1200)
    }, 7500)

    return () => [t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,tLoop].forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  return (
    <div className="max-w-4xl mx-auto px-5">
      {/* Step progress bar */}
      <div className="flex items-center justify-center gap-1 md:gap-2 mb-8 md:mb-10 overflow-x-auto pb-1">
        {data.steps.map((s, i) => (
          <div key={i} className="flex items-center gap-1 md:gap-2 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-500 ${
              step >= i
                ? 'bg-black text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${
                step > i ? 'bg-emerald-400 text-white' : step === i ? 'bg-white text-black' : 'bg-gray-300 text-gray-500'
              }`}>
                {step > i ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < data.steps.length - 1 && (
              <div className={`w-4 md:w-8 h-0.5 transition-all duration-700 ${step > i ? 'bg-black' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Input card */}
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden transition-all duration-500 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium ml-2">pagebeer.beer</span>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {lang === 'ko' ? '제품명' : lang === 'ja' ? '商品名' : lang === 'zh' ? '商品名称' : 'Product Name'}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 flex items-center gap-2">
                {step >= 0 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {lang === 'ja' ? 'ヒアルロン酸 モイスチャーセラム' : lang === 'zh' ? '玻尿酸保湿精华液' : '히알루론산 모이스처 세럼'}
                  </>
                ) : (
                  <span className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {lang === 'ko' ? '카테고리' : lang === 'ja' ? 'カテゴリ' : lang === 'zh' ? '分类' : 'Category'}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                💄 {lang === 'ja' ? 'コスメ・美容' : lang === 'zh' ? '美妆护肤' : lang === 'en' ? 'Beauty & Skincare' : '뷰티 · 스킨케어'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {lang === 'ko' ? '타겟 언어' : lang === 'ja' ? 'ターゲット言語' : lang === 'zh' ? '目标语言' : 'Target Language'}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['🇰🇷', '🇺🇸', '🇯🇵', '🇨🇳'].map((flag, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-lg text-sm font-bold border transition-all duration-300 ${
                    langsVisible[i] ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {flag}
                  </span>
                ))}
              </div>
            </div>

            {/* AI processing indicator */}
            <div className={`transition-all duration-500 overflow-hidden ${step >= 1 && step < 3 ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                <div className="flex gap-0.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <span className="text-xs font-bold text-indigo-600">
                  {lang === 'ko' ? 'AI 생성 중...' : lang === 'ja' ? 'AI生成中...' : lang === 'zh' ? 'AI生成中...' : 'AI generating...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="space-y-3">
          {/* 4 language outputs */}
          {data.langs.map((l, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl border shadow-sm px-4 py-3 transition-all duration-500 ${
                langsVisible[i] ? 'opacity-100 translate-y-0 shadow-md' : 'opacity-0 translate-y-3'
              }`}
              style={{ borderLeftWidth: 3, borderLeftColor: ACCENT_COLORS[i] }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{l.flag}</span>
                <span className="text-xs font-black text-gray-700">{l.name}</span>
                {langsVisible[i] && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">✓ Done</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{l.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform publish row */}
      <div className={`mt-6 transition-all duration-700 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center text-xs font-black text-gray-300 uppercase tracking-widest mb-4">
          {lang === 'ko' ? '플랫폼 자동 발행' : lang === 'ja' ? 'プラットフォーム自動発行' : lang === 'zh' ? '平台自动发布' : 'Auto-Publishing to Platforms'}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          {data.platforms.map((p, i) => {
            const color = PLATFORM_COLORS[p] ?? '#6B7280'
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-black transition-all duration-500 ${
                  platformsVisible[i]
                    ? 'opacity-100 scale-100 shadow-lg'
                    : 'opacity-0 scale-90'
                }`}
                style={{
                  borderColor: platformsVisible[i] ? color : '#e5e7eb',
                  color: platformsVisible[i] ? color : '#9ca3af',
                  backgroundColor: platformsVisible[i] ? `${color}10` : 'white',
                }}
              >
                {platformsVisible[i] ? (
                  <>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                      style={{ background: color }}>✓</span>
                    {p}
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-current animate-spin border-t-transparent" />
                    {p}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Published success banner */}
      <div className={`mt-6 transition-all duration-700 ${published ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <p className="text-sm font-black text-emerald-700">
            {lang === 'ko' ? '4개 언어 · 4개 플랫폼 동시 발행 완료!' :
             lang === 'ja' ? '4言語 · 4プラットフォーム同時発行完了！' :
             lang === 'zh' ? '4语言 · 4平台同时发布完成！' :
             '4 Languages · 4 Platforms Published Simultaneously!'}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5 font-medium">
            {lang === 'ko' ? '총 소요시간 5분 미만' :
             lang === 'ja' ? '総所要時間5分未満' :
             lang === 'zh' ? '总耗时不足5分钟' :
             'Total time under 5 minutes'}
          </p>
        </div>
      </div>

      {/* Replay button */}
      <div className="text-center mt-5">
        <button
          type="button"
          onClick={resetAndRun}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors underline underline-offset-2"
        >
          {lang === 'ko' ? '▶ 다시 보기' : lang === 'ja' ? '▶ もう一度見る' : lang === 'zh' ? '▶ 重新播放' : '▶ Replay'}
        </button>
      </div>
    </div>
  )
}
