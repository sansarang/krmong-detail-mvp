'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import DemoAnimation from '@/components/DemoAnimation'
import CompareSection from '@/components/CompareSection'
import BeforeAfterSection from '@/components/BeforeAfterSection'
import PricingSection from '@/components/PricingSection'
import LiveTicker from '@/components/LiveTicker'
import NewsletterForm from '@/components/NewsletterForm'
import LangSwitcher from '@/components/LangSwitcher'
import ProductShowcase from '@/components/ProductShowcase'
import Logo from '@/components/Logo'
import TrendWidget from '@/components/TrendWidget'

const HERO_WORDS = [
  'Product Pages',
  'Press Releases',
  'Business Plans',
  'Paper Summaries',
  'Company Decks',
  'IR Pitches',
  'Policy Docs',
  'Research Reports',
]

const GOODBYE_ITEMS = [
  'Expensive agencies', 'Endless revisions', 'Slow delivery', 'Generic AI output',
  'Wasted hours', 'Copywriter fees', 'Design back-and-forth', 'A/B test guesswork',
  'Low conversion copy', 'Missed deadlines', 'Inconsistent quality', 'Planning meetings',
]

const REVIEWS = [
  { name: 'Jason M.', role: 'E-commerce Seller, USA', stars: 5, badge: '10x Faster', text: 'I used to spend a week back-and-forth with a copywriter. Now I generate a complete product page in 5 minutes and it\'s honestly better quality.' },
  { name: 'Yuki T.', role: 'Shopify Store Owner, Japan', stars: 5, badge: 'Cost Saved 90%', text: 'The AI understands my product category perfectly. The output is polished, professional, and ready to use. I\'ve replaced my entire content team.' },
  { name: 'Li Wei', role: 'Brand Manager, Taiwan', stars: 5, badge: '2x Conversion', text: 'We tested AI-generated pages vs our old ones. The AI pages converted 2x better. We now use it for every new product launch.' },
  { name: 'Sarah K.', role: 'Amazon FBA Seller, UK', stars: 5, badge: 'Saves £800/mo', text: 'Replacing my copywriter saved me £800 a month. The AI writes better product descriptions than most humans I\'ve hired.' },
  { name: 'Marco R.', role: 'DTC Brand Founder, Italy', stars: 5, badge: '5x Productivity', text: 'I launch 3x more products per month now. What used to take 2 weeks takes 30 minutes. Absolute game-changer for my business.' },
  { name: 'Aiko N.', role: 'Rakuten Seller, Japan', stars: 5, badge: 'Instant Edit', text: 'The inline editing feature is brilliant. I can tweak any section in seconds without asking anyone. My team loves it.' },
]

const FAQS = [
  { q: 'What does PageAI actually do?', a: 'You input your product or service info, and our AI generates a full, professional document — product detail pages, press releases, business proposals, academic summaries, and more — in under 5 minutes.' },
  { q: 'What categories are supported?', a: 'We support 40+ categories: e-commerce products, automotive services, restaurants, education, real estate, IT/SaaS, government documents, R&D proposals, academic papers, and more.' },
  { q: 'Can I edit the generated content?', a: 'Yes. Click any section to edit it inline. You can also use the AI chat assistant to request revisions in natural language, like "make this more persuasive."' },
  { q: 'What languages are supported?', a: 'Korean, English, Japanese, and Chinese. The AI detects your browser language and automatically sets the output language.' },
  { q: 'Can I publish to my blog directly?', a: 'Yes! Open the Blog tab after generation and pick WordPress, Shopify, Medium, Instagram, or LinkedIn — copy the HTML and paste it into your editor. (Korean sites: Naver Blog & Tistory are available in the Korean UI.)' },
  { q: 'How much does it cost?', a: 'Free plan includes 5 generations per month. Pro plan is $21/month with unlimited generations, SEO analysis, and multi-platform blog export.' },
]

const FEATURES = [
  { icon: '⚡', title: '5-Minute Output', desc: 'From input to download in under 5 minutes. No waiting on agencies or freelancers.' },
  { icon: '✏️', title: 'Click-to-Edit', desc: 'Not happy with a section? Click once to edit inline. No back-and-forth emails.' },
  { icon: '🌏', title: '40+ Categories', desc: 'E-commerce, automotive, hospitality, government, academia — one tool for all industries.' },
  { icon: '📤', title: 'Multi-Platform Publish', desc: 'WordPress, Shopify, Medium, Instagram, LinkedIn — one-click copy for your stack.' },
]

