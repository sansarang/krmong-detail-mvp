'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import DemoAnimation from '@/components/DemoAnimation'
import PricingSection from '@/components/PricingSection'
import LiveTicker from '@/components/LiveTicker'
import NewsletterForm from '@/components/NewsletterForm'
import CountdownBanner from '@/components/CountdownBanner'
import LangSwitcher from '@/components/LangSwitcher'
import Logo from '@/components/Logo'
import HomeJsonLd from '@/components/HomeJsonLd'

/* ─── Data ──────────────────────────────────────────────── */

const LANG_TABS = [
  {
    flag: '🇰🇷', code: 'KR', name: 'Korean',
    platform: 'Smartstore · Coupang',
    style: 'Emotional tone, SEO-optimized',
    color: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/30',
  },
  {
    flag: '🇺🇸', code: 'EN', name: 'English',
    platform: 'Amazon JP · Shopify',
    style: 'Benefit-first, data-driven A+',
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
  },
  {
    flag: '🇯🇵', code: 'JP', name: 'Japanese',
    platform: '楽天 · Yahoo! Japan',
    style: 'Keigo style, seasonal nuance',
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/30',
  },
  {
    flag: '🇨🇳', code: 'CN', name: 'Chinese',
    platform: 'Tmall · JD.com',
    style: '天猫爆款 · Social proof-first',
    color: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
  },
]

const PLATFORMS = [
  { name: 'Amazon JP', color: '#FF9900' },
  { name: 'Tmall', color: '#E43226' },
  { name: '楽天 Rakuten', color: '#BF0000' },
  { name: 'Shopify', color: '#96BF48' },
  { name: 'Qoo10', color: '#E1261C' },
  { name: 'Lazada', color: '#F57226' },
  { name: 'Smartstore', color: '#03C75A' },
]

const STEPS = [
  {
    n: '01', icon: '🔗',
    title: 'Paste URL or describe',
    desc: 'Drop any product URL (Smartstore, Amazon, Tmall, Shopify…) or type a quick description. AI auto-fills all fields.',
    badge: '~30 sec',
  },
  {
    n: '02', icon: '⚡',
    title: 'AI generates 4 languages at once',
    desc: 'One click → KR · EN · JP · CN simultaneously. Each output is culturally adapted — not just translated.',
    badge: '~60 sec',
  },
  {
    n: '03', icon: '📦',
    title: 'Export & publish anywhere',
    desc: 'Download ZIP, copy to platform, or export PDF. Amazon A+, Tmall 详情页, 楽天商品ページ — perfectly formatted.',
    badge: '1 click',
  },
]

const REVIEWS = [
  {
    name: 'Jiyoon Lee', role: 'Beauty Cross-border Seller · KR→JP',
    badge: '90% translation cost saved',
    text: 'Japanese Rakuten-style keigo output in seconds. No more nuance errors. Saved $300/month on translators.',
  },
  {
    name: 'Woobin Ko', role: 'Amazon JP Seller',
    badge: '5× faster Amazon launch',
    text: 'Amazon A+ Content with 5 bullet points auto-formatted. No copywriter needed. My launch speed completely changed.',
  },
  {
    name: 'Jaeyeon Shin', role: 'Tmall Global Brand Manager',
    badge: 'Tmall CTR +22%',
    text: '天猫爆款 style content out of the box. Chinese localization is genuinely accurate — CTR jumped within a week.',
  },
  {
    name: 'Suyang Jo', role: 'D2C Healthcare Brand CEO',
    badge: '4-country launch in one go',
    text: 'KR · EN · JP · CN all at once is a complete game changer. Used to outsource each separately. Now I do it alone.',
  },
  {
    name: 'Minjun Park', role: 'Qoo10 Beauty Seller',
    badge: 'Platform auto-optimized',
    text: 'Cross-border mode → select Qoo10 → perfect format. One-click copy-paste and done. Incredibly smooth workflow.',
  },
  {
    name: 'Seohyun Kim', role: 'Shopify Global Store Owner',
    badge: '2× conversion rate',
    text: 'No other AI handles cultural nuance across EN/JP/CN at the same time. PageAI is genuinely in a class of its own.',
  },
]

