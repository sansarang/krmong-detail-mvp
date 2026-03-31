'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import DemoAnimation from '@/components/DemoAnimation'
import CompareSection from '@/components/CompareSection'
import BeforeAfterSection from '@/components/BeforeAfterSection'
import PricingSection from '@/components/PricingSection'
import LiveTicker from '@/components/LiveTicker'
import NewsletterForm from '@/components/NewsletterForm'
import CountdownBanner from '@/components/CountdownBanner'
import LangSwitcher from '@/components/LangSwitcher'
import ProductShowcase from '@/components/ProductShowcase'
import Logo from '@/components/Logo'
import TrendWidget from '@/components/TrendWidget'
import InternalSeoPills from '@/components/InternalSeoPills'
import HomeJsonLd from '@/components/HomeJsonLd'
import PromoDemoWidget from '@/components/PromoDemoWidget'

const HERO_WORDS = [
  'Amazon JP',
  '天猫 Tmall',
  '楽天 Rakuten',
  'Shopify',
  '상세페이지',
  '보도자료',
  '사업계획서',
  '크로스보더',
]

const GOODBYE_ITEMS = [
  '다국어 번역 오류', '플랫폼마다 다른 규격', '번역 후 별도 수정 지옥', '크로스보더 운영 복잡성',
  '값비싼 외주 카피라이터', '2주 납품 대기', '문화 뉘앙스 오역', '낮은 해외 전환율',
  'Amazon A+ 콘텐츠 작성 고통', '4개 언어 일일이 수정', 'Tmall 상세페이지 규격 맞추기', '수십번의 수정 요청',
]

const REVIEWS = [
  {
    name: '이지윤', role: '뷰티 크로스보더 셀러 (KR→JP)', stars: 5,
    text: '일본어 번역 맡기면 뉘앙스가 다 달라지는데, PageAI는 일본 楽天 스타일에 맞게 경어체로 딱 나와요. 번역비 월 40만원 절약했습니다.',
    badge: '번역비 절감 90%',
  },
  {
    name: '고우빈', role: 'Amazon JP 셀러', stars: 5,
    text: 'Amazon A+ Content 형식으로 bullet point까지 자동으로 맞춰서 나와요. 영어 카피라이터 고용 안 해도 될 것 같아요. 런칭 속도가 완전 달라졌습니다.',
    badge: 'Amazon 런칭 5배 빠름',
  },
  {
    name: '신재연', role: 'Tmall 글로벌 브랜드 담당자', stars: 5,
    text: '천猫 A+ 상세페이지 규격에 맞게 한 번에 나오는 게 정말 신기해요. 중국어 현지화도 "天猫爆款风格"로 딱 맞아서 CTR이 눈에 띄게 올랐어요.',
    badge: 'Tmall CTR +22%',
  },
  {
    name: '조수양', role: '헬스케어 D2C 브랜드 대표', stars: 5,
    text: '한 번 입력하면 KR·EN·JP·CN 4개 언어가 동시에 나오는 게 진짜 게임 체인저예요. 예전에는 각 언어마다 따로 외주 줬는데, 이제는 혼자서 4개국 동시 출시해요.',
    badge: '4개국 동시 출시',
  },
  {
    name: '박민준', role: 'Qoo10 뷰티 셀러', stars: 5,
    text: '크로스보더 모드 켜고 Qoo10 선택하면 플랫폼에 맞는 형식으로 딱 나와요. 카피를 살짝 바꾸고 싶을 때도 클릭 한 번으로 편집 가능하고요.',
    badge: '플랫폼 최적화 자동',
  },
  {
    name: '김서현', role: 'Shopify 글로벌 스토어 운영', stars: 5,
    text: '영어·일본어·중국어 동시에 Shopify용 상품 설명 만들어주는 AI가 없었어요. PageAI가 진짜 유일하게 문화적 뉘앙스까지 맞춰서 써줘요.',
    badge: '전환율 2배 향상',
  },
]

