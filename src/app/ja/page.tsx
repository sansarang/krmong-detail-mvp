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
  '商品詳細ページ', 'プレスリリース', '事業計画書', '論文要約',
  '会社紹介', 'IRピッチ資料', '政策広報文', '研究提案書',
]

const GOODBYE_ITEMS = [
  '高額な外注費', '何度もの修正依頼', '遅い納品', '汎用的なAI出力',
  '無駄な時間', 'ライター費用', 'デザイン調整', 'A/Bテストの手間',
  '低い転換率', '納期遅れ', '品質のばらつき', '企画会議',
]

const FEATURES = [
  { icon: '⚡', title: '5分で完成', desc: '入力からPDFダウンロードまで平均5分。代理店に2週間待つ必要なし。' },
  { icon: '✏️', title: 'ワンクリック編集', desc: '気に入らないセクションはクリック一つで直接編集。メールのやりとり不要。' },
  { icon: '🌏', title: '40以上のカテゴリ', desc: 'ECサイト、自動車、飲食、官公庁、学術まで、あらゆる業種に対応。' },
  { icon: '📤', title: 'マルチプラットフォーム', desc: 'アメブロ、WordPress、Instagram、PDF — すべてワンクリックで出力。' },
]

const REVIEWS = [
  { name: '田中 健太', role: 'ECサイト運営者', stars: 5, badge: '制作速度10倍', text: 'コピーライターに頼むと2週間かかっていたのが、今では5分で完成。しかもクオリティは変わらないか、むしろ上がっているくらいです。' },
  { name: '山田 美咲', role: 'ネットショップ店長', stars: 5, badge: 'コスト90%削減', text: '外注費が月に30万円かかっていたのが、ほぼゼロになりました。AIが業種を正確に理解してくれるのが驚きです。' },
  { name: '鈴木 大輔', role: 'ブランドマネージャー', stars: 5, badge: '転換率2倍', text: 'AIが生成したページと従来のページをA/Bテストしたら、AI版が2倍の転換率を記録。全商品に導入を決めました。' },
  { name: '高橋 さくら', role: 'Shopify運営者', stars: 5, badge: '月5万円節約', text: 'ライター費用が月5万円かかっていたのが、PageAIで全部解決。生成した文章をそのまま使えるレベルです。' },
  { name: '伊藤 雄太', role: 'D2Cブランド創業者', stars: 5, badge: '生産性5倍', text: '月に3倍の商品をローンチできるようになりました。2週間かかっていた作業が30分で終わります。本当に革命的。' },
  { name: '中村 あい', role: 'フリーランスライター', stars: 5, badge: '即時編集', text: 'インライン編集機能が素晴らしい。どのセクションも数秒で修正できて、クライアントへの提案がスムーズになりました。' },
]

const FAQS = [
  { q: 'PageAIとは何ですか？', a: '商品・サービスの情報を入力するだけで、AIが5分以内に高品質な文書を自動生成します。商品詳細ページ、プレスリリース、事業計画書、論文要約など幅広く対応。' },
  { q: '対応カテゴリは何ですか？', a: 'ECサイト商品、自動車、飲食店、教育、不動産、IT/SaaS、官公庁文書、研究提案書、学術論文など40以上のカテゴリに対応しています。' },
  { q: '生成した文章は編集できますか？', a: 'はい。各セクションをクリックすれば直接インライン編集できます。AIアシスタントに「もっと説得力のある文章に」などと自然言語で指示することも可能です。' },
  { q: '対応言語は？', a: '日本語、韓国語、英語、中国語に対応。ブラウザの言語設定を自動検出して出力言語を設定します。' },
  { q: 'ブログに直接投稿できますか？', a: '生成後にブログタブを開き、WordPress、アメブロ、Instagram、ティストーリーから投稿先を選択。HTMLをコピー＆ペーストするだけで完了です。' },
  { q: '料金はいくらですか？', a: '無料プランで月5回まで生成可能。プロプランは¥2,980/月で無制限生成、SEO分析、マルチプラットフォーム投稿に対応。' },
]

