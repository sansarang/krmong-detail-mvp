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
import PromoDemoWidget from '@/components/PromoDemoWidget'

const HERO_WORDS = [
  '天猫全球购', 'Amazon', '速卖通', 'Shopify',
  '商品详情页', '新闻稿', '跨境电商', '商业计划书',
]

const GOODBYE_ITEMS = [
  '多语言翻译错误', '各平台格式转换', '昂贵的多语言文案费',
  '文化差异导致的失误', '等待2周的交稿期', '天猫A+手动制作',
  '跨境转化率低', '4种语言分开修改', '各语言外包成本',
  '乐天关键词研究', '翻译后的单独修改', 'Amazon A+制作烦恼',
]

const FEATURES = [
  { icon: '🌏', title: '4语言同时生成', desc: '输入一次 → 韩语+英语+日语+中文同时生成。中文使用天猫A+爆款风格，英文使用Amazon格式，日文使用敬语风格，每种语言独立文化优化。' },
  { icon: '🛒', title: '平台自动优化', desc: '天猫、Amazon、乐天、Shopify、Lazada — 选择平台，AI自动适应各平台的标题结构、关键词密度和内容格式。' },
  { icon: '📊', title: '转化率预测报告', desc: '生成后自动显示"天猫CN预计CTR+22% / Amazon JP转化率+18%"等市场专属预测报告。' },
  { icon: '⚡', title: 'URL到页面5分钟', desc: '粘贴任意商品URL → AI自动分析填写信息 → 5分钟内生成4语言跨境电商页面。' },
]

const REVIEWS = [
  { name: '张伟', role: '天猫全球购品牌商', stars: 5, badge: '天猫CTR +22%', text: 'PageAI生成的中文文案完全是天猫A+爆款风格——销量数据、好评率、KOL推荐都自动融入。不是翻译，是真正的本地化内容。CTR涨了22%。' },
  { name: '李慧', role: 'Shopify全球独立站', stars: 5, badge: '4语言5分钟', text: '输入一次，中文、英文、韩文、日文同时生成。之前每月花在翻译上的2万元现在省下来了。10分钟就能完成全球化上线。' },
  { name: '王明', role: '速卖通跨境负责人', stars: 5, badge: '跨境转化翻倍', text: 'A/B测试显示AI生成的页面转化率是原来的2倍。跨境模式能针对不同市场自动优化，效果非常显著。' },
  { name: '陈晓燕', role: 'Amazon FBA卖家', stars: 5, badge: '每月省1.5万元', text: '多语言文案外包每月要花1.5万，PageAI全部搞定。Amazon A+内容格式完全符合要求，直接可以用。' },
  { name: '刘强', role: 'DTC品牌6市场运营', stars: 5, badge: '6市场同时上线', text: '以前每个市场单独运营要6周，现在天猫、Amazon、乐天、Lazada可以同时上线。PageAI彻底改变了我的跨境业务。' },
  { name: '赵雨', role: 'Lazada · Qoo10卖家', stars: 5, badge: '平台自动适配', text: '跨境模式选好平台后，AI自动生成Lazada和Qoo10各自需要的格式和关键词。省去了无数次手动修改的烦恼。' },
]

const FAQS = [
  { q: '真的能4种语言同时生成吗？', a: '是的！开启"4语言同时生成模式"，一次输入即可同时获得韩语、英语、日语、中文版本。每种语言都经过文化优化：中文使用天猫A+爆款风格+社会证明，英文使用Amazon A+格式+利益导向，日文使用敬语+季节感+品质诉求。' },
  { q: '支持哪些跨境电商平台？', a: '支持天猫全球购（详情页结构）、Amazon（A+ Content格式）、乐天（商品説明风格）、Shopify、速卖通、Lazada。开启跨境模式并选择目标平台，AI自动适应各平台内容结构。' },
  { q: '是真正的本地化还是只是翻译？', a: '是真正的本地化。中文输出强调销量XX件、好评率99%、KOL推荐、限时促销，使用社会证明和爆款风格。英文强调benefit-first、量化数据、Amazon SEO关键词。日文强调丁寧語、季節感、品質保証。每种语言都是独立创作，而非翻译。' },
  { q: '可以从商品URL自动填写信息吗？', a: '可以！粘贴任意商品URL（天猫、淘宝、Amazon、Shopify等），AI自动分析页面并填写商品名、分类和描述，然后立即生成4语言版本。' },
  { q: '生成的内容可以编辑吗？', a: '可以。点击任意板块即可直接内联编辑。切换语言标签可查看各语言版本。也可以用自然语言向AI助手发出修改指令。' },
  { q: '与外包相比费用如何？', a: '4语言4平台的多语言内容外包每月至少需要5,000-30,000元。PageAI专业版仅需$29/月，支持无限次生成，覆盖全部4种语言和6个平台。节省超过97%的成本。' },
]