const FAQS = [
  {
    q: '4개 언어를 동시에 생성할 수 있나요?',
    a: '네! 출력 언어를 선택하면 해당 언어에 맞는 문화·톤으로 완전히 로컬라이징된 콘텐츠가 생성됩니다. 일본어는 敬語 스타일, 중국어는 天猫 A+ 스타일, 영어는 Amazon A+ 스타일로 자동 최적화됩니다.',
  },
  {
    q: 'Amazon JP · Tmall · Rakuten 등 해외 플랫폼에 바로 사용할 수 있나요?',
    a: '네! 크로스보더 모드에서 플랫폼을 선택하면 Amazon A+ Content 형식(bullet point 5개), Tmall 상세페이지 구조, 楽天 상품 설명 형식 등 플랫폼별 규격에 맞게 자동 생성됩니다.',
  },
  {
    q: '번역이 아니라 진짜 현지화인가요?',
    a: '단순 번역이 아닙니다. 일본은 계절감·정중함·품질 신뢰를 강조하고, 중국은 KOL 추천·사회적 증거·프로모션을 강조하며, 영어권은 Benefit-first + 수치 기반 신뢰 구조로 각각 다르게 작성됩니다.',
  },
  {
    q: '제품 URL만 넣으면 정보가 자동으로 채워지나요?',
    a: '네! 스마트스토어·쿠팡·Amazon·Shopify 등 어떤 쇼핑몰 URL이든 붙여넣으면 AI가 페이지를 분석해 제품명·카테고리·설명을 자동으로 입력합니다.',
  },
  {
    q: '상세페이지 1개 만드는 데 시간이 얼마나 걸리나요?',
    a: '제품 정보 입력 30초 + AI 생성 30~60초 = 평균 총 2분 이내. 4개 언어 버전을 따로 외주 줬다면 2주+를 기다려야 했을 작업입니다.',
  },
  {
    q: '외주 비용과 비교하면 얼마나 절약되나요?',
    a: '다국어 상세페이지 외주 제작 시 언어당 30~80만원, 4개 언어 기준 120~320만원이 소요됩니다. PageAI Pro($29/월)로 무제한 생성하면 95% 이상 절약됩니다.',
  },
]