export default function JaPage() {
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

      {/* ── 早期割引バナー ── */}
      <div className="bg-black text-white text-xs font-bold text-center py-3 px-4 flex items-center justify-center gap-3 flex-wrap">
        <span>⚡ 早期割引 — プロプラン</span>
        <span className="line-through text-gray-400">¥4,980</span>
        <span className="text-yellow-400 text-base font-black">¥2,480</span>
        <Link href="/login" className="bg-white text-black px-3 py-1 rounded-lg text-xs font-black hover:bg-gray-100 transition-all">今すぐ始める →</Link>
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-4 flex justify-between items-center">
          <Link href="/ja"><Logo size={32} /></Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">機能</a>
            <a href="#reviews" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">レビュー</a>
            <a href="#pricing" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">料金</a>
            <a href="#faq" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher current="ja" />
            <Link href="/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">ログイン</Link>
            <Link href="/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">無料で始める</Link>
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
          <span className="text-green-600 font-bold">ベータ</span>
          <span className="hidden sm:inline">— 40以上のカテゴリ対応中</span>
          <span className="sm:hidden">40+カテゴリ</span>
        </div>

        <h1 className="text-[40px] sm:text-[58px] md:text-[80px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-6 md:mb-8">
          <span className="inline-block transition-all duration-300" style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)' }}>
            {HERO_WORDS[wordIdx]}も
          </span>
          <br />
          <span className="text-gray-200">あらゆる文書を</span><br />
          AIで5分に。
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed font-medium px-2">
          情報を入力するだけ。AIが<span className="text-gray-600 font-semibold">商品ページ・プレスリリース・提案書など</span>を5分以内に自動生成。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 px-4 sm:px-0">
          <Link href="/login" className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl">
            無料で始める →
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">クレジットカード不要 · 30秒で始める</p>
      </section>

      <TrendWidget variant="strip" geo="JP" uiLocale="ja" />

      {/* ── LIVE TICKER ── */}
      <LiveTicker lang="ja" />

      {/* ── PRODUCT SHOWCASE ── */}
      <ProductShowcase lang="ja" />

      {/* ── DEMO ANIMATION ── */}
      <section className="max-w-5xl mx-auto px-5 pb-8">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">使い方</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
            入力するだけで、<br />
            <span className="text-gray-300">AIが自動で完成させます。</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">実際のサービスシミュレーション · 自動ループ</p>
        </div>
        <DemoAnimation lang="ja" />
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
      <BeforeAfterSection lang="ja" />

      {/* ── COMPARE ── */}
      <CompareSection lang="ja" />

      {/* ── FEATURES ── */}
      <section id="features" className="bg-black py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">主な機能</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              売れる文章には<br />
              <span className="text-gray-500">共通の法則があります。</span>
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
            { value: '10X', label: 'コスト削減', sub: '外注比較' },
            { value: '2X',  label: '転換率向上', sub: '平均改善率' },
            { value: '5X',  label: '生産性アップ', sub: '制作速度' },
            { value: '40+', label: 'カテゴリ数', sub: '全業種対応' },
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
      <PricingSection lang="ja" />

      {/* ── REVIEWS ── */}
      <section id="reviews" className="bg-gray-50 py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">ユーザーレビュー</p>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
              先に試した<br />ベータユーザーの声。
            </h2>
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold">ベータテスター実績レビュー</span>
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
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight">よくある質問</h2>
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
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">ニュースレター</p>
          <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mb-3">AIコンテンツのコツを毎週お届け。</h2>
          <p className="text-gray-400 text-sm mb-6">転換率向上のヒント、SEOテクニック、プラットフォーム最新情報を無料で。</p>
          <NewsletterForm />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mx-4 md:mx-6 mb-12 md:mb-16">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 md:p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">今すぐ始める</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-5">
              あなただけのAIライター、<br />
              <span className="text-gray-400">24時間365日稼働。</span>
            </h2>
            <p className="text-gray-400 mb-7 text-base md:text-lg">クレジットカード不要 · 無料で始める</p>
            <Link href="/login" className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105">
              無料で始める →
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
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">あらゆる文書を、AIで5分に。</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-gray-400">
              <Link href="/ja" className="hover:text-black transition-colors">ホーム</Link>
              <a href="#features" className="hover:text-black transition-colors">機能</a>
              <a href="#reviews" className="hover:text-black transition-colors">レビュー</a>
              <a href="#pricing" className="hover:text-black transition-colors">料金</a>
              <Link href="/" className="hover:text-black transition-colors">한국어</Link>
              <Link href="/login" className="hover:text-black transition-colors">ログイン</Link>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-300">© 2026 PageAI. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-300">
              <Link href="/privacy" className="hover:text-black transition-colors">プライバシーポリシー</Link>
              <Link href="/terms" className="hover:text-black transition-colors">利用規約</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