export default function EnglishHome() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [wordIdx, setWordIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => { setWordIdx(i => (i + 1) % HERO_WORDS.length); setFade(true) }, 300)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      {/* ── EARLY BIRD BANNER ── */}
      <div className="bg-black text-white text-xs font-bold text-center py-3 px-4 flex items-center justify-center gap-3 flex-wrap">
        <span>⚡ Early Bird Deal — Pro Plan</span>
        <span className="line-through text-gray-400">$29</span>
        <span className="text-yellow-400 text-base font-black">$14.50</span>
        <Link href="/login" className="bg-white text-black px-3 py-1 rounded-lg text-xs font-black hover:bg-gray-100 transition-all">Start Now →</Link>
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-4 flex justify-between items-center">
          <Link href="/en"><Logo size={32} /></Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">Features</a>
            <a href="#reviews" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">Reviews</a>
            <a href="#pricing" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">Pricing</a>
            <a href="#faq" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher current="en" />
            <Link href="/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">Log in</Link>
            <Link href="/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-5 pt-12 md:pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 md:px-4 py-2 rounded-full mb-6 md:mb-8">
          <div className="flex -space-x-1 shrink-0">
            {['#FF5C35','#6366F1','#10B981','#F59E0B','#EC4899'].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="w-px h-3 bg-gray-300 shrink-0" />
          <span className="text-green-600 font-bold">Beta</span>
          <span className="hidden sm:inline">— 40+ categories · Any language · Any industry</span>
          <span className="sm:hidden">40+ categories</span>
        </div>

        <h1 className="text-[40px] sm:text-[58px] md:text-[88px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-6 md:mb-8">
          <span className="inline-block transition-all duration-300" style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)' }}>
            {HERO_WORDS[wordIdx]},
          </span>
          <br />
          <span className="text-gray-200">any document,</span><br />
          AI in 5 min.
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed font-medium px-2">
          Just enter your info. AI generates a professional document —{' '}
          <span className="text-gray-600 font-semibold">product pages, press releases, proposals, and more.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 px-4 sm:px-0">
          <Link href="/login" className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl">
            Start for Free →
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">No credit card · Free to start · Takes 30 seconds</p>
      </section>

      <TrendWidget variant="strip" geo="US" uiLocale="en" />

      {/* ── LIVE TICKER ── */}
      <LiveTicker lang="en" />

      {/* ── PRODUCT SHOWCASE ── */}
      <ProductShowcase lang="en" />

      {/* ── DEMO ANIMATION ── */}
      <section className="max-w-5xl mx-auto px-5 pb-8">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
            Type it in,<br />
            <span className="text-gray-300">AI handles the rest.</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">Live service simulation · Auto-repeating</p>
        </div>
        <DemoAnimation lang="en" />
      </section>

      {/* ── SAY GOODBYE TO ── */}
      <div className="border-y border-gray-100 py-5 overflow-hidden bg-gray-50 my-8">
        <p className="text-center text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Say Goodbye to</p>
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {[...GOODBYE_ITEMS, ...GOODBYE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 bg-white border border-gray-100 text-gray-500 text-sm font-semibold px-5 py-2.5 rounded-full shrink-0 shadow-sm">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── BEFORE/AFTER ── */}
      <BeforeAfterSection lang="en" />

      {/* ── COMPARE ── */}
      <CompareSection lang="en" />

      {/* ── FEATURES ── */}
      <section id="features" className="bg-black py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              The best documents have<br />
              <span className="text-gray-500">a formula. AI knows it.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-7 hover:bg-white/10 transition-all">
                <div className="text-3xl md:text-4xl mb-4 md:mb-5">{f.icon}</div>
                <h3 className="text-base md:text-lg font-black text-white mb-2 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: '10X', label: 'Cost Reduction', sub: 'vs. agency' },
            { value: '2X',  label: 'Conversion Rate', sub: 'avg. improvement' },
            { value: '5X',  label: 'Productivity', sub: 'speed increase' },
            { value: '40+', label: 'Categories', sub: 'all industries' },
          ].map((s, i) => (
            <div key={i} className="text-center py-7 md:py-10 border border-gray-100 rounded-3xl hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="text-4xl md:text-6xl font-black text-black tracking-[-0.04em] mb-1">{s.value}</div>
              <div className="text-xs md:text-sm font-bold text-gray-600 mb-0.5">{s.label}</div>
              <div className="text-xs text-gray-300">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <PricingSection lang="en" />

      {/* ── REVIEWS ── */}
      <section id="reviews" className="bg-gray-50 py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">User Reviews</p>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
              What early users<br />are saying.
            </h2>
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold">Beta Tester Reviews</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 hover:border-gray-300 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(n => <span key={n} className="text-yellow-400 text-sm">★</span>)}</div>
                <span className="inline-block bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase">{r.badge}</span>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ background: `hsl(${i * 55}, 60%, 50%)` }}>{r.name[0]}</div>
                  <div>
                    <p className="font-black text-sm text-black">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-5 md:px-6 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight">Any questions?</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${openFaq === i ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center px-6 py-5 text-left">
                <span className="font-bold text-gray-900 pr-4 text-sm md:text-base">{faq.q}</span>
                <span className={`text-2xl font-light transition-transform shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && <div className="px-6 pb-6"><p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 pb-14">
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">Newsletter</p>
          <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mb-3">Get AI content tips weekly.</h2>
          <p className="text-gray-400 text-sm mb-6">Conversion tips, SEO tricks, and platform updates. Free, every week.</p>
          <NewsletterForm lang="en" />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mx-4 md:mx-6 mb-12 md:mb-16">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 md:p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Start Now</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-5">
              Your AI writing team,<br />
              <span className="text-gray-400">available 24/7.</span>
            </h2>
            <p className="text-gray-400 mb-7 text-base md:text-lg">No credit card · Free to start</p>
            <Link href="/login" className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105">
              Start for Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 px-5 md:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <Logo size={28} className="mb-3" />
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">Any document. AI. 5 minutes.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-gray-400">
              <Link href="/en" className="hover:text-black transition-colors">Home</Link>
              <a href="#features" className="hover:text-black transition-colors">Features</a>
              <a href="#reviews" className="hover:text-black transition-colors">Reviews</a>
              <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
              <Link href="/" className="hover:text-black transition-colors">한국어</Link>
              <Link href="/login" className="hover:text-black transition-colors">Login</Link>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-300">© 2026 PageAI. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-300">
              <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
