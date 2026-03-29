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

const HERO_WORDS = [
  '商品详情页', '新闻稿', '商业计划书', '论文摘要',
  '公司简介', 'IR路演资料', '政策宣传文', '研究提案书',
]

const GOODBYE_ITEMS = [
  '昂贵的外包费', '反复修改', '漫长等待', '千篇一律的AI输出',
  '浪费时间', '文案撰写费', '设计反复沟通', 'A/B测试猜测',
  '低转化文案', '错过截止日期', '质量不稳定', '策划会议',
]

const FEATURES = [
  { icon: '⚡', title: '5分钟完成', desc: '从输入到PDF下载平均仅需5分钟。无需等待外包2周。' },
  { icon: '✏️', title: '点击即编辑', desc: '对某个板块不满意？点击一下即可直接编辑，无需来回邮件。' },
  { icon: '🌏', title: '40+行业分类', desc: '电商、汽车、餐饮、政府文件、学术论文……覆盖所有行业。' },
  { icon: '📤', title: '多平台一键导出', desc: '微信公众号、WordPress、Instagram、PDF — 一键导出所有格式。' },
]

const REVIEWS = [
  { name: '张伟', role: '电商店主', stars: 5, badge: '效率提升10倍', text: '以前写一篇商品详情页要两周，现在5分钟搞定。质量一点不差，甚至更好。彻底解放了我的时间。' },
  { name: '李慧', role: '品牌运营总监', stars: 5, badge: '成本降低90%', text: '每个月30万的外包费用现在几乎降到零。AI对行业的理解深度让我非常惊讶，生成的内容专业度极高。' },
  { name: '王明', role: '跨境电商负责人', stars: 5, badge: '转化率翻倍', text: '用AI生成的页面和原来的做了A/B测试，AI版本转化率是原来的2倍。现在所有产品都在用了。' },
  { name: '陈晓燕', role: 'Shopify卖家', stars: 5, badge: '每月省1万元', text: '以前雇文案要花1万多，现在PageAI全搞定了。生成出来的内容直接可以用，完全不需要改。' },
  { name: '刘强', role: 'DTC品牌创始人', stars: 5, badge: '生产力提升5倍', text: '现在每月可以上线3倍的产品。以前要两周的工作，现在30分钟完成。真的是颠覆性的工具。' },
  { name: '赵雨', role: '自由撰稿人', stars: 5, badge: '即时编辑', text: '内联编辑功能太好用了。任何板块几秒内就能修改，给客户提案也变得顺畅多了。' },
]

const FAQS = [
  { q: 'PageAI是做什么的？', a: '只需输入产品或服务信息，AI在5分钟内自动生成专业文档——商品详情页、新闻稿、商业提案、学术摘要等，覆盖40+类别。' },
  { q: '支持哪些行业分类？', a: '支持40+类别：电商商品、汽车、餐饮、教育、房地产、IT/SaaS、政府文件、研究提案、学术论文等。' },
  { q: '生成的内容可以编辑吗？', a: '可以。点击任意板块即可直接内联编辑。也可以用自然语言向AI助手下指令，如"让这段更有说服力"。' },
  { q: '支持哪些语言？', a: '支持中文、韩文、英文、日文。系统会自动检测浏览器语言并设置输出语言。' },
  { q: '可以直接发布到博客吗？', a: '可以！生成后点击博客标签，选择微信公众号、WordPress、Instagram或Tistory，复制HTML粘贴到编辑器即完成发布。' },
  { q: '费用是多少？', a: '免费版每月可生成5次。专业版¥148/月，支持无限次生成、SEO分析和多平台发布。' },
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
        <Link href="/login" className="bg-white text-black px-3 py-1 rounded-lg text-xs font-black hover:bg-gray-100 transition-all">立即开始 →</Link>
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
            <Link href="/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">登录</Link>
            <Link href="/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">免费开始</Link>
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
          <span className="text-green-600 font-bold">测试版</span>
          <span className="hidden sm:inline">— 40+行业分类 · 任意语言 · 全球适用</span>
          <span className="sm:hidden">40+分类</span>
        </div>

        <h1 className="text-[40px] sm:text-[58px] md:text-[80px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-6 md:mb-8">
          <span className="inline-block transition-all duration-300" style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)' }}>
            {HERO_WORDS[wordIdx]}，
          </span>
          <br />
          <span className="text-gray-200">任何文档，</span><br />
          AI 5分钟搞定。
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed font-medium px-2">
          只需输入信息，AI即可生成<span className="text-gray-600 font-semibold">商品详情页、新闻稿、商业提案等</span>专业文档。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 px-4 sm:px-0">
          <Link href="/login" className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl">
            免费开始 →
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">无需信用卡 · 30秒即可开始</p>
      </section>

      {/* ── LIVE TICKER ── */}
      <LiveTicker lang="zh" />

      {/* ── PRODUCT SHOWCASE ── */}
      <ProductShowcase lang="zh" />

      {/* ── DEMO ANIMATION ── */}
      <section className="max-w-5xl mx-auto px-5 pb-8">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">使用方法</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
            输入信息，<br />
            <span className="text-gray-300">AI自动完成所有工作。</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">实时服务模拟 · 自动循环演示</p>
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
          <NewsletterForm />
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
            <Link href="/login" className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105">
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
              <Link href="/login" className="hover:text-black transition-colors">登录</Link>
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
