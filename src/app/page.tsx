'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import DemoAnimation from '@/components/DemoAnimation'
import CompareSection from '@/components/CompareSection'
import BeforeAfterSection from '@/components/BeforeAfterSection'
import PricingSection from '@/components/PricingSection'
import LiveTicker from '@/components/LiveTicker'
import NewsletterForm from '@/components/NewsletterForm'
import CountdownBanner from '@/components/CountdownBanner'
import LangSwitcher from '@/components/LangSwitcher'
import Logo from '@/components/Logo'
import InternalSeoPills from '@/components/InternalSeoPills'
import HomeJsonLd from '@/components/HomeJsonLd'

const LANG_CARDS = [
  { flag: '🇰🇷', lang: 'KR', name: '한국어', platform: '스마트스토어', example: '감성적 스타일, SEO 최적화', color: '#3B82F6' },
  { flag: '🇺🇸', lang: 'EN', name: 'English', platform: 'Amazon JP', example: 'Benefit-first, data-driven', color: '#8B5CF6' },
  { flag: '🇯🇵', lang: 'JP', name: '日本語', platform: '楽天 Rakuten', example: '敬語スタイル・季節感', color: '#EC4899' },
  { flag: '🇨🇳', lang: 'CN', name: '中文', platform: 'Tmall 天猫', example: '天猫爆款·社交证明', color: '#F59E0B' },
]

const PLATFORMS = [
  { name: 'Amazon JP', abbr: 'AMZ', color: '#FF9900' },
  { name: 'Tmall', abbr: 'TMall', color: '#E43226' },
  { name: '楽天', abbr: 'RKT', color: '#BF0000' },
  { name: 'Shopify', abbr: 'SHF', color: '#96BF48' },
  { name: 'Qoo10', abbr: 'Q10', color: '#E1261C' },
  { name: 'Lazada', abbr: 'LZD', color: '#F57226' },
  { name: 'Smartstore', abbr: 'SS', color: '#03C75A' },
]

const STEPS = [
  {
    n: '01',
    icon: '🔗',
    title: 'Paste URL or describe',
    desc: 'Drop any product URL (Smartstore, Amazon, Tmall...) or type a quick description. AI auto-fills everything.',
    time: '~30 sec',
  },
  {
    n: '02',
    icon: '⚡',
    title: 'AI generates 4 languages',
    desc: 'One click → KR · EN · JP · CN simultaneously. Each culturally localized, not just translated.',
    time: '~60 sec',
  },
  {
    n: '03',
    icon: '📦',
    title: 'Export & publish',
    desc: 'Download ZIP, copy to platform, or export PDF. Amazon A+, Tmall 详情页, 楽天商品ページ — all formatted.',
    time: '1 click',
  },
]

const REVIEWS = [
  { name: '이지윤', role: 'Beauty Cross-border · KR→JP', stars: 5, text: 'Japanese Rakuten-style keigo output in seconds. Saved ₩400K/month on translation.', badge: '번역비 90% 절감' },
  { name: '고우빈', role: 'Amazon JP Seller', stars: 5, text: 'Amazon A+ Content bullet points auto-formatted. Launch speed is 5x faster now.', badge: 'Amazon 런칭 5× 빠름' },
  { name: '신재연', role: 'Tmall Global Brand Manager', stars: 5, text: '天猫爆款 style content in one go. CTR jumped visibly within the first week.', badge: 'Tmall CTR +22%' },
  { name: '조수양', role: 'D2C Healthcare Brand', stars: 5, text: 'KR·EN·JP·CN all at once is a game changer. Now launching in 4 countries solo.', badge: '4개국 동시 출시' },
  { name: '박민준', role: 'Qoo10 Beauty Seller', stars: 5, text: 'Cross-border mode → Qoo10 → perfect format. One-click copy-paste to platform.', badge: '플랫폼 최적화 자동' },
  { name: '김서현', role: 'Shopify Global Store', stars: 5, text: 'No other AI does cultural nuance across EN/JP/CN simultaneously. PageAI is truly unique.', badge: '전환율 2× 향상' },
]

