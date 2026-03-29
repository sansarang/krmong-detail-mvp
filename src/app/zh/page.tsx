'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import LangSwitcher from '@/components/LangSwitcher'
import { LogoEn } from '@/components/Logo'

const HERO_WORDS = [
  '商品详情页',
  '新闻稿',
  '商业计划书',
  '论文摘要',
  '公司简介',
  'IR路演资料',
  '政策宣传文',
  '研究提案书',
]

const FEATURES = [
  { icon: '⚡', title: '5分钟完成', desc: '从输入到PDF下载平均仅需5分钟。无需等待外包2周。' },
  { icon: '✏️', title: '点击即编辑', desc: '对某个板块不满意？点击一下即可直接编辑，无需来回邮件。' },
  { icon: '🌏', title: '40+行业分类', desc: '电商、汽车、餐饮、政府文件、学术论文……覆盖所有行业。' },
  { icon: '📤', title: '多平台导出', desc: '微信公众号、WordPress、Instagram、PDF — 一键导出所有格式。' },
]

const REVIEWS = [
  { name: '张伟', role: '电商店主', stars: 5, badge: '效率提升10倍', text: '「以前写一篇商品详情页要两周，现在5分钟搞定。质量一点不差，甚至更好。彻底解放了我的时间。」' },
  { name: '李慧', role: '品牌运营总监', stars: 5, badge: '成本降低90%', text: '「每个月30万的外包费用现在几乎降到零。AI对行业的理解深度让我非常惊讶，生成的内容专业度极高。」' },
  { name: '王明', role: '跨境电商负责人', stars: 5, badge: '转化率翻倍', text: '「用AI生成的页面和原来的做了A/B测试，AI版本转化率是原来的2倍。现在所有产品都在用了。」' },
]

const FAQS = [
  { q: 'PageAI是什么服务？', a: '只需输入产品或服务信息，AI就能在5分钟内生成专业级文档——商品详情页、新闻稿、商业计划书、论文摘要等应有尽有。' },
  { q: '支持哪些行业？', a: '支持40+行业分类：电商产品、汽车服务、餐厅、教育、房地产、IT/SaaS、政府文件、R&D提案、学术论文等。' },
  { q: '生成的内容可以编辑吗？', a: '可以。点击任意板块即可在线编辑。还可以通过AI对话助手用自然语言提出修改需求，例如"让这段文字更有说服力"。' },
  { q: '支持哪些语言？', a: '目前支持中文（简体）、韩语、英语、日语。' },
  { q: '收费标准是什么？', a: '免费版每月可生成5次。专业版每月199元（年付），支持无限次生成、SEO分析和博客自动发布。' },
]

export default function ChinesePage() {
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-4 flex justify-between items-center">
          <Link href="/zh" className="flex items-center gap-2.5">
            <LogoEn size={32} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">功能</a>
            <a href="#reviews" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">用户评价</a>
            <a href="#faq" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">常见问题</a>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-black transition-colors">KO</Link>
              <span>·</span>
              <Link href="/en" className="hover:text-black transition-colors">EN</Link>
              <span>·</span>
              <Link href="/ja" className="hover:text-black transition-colors">JA</Link>
              <span>·</span>
              <span className="text-black font-bold">ZH</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher current="zh" />
            <Link href="/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">登录</Link>
            <Link href="/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">
              免费开始
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-5 pt-12 md:pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 md:px-4 py-2 rounded-full mb-6 md:mb-8">
          <div className="flex -space-x-1 shrink-0">
            {['#FF5C35','#6366F1','#10B981','#F59E0B','#EC4899'].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="w-px h-3 bg-gray-300 shrink-0" />
          <span className="text-green-600 font-bold">Beta</span>
          <span className="hidden sm:inline">公测中 · 支持40+行业分类</span>
          <span className="sm:hidden">40+行业</span>
        </div>

        <h1 className="text-[40px] sm:text-[58px] md:text-[88px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-6 md:mb-8">
          <span className="inline-block transition-all duration-300" style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)' }}>
            {HERO_WORDS[wordIdx]}，
          </span>
          <br />
          <span className="text-gray-200">任何文档，</span><br />
          AI 5分钟完成。
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed font-medium px-2">
          输入信息，AI自动生成专业级文档。<br className="hidden sm:block" />
          <span className="text-gray-600 font-semibold"> 商品详情页·新闻稿·商业计划书，全部搞定。</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 px-4 sm:px-0">
          <Link href="/login" className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl">
            免费开始 →
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">无需信用卡 · 免费开始 · 30秒即可启动</p>
      </section>

      <section id="features" className="bg-black py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">核心功能</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              爆款文案都有<br /><span className="text-gray-500">共同的规律。AI深谙此道。</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all">
                <div className="text-3xl md:text-4xl mb-4">{f.icon}</div>
                <h3 className="text-base md:text-lg font-black text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: '10X', label: '成本节约', sub: '对比外包' },
            { value: '2X', label: '转化率提升', sub: '平均改善' },
            { value: '5X', label: '生产效率', sub: '制作速度' },
            { value: '40+', label: '行业分类', sub: '全覆盖' },
          ].map((s, i) => (
            <div key={i} className="text-center py-7 md:py-10 border border-gray-100 rounded-3xl hover:border-gray-300 transition-all">
              <div className="text-4xl md:text-6xl font-black text-black mb-1">{s.value}</div>
              <div className="text-xs md:text-sm font-bold text-gray-600 mb-0.5">{s.label}</div>
              <div className="text-xs text-gray-300">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="bg-gray-50 py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">用户评价</p>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">早期用户的<br />真实反馈。</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 hover:border-gray-300 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(n => <span key={n} className="text-yellow-400 text-sm">★</span>)}</div>
                <span className="inline-block bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4">{r.badge}</span>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">{r.text}</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ background: `hsl(${i * 80}, 60%, 50%)` }}>{r.name[0]}</div>
                  <div><p className="font-black text-sm text-black">{r.name}</p><p className="text-xs text-gray-400">{r.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-5 md:px-6 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14">
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

      <section className="mx-4 md:mx-6 mb-12 md:mb-16">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 md:p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">立即开始</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">您的AI写作团队，<br /><span className="text-gray-400">全天候待命。</span></h2>
            <p className="text-gray-400 mb-7 text-base md:text-lg">无需信用卡 · 免费开始</p>
            <Link href="/login" className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105">
              免费开始 →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-5 md:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-black rounded-xl flex items-center justify-center"><span className="text-white text-xs font-black">AI</span></div>
                <span className="font-black text-lg">PageAI</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">任何文档，AI 5分钟完成。</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-gray-400">
              <Link href="/zh" className="hover:text-black transition-colors">首页</Link>
              <Link href="#features" className="hover:text-black transition-colors">功能</Link>
              <Link href="#reviews" className="hover:text-black transition-colors">用户评价</Link>
              <Link href="#faq" className="hover:text-black transition-colors">常见问题</Link>
              <Link href="/" className="hover:text-black transition-colors">한국어</Link>
              <Link href="/en" className="hover:text-black transition-colors">English</Link>
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