const FAQS = [
  {
    q: 'Can I really generate all 4 languages simultaneously?',
    a: 'Yes. Select "All Languages" and one generation produces KR · EN · JP · CN — each culturally localized. Japanese gets keigo formality, Chinese gets 天猫 social-proof style, English gets Amazon A+ bullet structure.',
  },
  {
    q: 'Does it work directly with Amazon JP, Tmall, and Rakuten?',
    a: 'Yes. In Cross-border Mode, select your platform and content auto-formats: Amazon A+ (5 bullets), Tmall 详情页 structure, 楽天商品ページ style. Zero manual reformatting.',
  },
  {
    q: 'Is this real localization or just machine translation?',
    a: 'Real localization. Japan: seasonal nuance + formality. China: KOL proof + promo-first structure. English: benefit-first + data trust. Each country gets its own persuasion logic — completely different from translation.',
  },
  {
    q: 'How does the URL auto-fill work?',
    a: 'Paste any product URL (Smartstore, Coupang, Amazon, Shopify) and AI scrapes & analyzes the page to auto-fill product name, category, and description — in about 10 seconds.',
  },
  {
    q: 'How long does it take to create one full set?',
    a: '30 sec input + 60 sec generation = under 2 minutes total. Compare to 2+ weeks waiting for multilingual copywriting outsourcing.',
  },
  {
    q: 'How much does it cost compared to outsourcing?',
    a: 'Multilingual outsourcing: $800–$2,400 per content set. PageAI Pro ($29/mo) = unlimited generations. That\'s a 95%+ cost reduction.',
  },
]