const FAQS = [
  { q: 'Can I generate all 4 languages at once?', a: 'Yes. Select "All Languages" output and one generation produces KR · EN · JP · CN — each culturally localized (Japanese keigo, Chinese 天猫 style, English Amazon A+ format).' },
  { q: 'Does it work with Amazon JP, Tmall, and Rakuten directly?', a: 'Yes. Cross-border mode selects your platform and auto-formats: Amazon A+ Content (5 bullet points), Tmall 详情页 structure, 楽天商品ページ style.' },
  { q: 'Is this real localization or just translation?', a: 'Real localization. Japan: seasonal nuance + formality. China: KOL proof + promo-first. English: benefit-first + data trust. Each country gets its own persuasion logic.' },
  { q: 'How does URL auto-fill work?', a: 'Paste any product URL (Smartstore, Coupang, Amazon, Shopify) and AI scrapes + analyzes the page to auto-fill product name, category, and description.' },
  { q: 'How long does it take to create one page?', a: '30 sec input + 60 sec generation = under 2 minutes. Compare to 2+ weeks waiting for multilingual outsourcing.' },
  { q: 'How much does it cost vs outsourcing?', a: 'Multilingual outsourcing: ₩1.2M–3.2M per set. PageAI Pro ($29/mo) = unlimited generations. 95%+ cost reduction.' },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeLang, setActiveLang] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const id = setInterval(() => setActiveLang(i => (i + 1) % LANG_CARDS.length), 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const root = pageRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    root.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <HomeJsonLd />
      <CountdownBanner />

      {/* ═══ NAV ═══════════════════════════════════════════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10' : 'bg-[#0F172A]'}`}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
          </Link>
          <div className="hidden md:flex items-center gap-7">
            <a href="#how" className="text-gray-400 text-sm hover:text-white transition-colors font-medium">How it works</a>
            <a href="#features" className="text-gray-400 text-sm hover:text-white transition-colors font-medium">Features</a>
            <a href="#reviews" className="text-gray-400 text-sm hover:text-white transition-colors font-medium">Reviews</a>
            <a href="#pricing" className="text-gray-400 text-sm hover:text-white transition-colors font-medium">Pricing</a>
            <Link href="/blog" className="text-gray-400 text-sm hover:text-white transition-colors font-medium">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher current="ko" />
            <Link href="/login" className="text-sm text-gray-400 hover:text-white font-medium transition-colors hidden sm:block">Sign in</Link>
            <Link href="/login" className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="relative bg-[#0F172A] min-h-[85vh] sm:min-h-[88vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* 배경 gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[160px]" />
        </div>

        {/* grid dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-16 md:py-24 w-full">
          {/* 소셜 프루프 배지 */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-gray-300 text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>1,247 cross-border sellers · Avg SEO Score 86 · 🇰🇷🇺🇸🇯🇵🇨🇳</span>
            </div>
          </div>

          {/* 메인 헤드라인 */}
          <h1
            className="text-center text-[40px] sm:text-[56px] md:text-[80px] font-black leading-[0.88] tracking-[-0.04em] mb-6"
            style={{ fontFamily: "'Satoshi', 'Pretendard', sans-serif" }}
          >
            <span className="text-white block">Create Perfect</span>
            <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Product Pages
            </span>
            <span className="text-white block">in 4 Languages</span>
            <span className="text-gray-500 block">in 5 Minutes.</span>
          </h1>

          {/* 서브헤드 */}
          <p className="text-center text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium px-2">
            One input → <span className="text-white font-bold">KR · EN · JP · CN simultaneously.</span><br className="hidden sm:block" />
            Fully optimized for Amazon JP, Tmall, Rakuten, Shopify, Qoo10 & more.
          </p>

          {/* 4개국어 플래그 배지 */}
          <div className="flex justify-center gap-2 md:gap-3 mb-10 flex-wrap px-2">
            {LANG_CARDS.map((lc, i) => (
              <div
                key={lc.lang}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl border transition-all duration-500 cursor-default ${
                  activeLang === i
                    ? 'border-white/30 bg-white/10 scale-105 shadow-lg'
                    : 'border-white/10 bg-white/3'
                }`}
              >
                <span className="text-lg md:text-xl">{lc.flag}</span>
                <div>
                  <p className="text-white text-xs md:text-sm font-black leading-none">{lc.lang}</p>
                  <p className="text-gray-500 text-[10px] leading-none mt-0.5 hidden sm:block">{lc.platform}</p>
                </div>
                {activeLang === i && (
                  <span className="hidden md:block text-[10px] font-semibold text-gray-300 bg-white/10 px-2 py-0.5 rounded-full ml-1">
                    {lc.example}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 px-4 sm:px-0">
            <Link
              href="/login"
              className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:opacity-90 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/30 active:scale-100 text-center"
            >
              Start Free Now — No Credit Card
            </Link>
            <Link
              href="/login"
              className="border border-white/20 text-white px-7 md:px-10 py-4 rounded-2xl text-base font-bold hover:bg-white/10 transition-all text-center backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <span className="text-sm">▶</span> Watch 4-Language Demo
            </Link>
          </div>

          {/* 하단 미니 통계 */}
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            {[
              { v: '5 min', l: 'per content set' },
              { v: '4 langs', l: 'simultaneously' },
              { v: '6 platforms', l: 'auto-optimized' },
              { v: '$0', l: 'to start' },
            ].map(s => (
              <div key={s.l} className="flex items-center gap-1.5">
                <span className="text-white font-black text-sm">{s.v}</span>
                <span className="text-gray-500 text-xs">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM TRUST BAR ═════════════════════════════ */}
      <section className="bg-[#0A0F1A] border-b border-white/5 py-5 overflow-hidden">
        <p className="text-center text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Optimized for every global platform</p>
        <div className="flex gap-4 md:gap-6 justify-center flex-wrap px-5">
          {PLATFORMS.map(p => (
            <div key={p.name} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-xs font-bold">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CROSS-BORDER BANNER ════════════════════════════ */}
      <section className="bg-[#0A0F1A] py-6 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-950/80 via-[#0F172A] to-teal-950/80 px-6 md:px-10 py-6 md:py-7">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #10b981 0%, transparent 60%)' }} />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              {/* 왼쪽 텍스트 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl">🌏</span>
                  <span className="text-white font-black text-lg md:text-xl tracking-tight">Cross-Border Mode</span>
                  <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">ON</span>
                </div>
                <p className="text-gray-400 text-sm md:text-base">
                  <span className="text-white font-semibold">4 Languages + Global Platform Optimization</span> — one click, four countries, zero outsourcing.
                </p>
              </div>
              {/* 플랫폼 태그 */}
              <div className="flex flex-wrap gap-2">
                {['Amazon JP', 'Tmall CN', '楽天', 'Shopify', 'Qoo10', 'Lazada'].map(p => (
                  <span key={p} className="bg-white/8 border border-white/10 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/15 transition-colors">{p}</span>
                ))}
              </div>
              {/* CTA */}
              <Link href="/login" className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black px-5 py-3 rounded-xl hover:opacity-90 transition-all hover:scale-105 whitespace-nowrap">
                Try Cross-Border →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════ */}
      <section id="how" className="bg-[#0F172A] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14 md:mb-18">
            <p className="reveal text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              From idea to 4 languages<br />
              <span className="text-gray-500">in under 2 minutes.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 relative">
            {/* 연결선 */}
            <div className="hidden md:block absolute top-12 left-[calc(33.3%-1px)] right-[calc(33.3%-1px)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {STEPS.map((step, i) => (
              <div key={i} className={`reveal delay-${i * 100} group relative bg-white/3 border border-white/8 rounded-3xl p-7 md:p-8 hover:bg-white/6 hover:border-white/20 transition-all`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{step.icon}</span>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-gray-600 tracking-widest">{step.n}</span>
                    <div className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full inline-block ml-2">{step.time}</div>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-2 tracking-tight">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES BENTO GRID ════════════════════════════ */}
      <section id="features" className="bg-[#080D16] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">Core Features</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Everything global sellers<br />
              <span className="text-gray-600">actually need.</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* 대형 카드 — 4개국어 동시 생성 (col-span-8) */}
            <div className="reveal-left md:col-span-8 relative bg-gradient-to-br from-blue-950/80 to-violet-950/80 border border-blue-500/20 rounded-3xl p-8 md:p-10 overflow-hidden group hover:border-blue-400/30 transition-all">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl group-hover:bg-blue-500/25 transition-all duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full mb-5 tracking-wide uppercase">🌏 Signature Feature</div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">4-Language Simultaneous<br />Generation</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                  One input, four culturally-adapted outputs. Japanese gets <span className="text-blue-300 font-semibold">敬語 keigo</span>, Chinese gets <span className="text-blue-300 font-semibold">天猫爆款 style</span>, English gets <span className="text-blue-300 font-semibold">Amazon A+ format</span>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {LANG_CARDS.map(lc => (
                    <div key={lc.lang} className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/12 transition-colors">
                      <span className="text-base">{lc.flag}</span>
                      <div>
                        <p className="text-white text-xs font-black">{lc.lang} · {lc.name}</p>
                        <p className="text-gray-500 text-[10px]">{lc.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 소형 카드 — URL 자동 입력 (col-span-4) */}
            <div className="reveal-right delay-100 md:col-span-4 bg-white/3 border border-white/8 rounded-3xl p-7 hover:bg-white/6 hover:border-white/20 transition-all group">
              <div className="text-4xl mb-5">⚡</div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">URL Auto-Fill</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Paste any product URL — Smartstore, Amazon, Tmall, Shopify. AI scrapes & fills everything automatically.</p>
              <div className="mt-5 bg-black/30 rounded-xl p-3 border border-white/5">
                <p className="text-gray-600 text-xs font-mono">smartstore.naver.com/...</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-emerald-400 text-xs font-semibold">AI analyzing product...</p>
                </div>
              </div>
            </div>

            {/* 소형 카드 — 전환율 예측 (col-span-4) */}
            <div className="reveal delay-200 md:col-span-4 bg-white/3 border border-white/8 rounded-3xl p-7 hover:bg-white/6 hover:border-white/20 transition-all">
              <div className="text-4xl mb-5">📊</div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Conversion Predictor</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">After generation, get estimated CVR per market.</p>
              <div className="space-y-2">
                {[
                  { p: 'Amazon JP', v: '+18%', c: 'text-blue-400' },
                  { p: 'Tmall CN', v: '+22%', c: 'text-red-400' },
                  { p: 'Rakuten', v: '+14%', c: 'text-rose-400' },
                ].map(r => (
                  <div key={r.p} className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{r.p}</span>
                    <span className={`text-xs font-black ${r.c}`}>{r.v} CVR</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 대형 카드 — 플랫폼 최적화 (col-span-8) */}
            <div className="reveal-right delay-300 md:col-span-8 relative bg-gradient-to-br from-emerald-950/70 to-teal-950/70 border border-emerald-500/20 rounded-3xl p-8 md:p-10 overflow-hidden group hover:border-emerald-400/30 transition-all">
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl group-hover:bg-emerald-500/25 transition-all duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full mb-5 tracking-wide uppercase">🛒 Platform Intelligence</div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Auto-Optimized for<br />Every Platform</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                  Select platform → content auto-formats. Amazon A+ (5 bullets), Tmall 详情页 structure, 楽天 product page style. Zero manual reformatting.
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {PLATFORMS.map(p => (
                    <div key={p.name} className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <p className="text-white text-xs font-black">{p.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ DEMO SECTION ═══════════════════════════════════ */}
      <section className="bg-[#0F172A] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-12">
            <p className="reveal text-[10px] font-black text-pink-400 uppercase tracking-widest mb-3">Live Demo</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Watch it work —<br />
              <span className="text-gray-500">real-time auto-publish flow.</span>
            </h2>
            <p className="reveal delay-200 text-gray-400 text-sm mt-3 font-medium">Input → AI 4-language generation → Amazon · Tmall · Rakuten · Shopify optimization</p>
          </div>

          {/* 데스크톱: 브라우저 프레임 */}
          <div className="reveal-scale hidden md:block">
            <div className="bg-[#1E293B] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              {/* 브라우저 탑바 */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#0F172A]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <span className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1 text-gray-500 text-xs font-mono">pagebeer.beer/order/new</div>
                </div>
              </div>
              <DemoAnimation lang="ko" />
            </div>
          </div>

          {/* 모바일: 스마트폰 프레임 */}
          <div className="reveal-scale flex justify-center md:hidden">
            <div className="phone-frame">
              <div className="pt-6 h-full overflow-y-auto">
                <DemoAnimation lang="ko" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════ */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[
              { v: '4', unit: 'languages', l: 'per generation', color: 'from-blue-600 to-violet-600' },
              { v: '6', unit: 'platforms', l: 'auto-optimized', color: 'from-emerald-500 to-teal-500' },
              { v: '2×', unit: 'conversion', l: 'vs plain translation', color: 'from-orange-500 to-amber-500' },
              { v: '95%', unit: 'cost saved', l: 'vs outsourcing', color: 'from-rose-500 to-pink-500' },
            ].map((s, i) => (
              <div key={i} className={`reveal delay-${i * 100} text-center py-8 md:py-10 border border-gray-100 rounded-3xl hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all`}>
                <div className={`text-4xl md:text-6xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent tracking-[-0.04em] mb-1`}>{s.v}</div>
                <div className="text-xs md:text-sm font-black text-gray-700 mb-0.5">{s.unit}</div>
                <div className="text-xs text-gray-300">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═════════════════════════════════ */}
      <BeforeAfterSection lang="ko" />

      {/* ═══ COMPARE ════════════════════════════════════════ */}
      <CompareSection lang="ko" />

      {/* ═══ INTERNAL SEO ═══════════════════════════════════ */}
      <InternalSeoPills />

      {/* ═══ BEFORE/AFTER DATA ══════════════════════════════ */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <p className="reveal text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Real seller results · Beta tester data</p>
          <div className="reveal-scale bg-white border border-gray-100 rounded-3xl p-7 md:p-10 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { before: '2 weeks', after: '5 min', label: 'Content creation time', delta: '↓97%', color: 'text-blue-600' },
                { before: '$2,400', after: '$29', label: '4-language content cost/mo', delta: '↓99%', color: 'text-violet-600' },
                { before: '1.2%', after: '2.8%', label: 'Amazon JP conversion rate', delta: '+133%', color: 'text-emerald-600' },
                { before: '1 market', after: '4 markets', label: 'Simultaneous launch', delta: '4×', color: 'text-orange-500' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-gray-300 text-base font-black line-through mb-1">{stat.before}</div>
                  <div className={`text-3xl md:text-4xl font-black ${stat.color} mb-1 tracking-tight`}>{stat.after}</div>
                  <div className={`text-xs font-black ${stat.color} border border-current/30 px-2 py-0.5 rounded-full inline-block mb-2`}>{stat.delta}</div>
                  <div className="text-gray-400 text-xs font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 플랫폼 로고 */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {PLATFORMS.map(p => (
              <div key={p.name} className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-gray-600 font-black text-xs">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ════════════════════════════════════════ */}
      <section id="reviews" className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <p className="reveal text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Real reviews</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-tight mb-3">
              Sellers who switched<br />
              <span className="text-gray-300">never went back.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className={`reveal delay-${Math.min(i * 100, 400)} bg-white border border-gray-100 rounded-3xl p-6 md:p-7 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-100 transition-all hover:-translate-y-1`}>
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(n => <span key={n} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <span className="inline-block bg-[#0F172A] text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase">{r.badge}</span>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 font-medium">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black bg-gradient-to-br from-blue-500 to-violet-500">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#0F172A]">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ════════════════════════════════════════ */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* ═══ FAQ ════════════════════════════════════════════ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 md:px-6 py-20 md:py-28">
        <div className="text-center mb-12">
          <p className="reveal text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight">Got questions?</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`reveal delay-${Math.min(i * 50, 300)} border rounded-2xl overflow-hidden transition-all ${openFaq === i ? 'border-[#0F172A]' : 'border-gray-100 hover:border-gray-300'}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-5 text-left"
              >
                <span className="font-bold text-[#0F172A] pr-4 text-sm md:text-base">{faq.q}</span>
                <span className={`text-xl font-light shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ NEWSLETTER ══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 pb-10">
        <NewsletterForm lang="ko" />
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════ */}
      <section className="mx-4 md:mx-6 mb-16">
        <div
          className="reveal-scale max-w-5xl mx-auto rounded-3xl p-10 md:p-20 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-40 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-5">Ready to go global?</p>
            <h2
              className="text-4xl md:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-4"
              style={{ fontFamily: "'Satoshi', 'Pretendard', sans-serif" }}
            >
              Your first 4-language<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">product page is free.</span>
            </h2>
            <p className="text-gray-400 mb-2 text-base md:text-lg">No credit card · Start in 30 seconds</p>
            <p className="text-gray-600 text-sm mb-10">🇰🇷 한국어 · 🇺🇸 English · 🇯🇵 日本語 · 🇨🇳 中文</p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-blue-500 to-violet-500 text-white px-10 md:px-16 py-5 rounded-2xl text-base md:text-xl font-black hover:opacity-90 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
            >
              Create My First Page — Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════ */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-5 md:px-6 py-12 pb-28 md:pb-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            <div>
              <Logo size={28} className="mb-3" />
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-5">Turn any product into a 4-language global selling machine in 5 minutes.</p>
              {/* 글로벌 언어 링크 */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { href: '/', flag: '🇰🇷', label: '한국어' },
                  { href: '/en', flag: '🇺🇸', label: 'English' },
                  { href: '/ja', flag: '🇯🇵', label: '日本語' },
                  { href: '/zh', flag: '🇨🇳', label: '中文' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 border border-white/10 rounded-full px-2.5 py-1 hover:border-white/30 transition-colors">
                    {l.flag} {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm text-gray-500">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#reviews" className="hover:text-white transition-colors">Reviews</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/samples" className="hover:text-white transition-colors">Samples</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">© 2026 PageAI · pagebeer.beer. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-600">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ LIVE TICKER ══════════════════════════════════════ */}
      <LiveTicker lang="ko" />

      {/* ═══ MOBILE FLOATING CTA ══════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-area-inset-bottom">
        <Link
          href="/login"
          className="block w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white text-center font-black text-base py-[17px] rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-blue-500/30"
        >
          Start Free Now — No Credit Card
        </Link>
      </div>
    </main>
  )
}
