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
  'Amazon JP', '楽天市場', 'Tmall Global', 'Shopify',
  '商品詳細ページ', 'プレスリリース', '越境EC', '事業計画書',
]

const GOODBYE_ITEMS = [
  '多言語翻訳ミス', 'プラットフォームごとの規格変換', '高額な多言語ライター費用',
  '文化的ニュアンスの誤り', '2週間の納品待ち', 'Amazon A+コンテンツ手作業',
  '天猫詳細ページ作成の苦労', '低い越境EC転換率', '4言語を別々に修正',
  '楽天キーワード対策の手間', '翻訳後の別途修正', '各言語の外注コスト',
]

const FEATURES = [
  { icon: '🌏', title: '4言語同時生成', desc: '入力1回 → 日本語・韓国語・英語・中国語を同時生成。日本語は敬語スタイル、中国語は天猫A+形式、英語はAmazon形式に自動文化最適化。' },
  { icon: '🛒', title: 'プラットフォーム自動最適化', desc: '楽天・Amazon・天猫・Shopify・Qoo10・Lazadaに対応。プラットフォームを選ぶだけで、各規格のキーワード配置・構成に自動対応。' },
  { icon: '📊', title: '転換率予測レポート', desc: '生成後に「Amazon JP予想転換率+18% / 天猫CN クリック率+22%」などの市場別予測レポートを自動表示。' },
  { icon: '⚡', title: 'URL→5分で完成', desc: '商品URLを貼り付けるだけでAIが情報を自動分析→4言語越境ECページが5分以内に完成。' },
]

const REVIEWS = [
  { name: '田中 健太', role: '楽天・Amazon JP越境セラー', stars: 5, badge: '楽天CVR +24%', text: 'PageAIが生成する日本語は敬語が完璧で、楽天の検索キーワードも自然に含まれている。翻訳ではなく本当の現地化です。転換率が24%上がりました。' },
  { name: '山田 美咲', role: 'Shopifyグローバル店舗', stars: 5, badge: '4言語を5分で', text: '1回入力するだけで日本語・英語・韓国語・中国語が同時に生成される。以前は翻訳者に月20万円かけていましたが、今は10分でグローバル展開できます。' },
  { name: '鈴木 大輔', role: '天猫グローバルブランド担当', stars: 5, badge: '天猫CTR +22%', text: '天猫A+の詳細ページ形式で出力されるのが驚き。社会的証明・KOL訴求・促销情報まで自動で入る。CTRが22%上がりました。' },
  { name: '高橋 さくら', role: 'Qoo10・Lazadaセラー', stars: 5, badge: '月15万円節約', text: '越境モードで各プラットフォームを選ぶだけで規格に合った形式で出力される。多言語ライター費用が月15万円節約できました。' },
  { name: '伊藤 雄太', role: 'D2Cブランド6市場展開', stars: 5, badge: '6市場同時ローンチ', text: '以前は1市場ずつ6週間かかっていたローンチが、今は1日で6市場同時に展開できます。PageAIは越境ECの革命です。' },
  { name: '中村 あい', role: 'Amazon FBA・楽天掛け持ち', stars: 5, badge: 'プラットフォーム自動適応', text: '楽天とAmazonで違う形式が必要でしたが、PageAIがそれぞれの規格に自動対応。インライン編集でちょっと修正するだけで即使えます。' },
]