/* ─── Component ─────────────────────────────────────────── */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeLang, setActiveLang] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const pageRef = useRef<HTMLElement>(null)

  // Language tab auto-cycle
  useEffect(() => {
    const id = setInterval(() => setActiveLang(i => (i + 1) % LANG_TABS.length), 2200)
    return () => clearInterval(id)
  }, [])

  // Nav scroll effect
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const root = pageRef.current
    if (!root) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.07, rootMargin: '0px 0px -50px 0px' }
    )
    root.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <HomeJsonLd />
      <CountdownBanner />

      {/* ══════════════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════════════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0F172A]/96 backdrop-blur-2xl border-b border-white/8 shadow-2xl shadow-black/20' : 'bg-[#0F172A]'}`}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={32} />
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['#how','How it works'],['#features','Features'],['#reviews','Reviews'],['#pricing','Pricing'],['/blog','Blog']].map(([href,label]) => (
              <a key={href} href={href} className="text-gray-400 text-sm hover:text-white transition-colors font-medium">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LangSwitcher current="ko" />
            <Link href="/login" className="text-sm text-gray-400 hover:text-white font-medium transition-colors hidden sm:block">Sign in</Link>
            <Link href="/login" className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/20">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0F172A] min-h-[87vh] sm:min-h-[90vh] flex items-center overflow-hidden">

        {/* Gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-700/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px]" />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-5 py-16 md:py-28 text-center">

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/6 border border-white/12 text-gray-300 text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-sm mb-8 md:mb-10">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            <span>1,247 active sellers · Avg SEO Score 86 · 4 languages · 6 platforms</span>
          </div>

          {/* Main headline */}
          <h1
            className="text-[42px] sm:text-[60px] md:text-[82px] lg:text-[96px] font-black leading-[0.87] tracking-[-0.04em] mb-6 md:mb-8"
            style={{ fontFamily: "'Satoshi', 'Inter', 'Pretendard', sans-serif" }}
          >
            <span className="text-white">Create Perfect</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Product Pages</span>
            <br />
            <span className="text-white">in 4 Languages</span>
            <br />
            <span className="text-gray-500">in 5 Minutes.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium px-2">
            One input →{' '}
            <span className="text-white font-bold">KR · EN · JP · CN simultaneously.</span>
            <br className="hidden sm:block" />
            Fully optimized for Amazon JP, Tmall, Rakuten, Shopify, Qoo10 & more.
          </p>

          {/* 4-language animated tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-12 px-2">
            {LANG_TABS.map((tab, i) => (
              <button
                key={tab.code}
                onClick={() => setActiveLang(i)}
                className={`group relative flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl border transition-all duration-500 ${
                  activeLang === i
                    ? `bg-gradient-to-r ${tab.color} border-transparent shadow-xl ${tab.glow} scale-105`
                    : 'bg-white/4 border-white/10 hover:bg-white/8 hover:border-white/20'
                }`}
              >
                <span className="text-xl md:text-2xl">{tab.flag}</span>
                <div className="text-left">
                  <p className={`text-sm md:text-base font-black leading-none ${activeLang === i ? 'text-white' : 'text-gray-300'}`}>{tab.code}</p>
                  <p className={`text-[10px] leading-none mt-0.5 ${activeLang === i ? 'text-white/70' : 'text-gray-600'}`}>{tab.name}</p>
                </div>
                {activeLang === i && (
                  <span className="hidden lg:block text-[10px] font-semibold text-white/80 bg-white/15 px-2.5 py-1 rounded-full ml-1 max-w-[120px] truncate">
                    {tab.style}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 px-4 sm:px-0">
            <Link
              href="/login"
              className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-violet-600 text-white px-8 md:px-14 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:opacity-90 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/40 active:scale-100 text-center group"
            >
              <span className="relative z-10">Start Free Now — No Credit Card</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/login"
              className="border border-white/20 bg-white/3 text-white px-7 md:px-10 py-4 rounded-2xl text-base font-bold hover:bg-white/10 hover:border-white/30 transition-all text-center backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <span className="text-sm opacity-80">▶</span> Watch 4-Language Demo
            </Link>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {[
              ['5 min', 'per full content set'],
              ['4 languages', 'one generation'],
              ['6 platforms', 'auto-formatted'],
              ['Free', 'to start'],
            ].map(([v, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="text-white font-black">{v}</span>
                <span className="text-gray-600">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CROSS-BORDER BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0F1A] py-5 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-emerald-500/25 px-5 md:px-10 py-5 md:py-6" style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.5) 0%, rgba(15,23,42,0.9) 50%, rgba(19,78,74,0.4) 100%)' }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 85% 50%, #10b981, transparent 55%)' }} />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="text-2xl">🌏</span>
                  <span className="text-white font-black text-lg md:text-xl">Cross-Border Mode</span>
                  <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">NEW</span>
                </div>
                <p className="text-gray-400 text-sm md:text-base">
                  <span className="text-emerald-300 font-semibold">4 Languages + Global Platform Optimization</span> — one input, four countries, zero outsourcing.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {['Amazon JP', 'Tmall CN', '楽天', 'Shopify', 'Qoo10', 'Lazada'].map(p => (
                  <span key={p} className="bg-white/6 border border-white/10 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/12 transition-colors">{p}</span>
                ))}
              </div>
              <Link href="/login" className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black px-5 py-3 rounded-xl hover:opacity-90 transition-all hover:scale-105 whitespace-nowrap shadow-lg shadow-emerald-500/20">
                Try it free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PLATFORM TRUST BAR
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#080D16] border-b border-white/5 py-5">
        <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-widest mb-4">Optimized for every major global platform</p>
        <div className="flex flex-wrap gap-3 md:gap-6 justify-center px-5">
          {PLATFORMS.map(p => (
            <div key={p.name} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300 transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-xs font-bold">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="how" className="bg-[#0F172A] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-16">
            <p className="reveal text-[11px] font-black text-blue-400 uppercase tracking-[0.15em] mb-4">How it works</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              From product to 4-language<br />
              <span className="text-gray-600">content in under 2 minutes.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 relative">
            <div className="hidden md:block absolute top-14 left-[33.33%] right-[33.33%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
            {STEPS.map((step, i) => (
              <div key={i} className={`reveal delay-${i * 100} bg-white/[0.02] border border-white/[0.07] rounded-3xl p-7 md:p-8 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 group`}>
                <div className="flex items-start justify-between mb-6">
                  <span className="text-4xl">{step.icon}</span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-700 tracking-widest">{step.n}</p>
                    <span className="inline-block bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full mt-1">{step.badge}</span>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white mb-2.5 tracking-tight group-hover:text-blue-100 transition-colors">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES BENTO GRID
      ══════════════════════════════════════════════════════ */}
      <section id="features" className="bg-[#080D16] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-16">
            <p className="reveal text-[11px] font-black text-violet-400 uppercase tracking-[0.15em] mb-4">Core Features</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Everything global sellers<br />
              <span className="text-gray-700">actually need.</span>
            </h2>
          </div>

          {/* Bento layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Large — 4-language generation */}
            <div className="reveal-left md:col-span-8 relative rounded-3xl p-8 md:p-10 overflow-hidden border border-blue-500/15 group hover:border-blue-400/30 transition-all duration-500" style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.5), rgba(76,29,149,0.4), rgba(15,23,42,0.8))' }}>
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/12 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-wider">🌏 Flagship Feature</div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">4-Language Simultaneous<br />Generation</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-7 max-w-lg">
                  One input, four culturally-adapted outputs. Japanese gets{' '}
                  <span className="text-blue-300 font-semibold">keigo formality</span>, Chinese gets{' '}
                  <span className="text-blue-300 font-semibold">天猫爆款 style</span>, English gets{' '}
                  <span className="text-blue-300 font-semibold">Amazon A+ format</span>.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {LANG_TABS.map(t => (
                    <div key={t.code} className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3.5 py-2.5 hover:bg-white/10 transition-colors">
                      <span className="text-lg">{t.flag}</span>
                      <div>
                        <p className="text-white text-xs font-black">{t.code} · {t.name}</p>
                        <p className="text-gray-600 text-[10px]">{t.platform}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Small — URL auto-fill */}
            <div className="reveal-right delay-100 md:col-span-4 bg-white/[0.02] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 group">
              <span className="text-4xl block mb-5">⚡</span>
              <h3 className="text-xl font-black text-white mb-2.5 tracking-tight group-hover:text-blue-100 transition-colors">URL Auto-Fill</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">Paste any product URL and AI scrapes, analyzes & fills all fields automatically.</p>
              <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 font-mono">
                <p className="text-gray-600 text-xs truncate">amazon.co.jp/dp/B0CF...</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-emerald-400 text-xs font-semibold">Analyzing product...</p>
                </div>
              </div>
            </div>

            {/* Small — Conversion predictor */}
            <div className="reveal delay-200 md:col-span-4 bg-white/[0.02] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300">
              <span className="text-4xl block mb-5">📊</span>
              <h3 className="text-xl font-black text-white mb-2.5 tracking-tight">Conversion Predictor</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">Estimated CVR uplift per market, auto-generated after each output.</p>
              <div className="space-y-2.5">
                {[['Amazon JP', '+18%', 'text-blue-400'], ['Tmall CN', '+22%', 'text-red-400'], ['Rakuten', '+14%', 'text-rose-400']].map(([p, v, c]) => (
                  <div key={p} className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">{p}</span>
                    <span className={`text-xs font-black ${c}`}>{v} CVR</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Large — Platform optimization */}
            <div className="reveal-right delay-200 md:col-span-8 relative rounded-3xl p-8 md:p-10 overflow-hidden border border-emerald-500/15 group hover:border-emerald-400/30 transition-all duration-500" style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.5), rgba(19,78,74,0.4), rgba(15,23,42,0.8))' }}>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/18 transition-all duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-wider">🛒 Platform Intelligence</div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Auto-Optimized for<br />Every Platform</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-7 max-w-lg">
                  Select platform → content auto-formats. <span className="text-emerald-300 font-semibold">Amazon A+</span> (5 bullets), <span className="text-emerald-300 font-semibold">Tmall 详情页</span> structure, <span className="text-emerald-300 font-semibold">楽天商品ページ</span> style. Zero manual work.
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {PLATFORMS.map(p => (
                    <div key={p.name} className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <p className="text-white text-xs font-bold truncate">{p.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DEMO
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#0F172A] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-[11px] font-black text-pink-400 uppercase tracking-[0.15em] mb-4">Live Demo</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Watch the auto-publish<br />
              <span className="text-gray-600">flow in real time.</span>
            </h2>
            <p className="reveal delay-200 text-gray-600 text-sm mt-3">Input → AI 4-language generation → Amazon · Tmall · Rakuten · Shopify optimization</p>
          </div>

          {/* Desktop: browser frame */}
          <div className="reveal-scale hidden md:block">
            <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/60" style={{ background: '#1a1f2e' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6" style={{ background: '#0F172A' }}>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/50" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <span className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1 text-gray-600 text-xs font-mono">pagebeer.beer/order/new</div>
                </div>
              </div>
              <DemoAnimation lang="ko" />
            </div>
          </div>

          {/* Mobile: phone frame */}
          <div className="reveal-scale flex justify-center md:hidden">
            <div className="phone-frame">
              <div className="pt-6 h-full overflow-y-auto">
                <DemoAnimation lang="ko" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[
              { v: '4', unit: 'Languages', sub: 'per generation', color: 'from-blue-600 to-violet-600' },
              { v: '6', unit: 'Platforms', sub: 'auto-optimized', color: 'from-emerald-500 to-teal-500' },
              { v: '2×', unit: 'Conversion', sub: 'vs plain translation', color: 'from-orange-500 to-amber-400' },
              { v: '95%', unit: 'Cost saved', sub: 'vs outsourcing', color: 'from-rose-500 to-pink-500' },
            ].map((s, i) => (
              <div key={i} className={`reveal delay-${i * 100} text-center py-8 md:py-12 border border-gray-100 rounded-3xl hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-100/60 transition-all duration-300 group`}>
                <div className={`text-4xl md:text-6xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent tracking-[-0.04em] mb-1.5`}>{s.v}</div>
                <div className="text-xs md:text-sm font-black text-gray-700 mb-0.5">{s.unit}</div>
                <div className="text-xs text-gray-300">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BEFORE / AFTER DATA
      ══════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16 md:py-20 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <p className="reveal text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-10">Real seller results — beta tester data</p>
          <div className="reveal-scale bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {[
                { before: '2 weeks', after: '5 min', label: 'Content creation time', delta: '↓97%', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                { before: '$2,400', after: '$29', label: '4-language content / month', delta: '↓99%', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
                { before: '1.2%', after: '2.8%', label: 'Amazon JP conversion rate', delta: '+133%', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                { before: '1 market', after: '4 markets', label: 'Simultaneous launch', delta: '4×', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
              ].map((stat, i) => (
                <div key={i} className={`reveal delay-${i * 100}`}>
                  <p className="text-gray-300 text-base font-black line-through mb-2">{stat.before}</p>
                  <p className={`text-3xl md:text-4xl font-black ${stat.color} mb-2 tracking-tight`}>{stat.after}</p>
                  <span className={`text-[11px] font-black ${stat.color} border ${stat.bg} px-2.5 py-0.5 rounded-full inline-block mb-3`}>{stat.delta}</span>
                  <p className="text-gray-400 text-xs font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Platform logos */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {PLATFORMS.map(p => (
              <div key={p.name} className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-gray-600 font-bold text-xs">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════════════════ */}
      <section id="reviews" className="bg-white py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">Real reviews</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
              Sellers who switched<br />
              <span className="text-gray-200">never went back.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className={`reveal delay-${Math.min(i * 100, 400)} bg-white border border-gray-100 rounded-3xl p-6 md:p-7 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-100/80 transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(n => <span key={n} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <span className="inline-block bg-[#0F172A] text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase">{r.badge}</span>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 font-medium">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black bg-gradient-to-br from-blue-500 to-violet-600 shrink-0">
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

      {/* ══════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════ */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* ══════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 md:px-6 py-24 md:py-32">
        <div className="text-center mb-12">
          <p className="reveal text-[11px] font-black text-gray-300 uppercase tracking-[0.15em] mb-4">FAQ</p>
          <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight">Got questions?<br /><span className="text-gray-200">We have answers.</span></h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`reveal delay-${Math.min(i * 60, 300)} border rounded-2xl overflow-hidden transition-all duration-200 ${openFaq === i ? 'border-[#0F172A] shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-5 text-left gap-4"
              >
                <span className="font-bold text-[#0F172A] text-sm md:text-base">{faq.q}</span>
                <span className={`text-2xl font-light shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6">
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 pb-10">
        <NewsletterForm lang="ko" />
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="mx-4 md:mx-6 mb-16">
        <div
          className="reveal-scale max-w-5xl mx-auto rounded-3xl p-12 md:p-24 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a0533 40%, #0c1a35 70%, #0F172A 100%)' }}
        >
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, #3b82f6 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, #8b5cf6 0%, transparent 50%)' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <p className="text-[11px] font-black text-gray-600 uppercase tracking-[0.2em] mb-5">Ready to go global?</p>
            <h2
              className="text-4xl md:text-6xl font-black text-white tracking-[-0.04em] leading-[0.92] mb-5"
              style={{ fontFamily: "'Satoshi', 'Inter', sans-serif" }}
            >
              Your first 4-language<br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                product page is free.
              </span>
            </h2>
            <p className="text-gray-500 mb-2 text-base md:text-lg">No credit card · Start in 30 seconds</p>
            <p className="text-gray-700 text-sm mb-10">🇰🇷 Korean · 🇺🇸 English · 🇯🇵 Japanese · 🇨🇳 Chinese</p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-blue-500 to-violet-600 text-white px-10 md:px-16 py-5 rounded-2xl text-base md:text-xl font-black hover:opacity-90 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
            >
              Create My First Page — Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-5 md:px-6 py-12 pb-28 md:pb-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            <div>
              <Logo size={28} className="mb-4" />
              <p className="text-gray-600 text-sm max-w-xs leading-relaxed mb-6">Turn any product into a 4-language global selling machine in 5 minutes.</p>
              <div className="flex gap-2 flex-wrap">
                {[['/', '🇰🇷', 'Korean'],['/en', '🇺🇸', 'English'],['/ja', '🇯🇵', 'Japanese'],['/zh', '🇨🇳', 'Chinese']].map(([href, flag, label]) => (
                  <Link key={href} href={href} className="text-xs text-gray-600 hover:text-white flex items-center gap-1 border border-white/8 rounded-full px-2.5 py-1 hover:border-white/25 transition-colors">
                    {flag} {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm text-gray-600">
              {[['/', 'Home'],['#features', 'Features'],['#reviews', 'Reviews'],['#pricing', 'Pricing'],['/blog', 'Blog'],['/login', 'Sign in'],['/samples', 'Samples'],['/privacy', 'Privacy']].map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-700">© 2026 PageAI · pagebeer.beer. All rights reserved.</p>
            <div className="flex gap-5 text-xs text-gray-700">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════
          LIVE TICKER (minimal)
      ══════════════════════════════════════════════════════ */}
      <LiveTicker lang="ko" />

      {/* ══════════════════════════════════════════════════════
          MOBILE FLOATING CTA
      ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/8 px-4 py-3">
        <Link
          href="/login"
          className="block w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white text-center font-black text-base py-4 rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-blue-600/25"
        >
          Start Free Now — No Credit Card
        </Link>
      </div>
    </main>
  )
}