const FEATURES = [
  {
    icon: '🌏',
    title: '4개국어 동시 생성',
    desc: '입력 1회 → KR·EN·JP·CN 동시 생성. 일본어는 敬語, 중국어는 天猫 스타일, 영어는 Amazon A+ 형식으로 각각 문화 최적화.',
  },
  {
    icon: '🛒',
    title: '플랫폼별 자동 최적화',
    desc: 'Amazon·Tmall·Rakuten·Shopify·Qoo10·Lazada — 플랫폼 선택만 하면 각각의 규격과 키워드 배치까지 자동 적용.',
  },
  {
    icon: '📊',
    title: '전환율 예측 리포트',
    desc: '생성 후 "Amazon JP 예상 전환율 +18% / Tmall CN 클릭률 +22%" 시장별 예측 리포트 자동 제공.',
  },
  {
    icon: '⚡',
    title: '5분 완성 · URL 자동 입력',
    desc: '제품 URL 붙여넣기 → AI가 정보 자동 분석 → 생성까지 5분. 4개국 동시 런칭을 외주 없이.',
  },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [wordIdx, setWordIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % HERO_WORDS.length)
        setFade(true)
      }, 300)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <HomeJsonLd />

      {/* ─── 얼리버드 배너 ───────────────────────────── */}
      <CountdownBanner />

      {/* ─── NAV ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">주요 기능</a>
            <a href="#reviews" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">이용 후기</a>
            <a href="#faq" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">FAQ</a>
            <Link href="/samples" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">샘플 보기</Link>
            <Link href="/blog" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">블로그</Link>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher current="ko" />
            <Link href="/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">로그인</Link>
            <Link href="/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── 실시간 트렌드 티커(슬림) ─────────────────── */}
      <TrendWidget variant="strip" />

      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pt-12 md:pt-20 pb-10 md:pb-12 text-center">
        {/* 소셜 프루프 배지 */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 md:px-4 py-2 md:py-2.5 rounded-full mb-6 md:mb-8 max-w-full overflow-hidden">
          <span className="shrink-0">🌏</span>
          <span className="hidden sm:inline truncate">1,247 cross-border sellers · Average SEO Score 86 · 🇰🇷🇺🇸🇯🇵🇨🇳 4 languages</span>
          <span className="sm:hidden truncate">1,247 sellers · 4 languages</span>
        </div>

        {/* 헤드라인 */}
        <h1
          className="text-[36px] sm:text-[52px] md:text-[80px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-4 md:mb-6"
          style={{ fontFamily: "'Pretendard', sans-serif" }}
        >
          <span
            className="inline-block transition-all duration-300 text-black"
            style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)' }}
          >
            {HERO_WORDS[wordIdx]}
          </span>
          <span className="text-gray-200">,</span><br />
          <span className="text-gray-200">어떤 제품이든</span><br />
          4개 언어로 5분 완성.
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-3 md:mb-4 max-w-2xl mx-auto leading-relaxed font-medium px-2">
          입력 1회 → KR·EN·JP·CN 동시 생성 + Amazon·Tmall·Rakuten·Shopify 플랫폼 자동 최적화
        </p>
        <p className="text-sm text-gray-300 mb-8 md:mb-10 max-w-xl mx-auto px-2">
          Real sellers see <strong className="text-gray-500">2X conversion</strong> & <strong className="text-gray-500">10X cost savings</strong> vs. outsourcing
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 md:mb-6 px-4 sm:px-0">
          <Link
            href="/login"
            className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-black/10 active:scale-100"
          >
            Start Free Now →
          </Link>
          <Link
            href="/login"
            className="border-2 border-gray-200 text-gray-700 px-6 md:px-8 py-4 rounded-2xl text-base font-bold hover:border-gray-400 transition-all"
          >
            🌏 4-Language Demo
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">No credit card · Free to start · 30 seconds to first result</p>
      </section>

      {/* ─── 실시간 트렌드 티커(슬림) + 내부 링크 ───── */}
      <InternalSeoPills />

      {/* ─── PRODUCT SHOWCASE ────────────────────────── */}
      <ProductShowcase />

      {/* ─── DEMO ANIMATION ──────────────────────────── */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-5 text-center mb-8 md:mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">분석 & 최적화</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
            글을 분석해서,<br />
            <span className="text-gray-300">돈 되는 글로 바꿉니다.</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">입력 → 분석 → 채널별 카피·키트 자동 생성</p>
        </div>
        <DemoAnimation lang="ko" />
      </section>

      {/* ─── SAY GOODBYE TO (마키) ─────────────────────── */}
      <div className="border-y border-gray-100 py-5 overflow-hidden bg-gray-50 my-8">
        <p className="text-center text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Say Goodbye to</p>
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {[...GOODBYE_ITEMS, ...GOODBYE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 bg-white border border-gray-100 text-gray-500 text-sm font-semibold px-5 py-2.5 rounded-full shrink-0 shadow-sm"
            >
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              {item}
            </span>
          ))}
        </div>
      </div>


      {/* ─── BEFORE/AFTER SECTION ────────────────────── */}
      <BeforeAfterSection lang="ko" />

      {/* ─── COMPARE SECTION ─────────────────────────── */}
      <CompareSection lang="ko" />

      {/* ─── FEATURES ─────────────────────────────────── */}
      <section id="features" className="bg-black py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">주요 기능</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              글로벌에서 팔리는 데는<br />
              <span className="text-gray-500">공통된 법칙이 있어요.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-7 hover:bg-white/10 transition-all group">
                <div className="text-3xl md:text-4xl mb-4 md:mb-5">{f.icon}</div>
                <h3 className="text-base md:text-lg font-black text-white mb-2 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: '4개', label: '언어 동시 생성', sub: '1회 입력으로' },
            { value: '6개', label: '글로벌 플랫폼', sub: 'Amazon·Tmall·Rakuten 등' },
            { value: '2X', label: '해외 전환율', sub: '단순번역 대비' },
            { value: '10X', label: '비용 절감', sub: '다국어 외주 대비' },
          ].map((s, i) => (
            <div key={i} className="text-center py-7 md:py-10 border border-gray-100 rounded-3xl hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="text-4xl md:text-6xl font-black text-black tracking-[-0.04em] mb-1">{s.value}</div>
              <div className="text-xs md:text-sm font-bold text-gray-600 mb-0.5">{s.label}</div>
              <div className="text-xs text-gray-300">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────── */}
      <PricingSection />

      {/* ─── REVIEWS ──────────────────────────────────── */}
      <section id="reviews" className="bg-gray-50 py-14 md:py-20 my-8">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">실사용자 후기</p>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
              먼저 사용해본<br />베타 테스터들의 생생한 후기.
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold">베타 테스터 실제 후기</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100 transition-all hover:-translate-y-1"
              >
                {/* 별점 */}
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                {/* 뱃지 */}
                <span className="inline-block bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase">
                  {r.badge}
                </span>
                {/* 리뷰 텍스트 */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">
                  &ldquo;{r.text}&rdquo;
                </p>
                {/* 작성자 */}
                <div className="flex items-center gap-3 pt-5 border-t border-gray-50">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black"
                    style={{ background: `hsl(${i * 60}, 60%, 50%)` }}
                  >
                    {r.name[0]}
                  </div>
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

      {/* ─── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="max-w-3xl mx-auto px-5 md:px-6 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">자주 묻는 질문</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight">궁금한 점이<br />있으신가요?</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-2xl overflow-hidden transition-all ${openFaq === i ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-7 py-5 text-left"
              >
                <span className="font-bold text-gray-900 pr-4">{faq.q}</span>
                <span className={`text-2xl font-light transition-transform shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-7 pb-6">
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── BLOG ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">블로그</p>
            <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight leading-tight">
              팔리는 상세페이지의<br />
              <span className="text-gray-200">모든 전략.</span>
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-bold text-gray-400 hover:text-black transition-colors hidden sm:block">
            전체 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { slug: 'smartstore-detail-page-tips', category: '전환율 최적화', color: 'bg-orange-50 text-orange-600 border-orange-200', title: '스마트스토어 상세페이지 전환율 높이는 10가지 방법', time: '8분' },
            { slug: 'coupang-detail-page-strategy', category: '쿠팡 최적화', color: 'bg-blue-50 text-blue-600 border-blue-200', title: '쿠팡 상위노출을 위한 상세페이지 전략 완벽 가이드', time: '10분' },
            { slug: 'ai-detail-page-2026', category: 'AI 트렌드', color: 'bg-purple-50 text-purple-600 border-purple-200', title: 'AI 상세페이지 자동 생성, 2026년에는 왜 필수인가', time: '6분' },
          ].map((post, i) => (
            <Link key={i} href={`/blog/${post.slug}`} className="group border border-gray-100 rounded-3xl p-6 hover:border-gray-300 hover:shadow-lg transition-all hover:-translate-y-0.5 bg-white">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-block mb-4 ${post.color}`}>
                {post.category}
              </span>
              <h3 className="text-sm md:text-base font-black text-black leading-snug mb-3 group-hover:opacity-70 transition-opacity">
                {post.title}
              </h3>
              <p className="text-xs text-gray-300 font-medium">{post.time} 읽기 →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 md:px-6 pb-8">
        <NewsletterForm lang="ko" />
      </section>

      {/* ─── FINAL CTA ────────────────────────────────── */}
      <section className="mx-4 md:mx-6 mb-12 md:mb-16">
        <div
          className="max-w-5xl mx-auto rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ready to sell globally?</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-5 md:mb-6">
              글로벌로 팔 준비,<br />
              <span className="text-gray-400">30초면 시작합니다.</span>
            </h2>
            <p className="text-gray-400 mb-3 text-base md:text-lg">No credit card · Free to start</p>
            <p className="text-gray-600 text-sm mb-7 md:mb-10">🇰🇷 한국어 · 🇺🇸 English · 🇯🇵 日本語 · 🇨🇳 中文 — 동시 생성</p>
            <Link
              href="/login"
              className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
            >
              Start Free Now →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-5 md:px-6 py-10 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8 md:mb-10">
            <div>
              <Logo size={28} className="mb-3" />
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">Turn any product into a 4-language selling machine.<br />어떤 제품이든 4개국어로 5분 만에 완성.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 md:gap-x-16 gap-y-3 text-sm text-gray-400">
              <Link href="/" className="hover:text-black transition-colors">홈</Link>
              <Link href="#features" className="hover:text-black transition-colors">주요 기능</Link>
              <Link href="#reviews" className="hover:text-black transition-colors">이용 후기</Link>
              <Link href="#faq" className="hover:text-black transition-colors">FAQ</Link>
              <Link href="/blog" className="hover:text-black transition-colors">블로그</Link>
              <Link href="/login" className="hover:text-black transition-colors">로그인</Link>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-300">© 2026 페이지AI. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-300">
              <Link href="/privacy" className="hover:text-black transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-black transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── LIVE TICKER ──────────────────────────────── */}
      <LiveTicker lang="ko" />
    </main>
  )
}