const FAQS = [
  { q: '4言語を本当に同時生成できますか？', a: 'はい！「4言語同時生成モード」をオンにすると、日本語・英語・韓国語・中国語を1回の入力で同時生成します。各言語は文化的に最適化：日本語は敬語・季節感・品質訴求、中国語は天猫A+スタイル・社会的証明、英語はAmazon A+形式です。' },
  { q: '楽天・Amazon・天猫など海外プラットフォームにそのまま使えますか？', a: 'はい！越境モードでプラットフォームを選択すると、Amazon A+コンテンツ形式（bullet point 5個）、天猫詳細ページ構成、楽天商品説明スタイルなど各規格に自動対応します。' },
  { q: '翻訳ではなく本当の現地化ですか？', a: '単純な翻訳ではありません。日本語は季節感・丁寧語・品質・職人技を強調。中国語はKOL推薦・销量・好评率などの社会的証明と促销情報を重視。英語はBenefit-first・数値根拠・Amazon SEOキーワード密度重視で、それぞれ別々に作成されます。' },
  { q: '商品URLから自動入力できますか？', a: 'はい！商品URLを貼り付けるだけで、AIがページを分析して商品名・カテゴリ・説明を自動入力。その後4言語で即座に生成できます。楽天・Amazon・Yahoo!ショッピング・Shopifyなどすべて対応。' },
  { q: '生成した文章は編集できますか？', a: 'はい。各セクションをクリックして直接インライン編集。言語タブを切り替えれば各言語版が表示されます。AIアシスタントに自然言語で修正依頼することも可能です。' },
  { q: '料金は外注と比べてどうですか？', a: '多言語コンテンツを4プラットフォーム分外注すると月10〜30万円かかります。PageAI Proは$29/月で全4言語・6プラットフォームに無制限対応。97%以上のコスト削減が可能です。' },
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
        <Link href="/ja/login" className="bg-white text-black px-3 py-1 rounded-lg text-xs font-black hover:bg-gray-100 transition-all">今すぐ始める →</Link>
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
            <Link href="/ja/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">ログイン</Link>
            <Link href="/ja/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">無料で始める</Link>
          </div>
        </div>
      </nav>

      <TrendWidget variant="strip" geo="JP" uiLocale="ja" />

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-5 pt-12 md:pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 md:px-4 py-2 rounded-full mb-6 md:mb-8">
          <span>🌏</span>
          <span className="hidden sm:inline">1,247人の越境セラーが利用 · 平均SEOスコア86 · 🇰🇷🇺🇸🇯🇵🇨🇳 4言語対応</span>
          <span className="sm:hidden">1,247セラー · 4言語</span>
        </div>

        <h1 className="text-[36px] sm:text-[52px] md:text-[80px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-4 md:mb-6">
          <span className="inline-block transition-all duration-300" style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)' }}>
            {HERO_WORDS[wordIdx]}
          </span>
          <span className="text-gray-200">も</span><br />
          <span className="text-gray-200">すべての商品を</span><br />
          4言語 · 5分で。
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-3 max-w-2xl mx-auto leading-relaxed font-medium px-2">
          1回入力 → 日本語・英語・韓国語・中国語を同時生成。<br className="hidden sm:block" />
          楽天 · Amazon · 天猫 · Shopify · Qoo10 · Lazadaに自動最適化。
        </p>
        <p className="text-sm text-gray-300 mb-8 max-w-xl mx-auto px-2">
          実際のセラーが<strong className="text-gray-500">転換率2倍</strong>・<strong className="text-gray-500">コスト10分の1</strong>を達成。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 px-4 sm:px-0">
          <Link href="/ja/login" className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl">
            今すぐ無料で始める →
          </Link>
          <Link href="/ja/login" className="border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl text-base font-bold hover:border-gray-400 transition-all">
            🌏 4言語デモを見る
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">クレジットカード不要 · 30秒で開始 · 初回無料</p>
      </section>

      {/* ── LIVE TICKER ── */}
      <LiveTicker lang="ja" />

      {/* ── PRODUCT SHOWCASE ── */}
      <ProductShowcase lang="ja" />

      {/* ── DEMO ANIMATION ── */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-5 text-center mb-8 md:mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">自動発行</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
            1回入力、<br />
            <span className="text-gray-300">4言語 · 4プラットフォーム同時発行。</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">入力 → AI 4言語同時生成 → Amazon · 天猫 · 楽天 · Shopify 自動最適化</p>
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
          <NewsletterForm lang="ja" />
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
            <Link href="/ja/login" className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105">
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
              <Link href="/ja/login" className="hover:text-black transition-colors">ログイン</Link>
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