export default function ZhPage() {
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

      {/* ── 早鸟优惠横幅 ── */}
      <div className="bg-black text-white text-xs font-bold text-center py-3 px-4 flex items-center justify-center gap-3 flex-wrap">
        <span>⚡ 早鸟优惠 — 专业版</span>
        <span className="line-through text-gray-400">¥198</span>
        <span className="text-yellow-400 text-base font-black">¥99</span>
        <Link href="/zh/login" className="bg-white text-black px-3 py-1 rounded-lg text-xs font-black hover:bg-gray-100 transition-all">立即开始 →</Link>
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-4 flex justify-between items-center">
          <Link href="/zh"><Logo size={32} /></Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">功能</a>
            <a href="#reviews" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">用户评价</a>
            <a href="#pricing" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">定价</a>
            <a href="#faq" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">常见问题</a>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher current="zh" />
            <Link href="/zh/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">登录</Link>
            <Link href="/zh/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">免费开始</Link>
          </div>
        </div>
      </nav>

      <TrendWidget variant="strip" geo="CN" uiLocale="zh" />

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-5 pt-12 md:pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 md:px-4 py-2 rounded-full mb-6 md:mb-8">
          <span>🌏</span>
          <span className="hidden sm:inline">1,247位跨境卖家正在使用 · 平均SEO评分86 · 🇰🇷🇺🇸🇯🇵🇨🇳 4语言支持</span>
          <span className="sm:hidden">1,247卖家 · 4语言</span>
        </div>

        <h1 className="text-[36px] sm:text-[52px] md:text-[80px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-4 md:mb-6">
          <span className="inline-block transition-all duration-300" style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)' }}>
            {HERO_WORDS[wordIdx]}
          </span>
          <span className="text-gray-200">，</span><br />
          <span className="text-gray-200">任何商品，</span><br />
          4语言 · 5分钟。
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-3 max-w-2xl mx-auto leading-relaxed font-medium px-2">
          输入一次 → 韩语、英语、日语、中文同时生成。<br className="hidden sm:block" />
          天猫 · Amazon · 乐天 · Shopify · Lazada · Qoo10 自动优化。
        </p>
        <p className="text-sm text-gray-300 mb-8 max-w-xl mx-auto px-2">
          真实卖家实现<strong className="text-gray-500">转化率2倍提升</strong>与<strong className="text-gray-500">成本降低10倍</strong>。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 px-4 sm:px-0">
          <Link href="/zh/login" className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl">
            立即免费开始 →
          </Link>
          <Link href="/zh/login" className="border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl text-base font-bold hover:border-gray-400 transition-all">
            🌏 查看4语言演示
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">无需信用卡 · 30秒即可开始 · 首次免费</p>
      </section>

      {/* ── LIVE TICKER ── */}
      <LiveTicker lang="zh" />

      {/* ── PRODUCT SHOWCASE ── */}
      <ProductShowcase lang="zh" />

      {/* ── DEMO ANIMATION ── */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-5 text-center mb-8 md:mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">自动发布</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
            输入1次，<br />
            <span className="text-gray-300">4语言 · 4平台同时发布。</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">输入 → AI 4语言同时生成 → 天猫 · Amazon · 乐天 · Shopify 自动优化</p>
        </div>
        <DemoAnimation lang="zh" />
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
      <BeforeAfterSection lang="zh" />

      {/* ── COMPARE ── */}
      <CompareSection lang="zh" />

      {/* ── FEATURES ── */}
      <section id="features" className="bg-black py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">核心功能</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              畅销文案都有<br />
              <span className="text-gray-500">共同的规律。AI知道。</span>
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
            { value: '10X', label: '成本降低', sub: '对比外包' },
            { value: '2X',  label: '转化率提升', sub: '平均提升幅度' },
            { value: '5X',  label: '生产效率', sub: '制作速度' },
            { value: '40+', label: '行业分类', sub: '全覆盖' },
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
      <PricingSection lang="zh" />

      {/* ── REVIEWS ── */}
      <section id="reviews" className="bg-gray-50 py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">用户评价</p>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
              抢先体验的<br />内测用户真实反馈。
            </h2>
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold">内测用户真实评价</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 hover:border-gray-300 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(n => <span key={n} className="text-yellow-400 text-sm">★</span>)}</div>
                <span className="inline-block bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase">{r.badge}</span>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">「{r.text}」</p>
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
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight">常见问题</h2>
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
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">订阅通讯</p>
          <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mb-3">每周获取AI内容创作技巧。</h2>
          <p className="text-gray-400 text-sm mb-6">转化率提升技巧、SEO实战、平台最新动态，每周免费送达。</p>
          <NewsletterForm lang="zh" />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mx-4 md:mx-6 mb-12 md:mb-16">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 md:p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">立即开始</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-5">
              您的专属AI写作团队，<br />
              <span className="text-gray-400">全年24小时在线。</span>
            </h2>
            <p className="text-gray-400 mb-7 text-base md:text-lg">无需信用卡 · 免费开始</p>
            <Link href="/zh/login" className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105">
              免费开始 →
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
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">任何文档，AI，5分钟。</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-gray-400">
              <Link href="/zh" className="hover:text-black transition-colors">首页</Link>
              <a href="#features" className="hover:text-black transition-colors">功能</a>
              <a href="#reviews" className="hover:text-black transition-colors">评价</a>
              <a href="#pricing" className="hover:text-black transition-colors">定价</a>
              <Link href="/" className="hover:text-black transition-colors">한국어</Link>
              <Link href="/zh/login" className="hover:text-black transition-colors">登录</Link>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-300">© 2026 PageAI. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-300">
              <Link href="/privacy" className="hover:text-black transition-colors">隐私政策</Link>
              <Link href="/terms" className="hover:text-black transition-colors">服务条款</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
