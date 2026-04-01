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
import { PLATFORMS, LANG_TABS, HOME_COPY, USE_CASE_META, type HomeLang } from '@/lib/homeData'

export default function HomePage({ lang, isLoggedIn = false }: { lang: HomeLang; isLoggedIn?: boolean }) {
  const C = HOME_COPY[lang]
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeLang, setActiveLang] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const id = setInterval(() => setActiveLang(i => (i + 1) % LANG_TABS.length), 2200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const root = pageRef.current
    if (!root) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
    )
    root.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <HomeJsonLd />
      <CountdownBanner />

      {/* ══ NAV ══════════════════════════════════════════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0F172A]/96 backdrop-blur-2xl border-b border-white/8 shadow-2xl shadow-black/20' : 'bg-[#0F172A]'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center gap-3">
          <Link href={lang === 'ko' ? '/' : `/${lang}`} className="flex items-center shrink-0">
            <Logo size={30} />
          </Link>
          <div className="hidden md:flex items-center gap-5">
            {[C.nav.how, C.nav.features, C.nav.reviews, C.nav.pricing, C.nav.blog].map((label, i) => (
              <a key={i} href={['#how','#features','#use-cases','#compare','#reviews','#pricing','/blog'][i] ?? '#'} className="text-gray-400 text-sm hover:text-white transition-colors font-medium">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LangSwitcher current={lang} />
            <>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white font-medium transition-colors hidden sm:block px-3 py-2">
                {C.nav.signin}
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/20 whitespace-nowrap">
                {C.nav.startFree}
              </Link>
            </>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="relative bg-[#0A0F1A] min-h-[92vh] flex items-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-violet-700/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-indigo-900/12 rounded-full blur-[120px]" />
          {/* Subtle center accent */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-sm" />
        </div>
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-5 py-20 md:py-32 text-center">

          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold px-4 py-2.5 rounded-full backdrop-blur-md mb-10 hover:bg-white/8 transition-colors">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            {C.hero.badge}
          </div>

          {/* Headline — 3 lines, strong hierarchy */}
          <h1 className="font-black tracking-[-0.04em] mb-6 md:mb-8 leading-[0.9]"
            style={{ fontFamily: "'Satoshi','Pretendard','Inter',sans-serif" }}>
            <span className="block text-white text-[36px] sm:text-[52px] md:text-[68px] lg:text-[78px]">
              {C.hero.h1a}
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent text-[40px] sm:text-[56px] md:text-[74px] lg:text-[86px]">
              {C.hero.h1b}
            </span>
            <span className="block text-gray-500 text-[32px] sm:text-[44px] md:text-[58px] lg:text-[68px]">
              {C.hero.h1c}
            </span>
          </h1>

          {/* Sub headline */}
          <div className="max-w-2xl mx-auto mb-10 px-2 space-y-2">
            <p className="text-gray-300 text-base md:text-lg leading-relaxed font-medium">
              {C.hero.sub1}
              {C.hero.sub1b && <><br className="hidden sm:block" /><span className="text-white font-bold">{C.hero.sub1b}</span></>}
            </p>
            <p className="text-gray-500 text-sm md:text-base">{C.hero.sub2}</p>
          </div>

          {/* Language flags — LARGE, animated */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 px-2">
            {LANG_TABS.map((tab, i) => (
              <button key={tab.code} onClick={() => setActiveLang(i)}
                className={`group flex items-center gap-2.5 md:gap-3.5 px-4 md:px-6 py-3 md:py-4 rounded-2xl border transition-all duration-400 ${
                  activeLang === i
                    ? `bg-gradient-to-r ${tab.color} border-transparent shadow-2xl ${tab.glow} scale-[1.06]`
                    : 'bg-white/4 border-white/10 hover:bg-white/8 hover:border-white/18 hover:scale-[1.02]'
                }`}>
                <span className="text-3xl md:text-4xl leading-none">{tab.flag}</span>
                <div className="text-left">
                  <p className={`text-sm md:text-base font-black leading-tight ${activeLang === i ? 'text-white' : 'text-gray-200'}`}>
                    {tab.name[lang]}
                  </p>
                  <p className={`text-[10px] md:text-xs leading-none mt-0.5 font-medium ${activeLang === i ? 'text-white/75' : 'text-gray-600'}`}>
                    {tab.platform}
                  </p>
                  {activeLang === i && (
                    <p className="text-[10px] text-white/60 font-semibold mt-1 hidden md:block">
                      {tab.style[lang]}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 px-4 sm:px-0">
            <Link href="/login"
              className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-10 md:px-16 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:opacity-92 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/35 text-center shadow-lg shadow-blue-500/20">
              {C.hero.cta1}
            </Link>
            <Link href="/order/new"
              className="border border-white/20 bg-white/4 text-white px-7 md:px-10 py-4 rounded-2xl text-base font-bold hover:bg-white/10 hover:border-white/30 transition-all text-center flex items-center justify-center gap-2">
              {C.hero.cta2}
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6">
            {C.hero.stats.map(([v, l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="text-white font-black text-base md:text-lg">{v}</span>
                <span className="text-gray-600 text-sm">{l}</span>
              </div>
            ))}
          </div>

          {/* Trusted by platforms */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {[
              { name: 'Amazon JP', color: '#FF9900' }, { name: 'Tmall 天猫', color: '#E43226' },
              { name: '楽天 Rakuten', color: '#BF0000' }, { name: 'Shopify', color: '#96BF48' },
              { name: 'Smartstore', color: '#03C75A' }, { name: 'Coupang', color: '#E5213D' },
              { name: 'Temu', color: '#FF6900' }, { name: 'Lazada', color: '#0F146D' },
            ].map(p => (
              <span key={p.name}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-700 bg-white/3 border border-white/6 px-2.5 py-1 rounded-full hover:text-gray-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CROSS-BORDER BANNER ══════════════════════════ */}
      <section className="bg-[#0A0F1A] py-5 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-emerald-500/25 px-5 md:px-10 py-5 md:py-6"
            style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.5), rgba(15,23,42,0.9), rgba(19,78,74,0.4))' }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 85% 50%, #10b981, transparent 55%)' }} />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="text-2xl">🌏</span>
                  <span className="text-white font-black text-lg md:text-xl">{C.crossborder.title}</span>
                  <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">{C.crossborder.badge}</span>
                </div>
                <p className="text-gray-400 text-sm md:text-base">
                  <span className="text-emerald-300 font-semibold">{C.crossborder.desc1}</span>{C.crossborder.desc2}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {['Amazon JP', 'Tmall CN', '楽天', 'Shopify', 'Qoo10', 'Lazada'].map(p => (
                  <span key={p} className="bg-white/6 border border-white/10 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full">{p}</span>
                ))}
              </div>
              <Link href="/login" className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black px-5 py-3 rounded-xl hover:opacity-90 transition-all hover:scale-105 whitespace-nowrap shadow-lg shadow-emerald-500/20">
                {C.crossborder.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TEMPLATE AUTO-FILL FEATURE ══════════════════ */}
      <section className="bg-[#080D16] py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Copy */}
            <div className="reveal-left">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-black px-3.5 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                {C.template.badge}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05] mb-5">
                {C.template.h2a}<br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">{C.template.h2b}</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg">{C.template.sub}</p>
              {/* Document types */}
              <div className="flex flex-wrap gap-2 mb-8">
                {C.template.types.map((t: string) => (
                  <span key={t} className="text-xs font-semibold text-gray-300 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5 hover:bg-white/10 hover:border-indigo-500/30 transition-colors cursor-default">{t}</span>
                ))}
              </div>
              {/* Flow steps */}
              <div className="space-y-3 mb-8">
                {C.template.flow.map((f: {step: string; title: string; desc: string; icon: string}) => (
                  <div key={f.step} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-lg shrink-0">{f.icon}</div>
                    <div>
                      <p className="text-white text-sm font-bold">{f.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login" className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-3.5 rounded-xl text-sm font-black hover:opacity-90 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30 text-center">
                  {C.template.cta}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                  {C.template.proof}
                </div>
              </div>
            </div>

            {/* Right: Visual mockup */}
            <div className="reveal-right relative">
              <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl shadow-indigo-900/40"
                style={{ background: 'linear-gradient(135deg, rgba(30,27,75,0.95), rgba(15,23,42,0.98))' }}>
                {/* Window bar */}
                <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-red-400/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <span className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="text-gray-600 text-[11px] mx-auto font-mono">PageAI — AI Form Filler</span>
                </div>
                <div className="p-5 space-y-4">
                  {/* Upload zone */}
                  <div className="border-2 border-dashed border-indigo-400/40 rounded-2xl p-6 flex flex-col items-center gap-2 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📤</div>
                    <p className="text-white text-sm font-black">PDF · DOCX · XLSX · PPTX</p>
                    <p className="text-gray-500 text-xs text-center">{C.template.demo.dragDrop}</p>
                    <span className="text-[10px] font-black bg-indigo-500 text-white px-3 py-1 rounded-full mt-1">{C.template.demo.fileBtn}</span>
                  </div>
                  {/* Parsed preview */}
                  <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-xs font-black">{C.template.demo.parsed}</span>
                    </div>
                    {C.template.demo.fields.map(([k, v]) => (
                      <div key={k} className="flex gap-2 items-start">
                        <span className="text-gray-600 text-[10px] shrink-0 w-20 pt-0.5">{k}</span>
                        <div className="flex-1 bg-indigo-500/10 border border-indigo-500/15 rounded-lg px-2.5 py-1.5">
                          <span className="text-indigo-300 text-[11px] font-semibold">{v}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Language output badges */}
                  <div className="flex gap-2 flex-wrap">
                    {[['🇰🇷', 'KR', 'bg-blue-500/20 border-blue-500/30 text-blue-300'], ['🇺🇸', 'EN', 'bg-violet-500/20 border-violet-500/30 text-violet-300'], ['🇯🇵', 'JP', 'bg-rose-500/20 border-rose-500/30 text-rose-300'], ['🇨🇳', 'CN', 'bg-amber-500/20 border-amber-500/30 text-amber-300']].map(([flag, code, cls]) => (
                      <span key={code} className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl border ${cls}`}>
                        {flag} {code}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> {C.template.demo.multiLang}
                    </span>
                  </div>
                  {/* Generate button */}
                  <button className="w-full py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-all">
                    {C.template.demo.startBtn}
                  </button>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 -z-10 bg-indigo-500/8 rounded-3xl blur-3xl scale-110" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLATFORM BAR ═════════════════════════════════ */}
      <section className="bg-[#080D16] border-y border-white/5 py-6">
        <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] mb-5">{C.platformBar}</p>
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center px-5">
          {PLATFORMS.map(p => (
            <div key={p.name}
              className="flex items-center gap-2 bg-white/3 border border-white/5 hover:bg-white/6 hover:border-white/10 transition-all px-4 py-2 rounded-xl cursor-default group">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: p.color }} />
              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-300 transition-colors">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section id="how" className="bg-[#0F172A] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-16">
            <p className="reveal text-[11px] font-black text-blue-400 uppercase tracking-[0.16em] mb-4">{C.how.label}</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              {C.how.h2a}<br /><span className="text-gray-600">{C.how.h2b}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {C.how.steps.map((step, i) => (
              <div key={i} className={`reveal delay-${i * 100} relative rounded-3xl p-8 md:p-9 overflow-hidden group transition-all duration-300 hover:-translate-y-1`}
                style={{ background: i === 0 ? 'linear-gradient(135deg, rgba(30,58,138,0.3), rgba(15,23,42,0.8))' : i === 1 ? 'linear-gradient(135deg, rgba(76,29,149,0.25), rgba(15,23,42,0.8))' : 'linear-gradient(135deg, rgba(6,78,59,0.25), rgba(15,23,42,0.8))', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Number */}
                <div className="absolute top-6 right-6 text-[48px] font-black leading-none opacity-[0.06] text-white">{step.n}</div>
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: i === 0 ? 'rgba(59,130,246,0.15)' : i === 1 ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)', border: i === 0 ? '1px solid rgba(59,130,246,0.2)' : i === 1 ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(16,185,129,0.2)' }}>
                    {step.icon}
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border mt-1 ${i === 0 ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : i === 1 ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white mb-3 tracking-tight leading-snug">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Connecting arrow — desktop only */}
          <div className="hidden md:flex items-center justify-center gap-8 mt-8 opacity-20">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </div>
        </div>
      </section>

      {/* ══ FEATURES BENTO ════════════════════════════════ */}
      <section id="features" className="bg-[#080D16] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-16">
            <p className="reveal text-[11px] font-black text-violet-400 uppercase tracking-[0.15em] mb-4">{C.features.label}</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              {C.features.h2a}<br /><span className="text-gray-700">{C.features.h2b}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Large — 4 language */}
            <div className="reveal-left md:col-span-8 relative rounded-3xl p-8 md:p-10 overflow-hidden border border-blue-500/15 group hover:border-blue-400/30 transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.5), rgba(76,29,149,0.4), rgba(15,23,42,0.8))' }}>
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/18 transition-all duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-wider">{C.features.card1.badge}</div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">{C.features.card1.title}</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-7 max-w-lg">{C.features.card1.desc}</p>
                <div className="flex flex-wrap gap-2.5">
                  {LANG_TABS.map(t => (
                    <div key={t.code} className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3.5 py-2.5 hover:bg-white/10 transition-colors">
                      <span className="text-lg">{t.flag}</span>
                      <div>
                        <p className="text-white text-xs font-black">{t.code} · {t.name[lang]}</p>
                        <p className="text-gray-600 text-[10px]">{t.platform}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Small — URL */}
            <div className="reveal-right delay-100 md:col-span-4 bg-white/[0.02] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all group">
              <span className="text-4xl block mb-5">⚡</span>
              <h3 className="text-xl font-black text-white mb-2.5 group-hover:text-blue-100 transition-colors">{C.features.card2.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{C.features.card2.desc}</p>
              <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 font-mono">
                <p className="text-gray-600 text-xs truncate">amazon.co.jp/dp/B0CF...</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-emerald-400 text-xs font-semibold">Analyzing...</p>
                </div>
              </div>
            </div>
            {/* Small — CVR */}
            <div className="reveal delay-200 md:col-span-4 bg-white/[0.02] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all">
              <span className="text-4xl block mb-5">📊</span>
              <h3 className="text-xl font-black text-white mb-2.5">{C.features.card3.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{C.features.card3.desc}</p>
              <div className="space-y-2.5">
                {[['Amazon JP', '+18%', 'text-blue-400'], ['Tmall CN', '+22%', 'text-red-400'], ['Rakuten', '+14%', 'text-rose-400']].map(([p, v, c]) => (
                  <div key={p} className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">{p}</span>
                    <span className={`text-xs font-black ${c}`}>{v} CVR</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Large — Platform */}
            <div className="reveal-right delay-200 md:col-span-8 relative rounded-3xl p-8 md:p-10 overflow-hidden border border-emerald-500/15 group hover:border-emerald-400/30 transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.5), rgba(19,78,74,0.4), rgba(15,23,42,0.8))' }}>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/18 transition-all duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-wider">{C.features.card4.badge}</div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">{C.features.card4.title}</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-7 max-w-lg">{C.features.card4.desc}</p>
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

      {/* ══ DEMO ══════════════════════════════════════════ */}
      <section className="bg-[#0F172A] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-[11px] font-black text-pink-400 uppercase tracking-[0.15em] mb-4">{C.demo.label}</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              {C.demo.h2a}<br /><span className="text-gray-600">{C.demo.h2b}</span>
            </h2>
            <p className="reveal delay-200 text-gray-600 text-sm mt-3">{C.demo.sub}</p>
          </div>
          <div className="reveal-scale hidden md:block">
            <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/60" style={{ background: '#1a1f2e' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-[#0F172A]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/50" /><span className="w-3 h-3 rounded-full bg-yellow-500/50" /><span className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1 text-gray-600 text-xs font-mono">pagebeer.beer/order/new</div>
                </div>
              </div>
              <DemoAnimation lang={lang} />
            </div>
          </div>
          <div className="reveal-scale flex justify-center md:hidden">
            <div className="phone-frame"><div className="pt-6 h-full overflow-y-auto"><DemoAnimation lang={lang} /></div></div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {C.stats.map((s, i) => (
              <div key={i} className={`reveal delay-${i * 100} text-center py-8 md:py-12 border border-gray-100 rounded-3xl hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-100/60 transition-all`}>
                <div className={`text-4xl md:text-6xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent tracking-[-0.04em] mb-1.5`}>{s.v}</div>
                <div className="text-xs md:text-sm font-black text-gray-700 mb-0.5">{s.unit}</div>
                <div className="text-xs text-gray-300">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DATA ══════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16 md:py-20 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <p className="reveal text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-10">{C.data.label}</p>
          <div className="reveal-scale bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {C.data.items.map((stat, i) => (
                <div key={i} className={`reveal delay-${i * 100}`}>
                  <p className="text-gray-300 text-base font-black line-through mb-2">{stat.before}</p>
                  <p className={`text-3xl md:text-4xl font-black ${stat.color} mb-2 tracking-tight`}>{stat.after}</p>
                  <span className={`text-[11px] font-black ${stat.color} border ${stat.bg} px-2.5 py-0.5 rounded-full inline-block mb-3`}>{stat.delta}</span>
                  <p className="text-gray-400 text-xs font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
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

      {/* ══ USE CASES ══════════════════════════════════════ */}
      <section id="use-cases" className="bg-[#080D16] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-[11px] font-black text-amber-400 uppercase tracking-[0.15em] mb-4">{C.useCases.label}</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              {C.useCases.h2a}<br /><span className="text-gray-600">{C.useCases.h2b}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {C.useCases.items.map((item, i) => {
              const m = USE_CASE_META[i]
              return (
                <article key={i}
                  className={`reveal delay-${Math.min(i * 80, 400)} relative rounded-3xl p-6 border bg-gradient-to-br ${m.accent} ${m.border} hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl leading-none">{m.icon}</span>
                    <div>
                      <h3 className="text-white font-black text-sm leading-tight">{item.title}</h3>
                      <p className="text-[10px] font-semibold mt-0.5" style={{ color: m.color }}>{item.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 text-xs shrink-0 mt-0.5">😓</span>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.pain}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 text-xs shrink-0 mt-0.5">⚡</span>
                      <p className="text-gray-300 text-xs leading-relaxed font-medium">{item.gain}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/login"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-sm font-bold px-6 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all">
              {lang === 'ko' ? '나에게 맞는 사용법 알아보기 →' : lang === 'ja' ? '私の使い方を見る →' : lang === 'zh' ? '了解我的使用方式 →' : 'Find my use case →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ═════════════════════════════════════ */}
      <section id="compare" className="bg-[#0F172A] py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-[11px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-4">{C.comparison.label}</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              {C.comparison.h2a}<br /><span className="text-gray-600">{C.comparison.h2b}</span>
            </h2>
          </div>
          <div className="reveal-scale overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-gray-600 text-xs font-black uppercase tracking-wider pb-4 pr-4 w-[40%]">
                    {lang === 'ko' ? '항목' : lang === 'ja' ? '項目' : lang === 'zh' ? '项目' : 'Feature'}
                  </th>
                  <th className="text-center text-gray-600 text-xs font-black pb-4 px-3">{C.comparison.cols.outsource}</th>
                  <th className="text-center text-gray-600 text-xs font-black pb-4 px-3">{C.comparison.cols.chatgpt}</th>
                  <th className="text-center pb-4 px-3">
                    <span className="bg-gradient-to-r from-blue-500 to-violet-600 text-white text-xs font-black px-3 py-1.5 rounded-full whitespace-nowrap">
                      {C.comparison.cols.pageai}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {C.comparison.rows.map((row, i) => (
                  <tr key={i} className={`border-t ${i % 2 === 0 ? 'border-white/5 bg-transparent' : 'border-white/5 bg-white/[0.015]'}`}>
                    <td className="text-gray-300 text-sm py-4 pr-4 font-medium">{row.feature}</td>
                    <td className="text-center py-4 px-3">
                      {row.outsource === true ? <span className="text-emerald-400 text-lg">✓</span>
                        : row.outsource === false ? <span className="text-gray-700 text-lg">✕</span>
                        : <span className="text-amber-400 text-xs font-semibold">{row.outsource}</span>}
                    </td>
                    <td className="text-center py-4 px-3">
                      {row.chatgpt === true ? <span className="text-emerald-400 text-lg">✓</span>
                        : row.chatgpt === false ? <span className="text-gray-700 text-lg">✕</span>
                        : <span className="text-amber-400 text-xs font-semibold">{row.chatgpt}</span>}
                    </td>
                    <td className="text-center py-4 px-3">
                      {row.pageai === true
                        ? <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-[11px] font-black mx-auto">✓</span>
                        : <span className="text-blue-400 text-xs font-black">{row.pageai}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/login"
              className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-8 py-4 rounded-2xl text-sm font-black hover:opacity-90 transition-all hover:scale-[1.03] shadow-lg shadow-blue-500/20">
              {lang === 'ko' ? 'PageAI 무료로 시작하기 →' : lang === 'ja' ? 'PageAIを無料で始める →' : lang === 'zh' ? '免费开始使用PageAI →' : 'Start PageAI Free →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ═══════════════════════════════════════ */}
      <section id="reviews" className="bg-white py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">{C.reviews.label}</p>
            <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
              {C.reviews.h2a}<br /><span className="text-gray-200">{C.reviews.h2b}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {C.reviews.items.map((r, i) => (
              <div key={i} className={`reveal delay-${Math.min(i * 100, 400)} bg-white border border-gray-100 rounded-3xl p-6 md:p-7 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-100/80 transition-all hover:-translate-y-1`}>
                <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map(n => <span key={n} className="text-yellow-400 text-sm">★</span>)}</div>
                <span className="inline-block bg-[#0F172A] text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4 uppercase tracking-wide">{r.badge}</span>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 font-medium">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black bg-gradient-to-br from-blue-500 to-violet-600 shrink-0">{r.name[0]}</div>
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

      {/* ══ PRICING ═══════════════════════════════════════ */}
      <div id="pricing"><PricingSection lang={lang} /></div>

      {/* ══ FAQ ═══════════════════════════════════════════ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 md:px-6 py-24 md:py-32">
        <div className="text-center mb-12">
          <p className="reveal text-[11px] font-black text-gray-300 uppercase tracking-[0.15em] mb-4">{C.faq.label}</p>
          <h2 className="reveal delay-100 text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight">
            {C.faq.h2a}<br /><span className="text-gray-200">{C.faq.h2b}</span>
          </h2>
        </div>
        <div className="space-y-3">
          {C.faq.items.map((faq, i) => (
            <div key={i} className={`reveal delay-${Math.min(i * 60, 300)} border rounded-2xl overflow-hidden transition-all ${openFaq === i ? 'border-[#0F172A] shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center px-6 py-5 text-left gap-4">
                <span className="font-bold text-[#0F172A] text-sm md:text-base">{faq.q}</span>
                <span className={`text-2xl font-light shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && <div className="px-6 pb-6"><p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ══ NEWSLETTER ════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 pb-10">
        <NewsletterForm lang={lang} />
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════ */}
      <section className="mx-4 md:mx-6 mb-16">
        <div className="reveal-scale max-w-5xl mx-auto rounded-3xl p-12 md:p-24 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0c1a35 0%, #130c2e 40%, #0a1628 70%, #0F172A 100%)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 70% at 25% 50%, rgba(59,130,246,0.18), transparent), radial-gradient(ellipse 60% 70% at 75% 50%, rgba(139,92,246,0.18), transparent)' }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 text-[11px] font-black px-4 py-2 rounded-full mb-7 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {C.finalCta.label}
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-[-0.04em] leading-[0.9] mb-6" style={{ fontFamily: "'Satoshi','Pretendard','Inter',sans-serif" }}>
              {C.finalCta.h2a}<br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">{C.finalCta.h2b}</span>
            </h2>
            <p className="text-gray-400 mb-1.5 text-base md:text-lg font-medium">{C.finalCta.sub1}</p>
            <p className="text-gray-600 text-sm mb-10 tracking-wide">{C.finalCta.sub2}</p>
            <Link href="/login"
              className="inline-block bg-gradient-to-r from-blue-500 to-violet-600 text-white px-12 md:px-20 py-5 md:py-6 rounded-2xl text-base md:text-xl font-black hover:opacity-92 transition-all hover:scale-[1.04] hover:shadow-2xl hover:shadow-blue-500/30 shadow-lg shadow-blue-500/15">
              {C.finalCta.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 무료 도구 섹션 ════════════════════════════════ */}
      <section className="bg-[#0F172A] px-5 md:px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">무료 도구</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">로그인 없이 바로 쓰는<br />무료 SEO 도구</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">상세페이지 작성에 도움이 되는 무료 도구를 제공합니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/samples" className="group bg-white/5 hover:bg-white/8 border border-white/8 hover:border-blue-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
              <div className="text-2xl mb-3">📋</div>
              <h3 className="font-black text-white mb-2">상세페이지 샘플 모음</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">뷰티·식품·패션 등 카테고리별 실제 수준의 샘플 상세페이지를 무료로 확인하세요.</p>
              <p className="text-xs text-blue-400 font-bold group-hover:text-blue-300">샘플 보기 →</p>
            </Link>
            <Link href="/tools/keyword-checker" className="group bg-white/5 hover:bg-white/8 border border-white/8 hover:border-red-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
              <div className="text-2xl mb-3">🚫</div>
              <h3 className="font-black text-white mb-2">금칙어 검사기</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">스마트스토어·쿠팡 금칙어를 실시간으로 감지하고 대체 단어를 추천해드립니다.</p>
              <p className="text-xs text-red-400 font-bold group-hover:text-red-300">금칙어 검사 →</p>
            </Link>
            <Link href="/tools/seo-checker" className="group bg-white/5 hover:bg-white/8 border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-black text-white mb-2">SEO 점수 체커</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">상세페이지 SEO 점수를 5가지 항목으로 즉시 분석하고 개선 방법을 알려드립니다.</p>
              <p className="text-xs text-violet-400 font-bold group-hover:text-violet-300">SEO 점수 분석 →</p>
            </Link>
            <Link href="/faq" className="group bg-white/5 hover:bg-white/8 border border-white/8 hover:border-blue-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
              <div className="text-2xl mb-3">❓</div>
              <h3 className="font-black text-white mb-2">자주 묻는 질문</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">스마트스토어·쿠팡·Amazon 상세페이지에 관한 FAQ 15가지를 총정리했습니다.</p>
              <p className="text-xs text-blue-400 font-bold group-hover:text-blue-300">FAQ 보기 →</p>
            </Link>
            <Link href="/templates" className="group bg-white/5 hover:bg-white/8 border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
              <div className="text-2xl mb-3">📄</div>
              <h3 className="font-black text-white mb-2">무료 템플릿 다운로드</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">스마트스토어·쿠팡·Amazon JP 상세페이지 템플릿 4종을 이메일 입력 후 무료 다운로드.</p>
              <p className="text-xs text-violet-400 font-bold group-hover:text-violet-300">무료 다운로드 →</p>
            </Link>
            <Link href="/compare/chatgpt" className="group bg-white/5 hover:bg-white/8 border border-white/8 hover:border-yellow-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="font-black text-white mb-2">PageAI vs ChatGPT 비교</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">EC 전문 AI와 범용 AI의 차이를 7가지 항목으로 직접 비교해보세요.</p>
              <p className="text-xs text-yellow-400 font-bold group-hover:text-yellow-300">비교 보기 →</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════ */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-5 md:px-6 py-12 pb-28 md:pb-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            <div>
              <Logo size={28} className="mb-4" />
              <p className="text-gray-600 text-sm max-w-xs leading-relaxed mb-6">{C.footer.desc}</p>
              <div className="flex gap-1.5 flex-wrap">
                {[['/', '🇰🇷'],['/en', '🇺🇸'],['/ja', '🇯🇵'],['/zh', '🇨🇳']].map(([href, flag]) => (
                  <Link key={href} href={href} className={`text-sm flex items-center gap-1 border rounded-full px-2.5 py-1 transition-colors ${href === (lang === 'ko' ? '/' : `/${lang}`) ? 'border-white/25 text-white bg-white/8' : 'border-white/8 text-gray-600 hover:text-white hover:border-white/25'}`}>
                    {flag}
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm text-gray-600">
              {C.footer.links.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-700">{C.footer.copy}</p>
            <div className="flex gap-5 text-xs text-gray-700">
              <Link href="/privacy" className="hover:text-white transition-colors">{C.footer.privacy}</Link>
              <Link href="/terms" className="hover:text-white transition-colors">{C.footer.terms}</Link>
            </div>
          </div>
        </div>
      </footer>

      <LiveTicker lang={lang} />

      {/* ══ MOBILE FLOATING CTA ═══════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/8 px-4 py-3">
        <Link href="/login" className="block w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white text-center font-black text-base py-4 rounded-2xl hover:opacity-90 active:scale-[0.98] shadow-xl shadow-blue-600/25">
          {C.footer.floatingCta}
        </Link>
      </div>
    </main>
  )
}
