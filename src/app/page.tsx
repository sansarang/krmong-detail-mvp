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
  '상세페이지',
  '보도자료',
  '사업계획서',
  '논문 요약',
  '회사소개서',
  'IR 피칭 문서',
  '정책 홍보문',
  '연구 제안서',
]

const GOODBYE_ITEMS = [
  '눈치보이는 디자이너와의 소통', '막막한 기획', '값비싼 외주비용', '내 제품을 잘 모르는 AI',
  '엄청난 시간 소모', '막막한 디자인', '경쟁사 디자인 베끼기', '수십번의 수정 요청',
  '느린 납품 속도', '일관성 없는 퀄리티', '비싼 카피라이터 비용', '기획 회의 시간 낭비',
]

const REVIEWS = [
  {
    name: '이지윤', role: '유산균 스토어 마케터', stars: 5,
    text: '상세페이지 하나 만드는데도 몇백씩 드는게 아까워서 계속 미루고 있었어요. 이제는 신제품 나올 때마다 바로 AI로 만들어요. 퀄리티도 외주랑 차이 없어요.',
    badge: '비용 절감 10배',
  },
  {
    name: '고우빈', role: '헬스 디바이스 기업 대표', stars: 5,
    text: '디자이너 연락하고 기다리고 수정요청하고... 이 과정만 2주는 걸렸는데, 이제는 하루 만에 끝나요. 제품 런칭 속도가 완전 달라졌습니다.',
    badge: '런칭 속도 10배',
  },
  {
    name: '신재연', role: '비건빵 셀러 대표', stars: 5,
    text: '같은 제품도 빠르게 다양한 버전으로 만들어볼 수 있어서 A/B 테스트하기 좋아요. 어떤 소구점이 더 잘 팔리는지 데이터로 알 수 있어요.',
    badge: '전환율 2배',
  },
  {
    name: '조수양', role: '건강 크래커 브랜드 대표', stars: 5,
    text: '처음엔 반신반의 했는데 써보니까 완전 괜찮은데요? 외주 디자이너 연락처 지워도 될 것 같아요. 진심으로 추천합니다.',
    badge: '생산성 5배',
  },
  {
    name: '박민준', role: '뷰티 셀러', stars: 5,
    text: '섹션 클릭해서 바로 수정되는 기능이 너무 편해요. 카피를 살짝 바꾸고 싶을 때 외주한테 메시지 보내는 대신 그냥 제가 바로 수정해요.',
    badge: '즉시 편집 가능',
  },
  {
    name: '김서현', role: '생활용품 스마트스토어 운영', stars: 5,
    text: '기획부터 카피, 디자인 방향까지 다 나오는게 신기해요. 제품 설명 좀 자세히 쓰면 정말 그럴싸한 상세페이지가 나와요. 강력 추천!',
    badge: '기획+카피 자동화',
  },
]

const FAQS = [
  {
    q: '페이지AI는 정확히 어떤 서비스인가요?',
    a: '제품 정보를 입력하면 AI가 스마트스토어·쿠팡에 최적화된 상세페이지 기획안을 자동 생성하는 서비스입니다. 헤드라인, 문제 공감, 제품 소개, 핵심 특징, 사용법, 구매 유도 CTA까지 6개 섹션을 전문 카피라이팅 수준으로 만들어드립니다.',
  },
  {
    q: '디자인이나 마케팅을 전혀 몰라도 괜찮을까요?',
    a: '네, 바로 그런 분들을 위해 만들어졌습니다. 어떤 내용을, 어떻게 구성하고, 어떻게 보여줘야 할지 AI가 먼저 제안하기 때문에, 당신은 제품 정보만 입력하면 됩니다.',
  },
  {
    q: '생성된 상세페이지를 수정할 수 있나요?',
    a: '네! 결과 화면에서 각 섹션을 클릭하면 바로 인라인 편집이 가능합니다. 제목과 본문을 자유롭게 수정한 후 PDF로 다운로드하세요.',
  },
  {
    q: '상세페이지 1개를 만드는 데 시간이 얼마나 걸리나요?',
    a: '제품 정보 입력에 약 30초~2분, AI 생성에 약 30초~1분이 소요됩니다. 평균 총 5분 이내에 완성됩니다.',
  },
  {
    q: '최종 결과물은 어떤 형태로 받을 수 있나요?',
    a: 'PDF 파일로 즉시 다운로드하실 수 있습니다. 스마트스토어·쿠팡에 이미지로 업로드하거나 인쇄 용도로 활용하실 수 있습니다.',
  },
  {
    q: '외주 비용과 비교하면 얼마나 절약되나요?',
    a: '일반적으로 상세페이지 외주 제작 비용은 30~100만원 수준입니다. 페이지AI를 이용하면 이 비용의 95% 이상을 절약할 수 있습니다.',
  },
]

const FEATURES = [
  {
    icon: '⚡',
    title: '5분 완성',
    desc: '입력부터 PDF 다운로드까지 평균 5분. 외주 업체 2주 기다릴 필요 없어요.',
  },
  {
    icon: '✏️',
    title: '클릭해서 즉시 수정',
    desc: '마음에 안 드는 섹션? 클릭 한 번으로 바로 편집. 이메일 왕복 없이.',
  },
  {
    icon: '📱',
    title: '모바일 완벽 최적화',
    desc: '390px 기준 모바일 미리보기. 스마트스토어 고객 80%는 모바일로 봅니다.',
  },
  {
    icon: '🔄',
    title: '무제한 재생성',
    desc: '마음에 안 들면 버튼 하나로 다시 생성. 다양한 버전으로 A/B 테스트하세요.',
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

      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pt-12 md:pt-20 pb-10 md:pb-12 text-center">
        {/* 소셜 프루프 배지 */}
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 md:px-4 py-2 md:py-2.5 rounded-full mb-6 md:mb-8 max-w-full overflow-hidden">
          <div className="flex -space-x-1 shrink-0">
            {['#FF5C35','#6366F1','#10B981','#F59E0B','#EC4899'].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="w-px h-3 bg-gray-300 shrink-0" />
          <span className="text-green-600 font-bold shrink-0">베타</span>
          <span className="hidden sm:inline truncate">운영 중 · 상세페이지·보도자료·사업계획서 등 40개+ 카테고리</span>
          <span className="sm:hidden truncate">운영 중 · 40개+ 카테고리</span>
        </div>

        {/* 헤드라인 */}
        <h1
          className="text-[40px] sm:text-[58px] md:text-[88px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-6 md:mb-8"
          style={{ fontFamily: "'Pretendard', sans-serif" }}
        >
          <span
            className="inline-block transition-all duration-300"
            style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(10px)', color: '#000' }}
          >
            {HERO_WORDS[wordIdx]},
          </span>
          <br />
          <span className="text-gray-200">어떤 글이든</span><br />
          AI로 5분 완성.
        </h1>

        <p className="text-base md:text-xl text-gray-400 mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed font-medium px-2">
          제품 상세페이지부터 보도자료·사업계획서·논문 요약까지<br className="hidden sm:block" />
          <span className="text-gray-600 font-semibold"> 정보만 입력하면 AI가 전문가 수준으로 완성.</span>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 md:mb-6 px-4 sm:px-0">
          <Link
            href="/login"
            className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl text-base md:text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-black/10 active:scale-100"
          >
            지금 무료로 시작하기 →
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">신용카드 불필요 · 무료로 시작 · 30초면 충분</p>
      </section>

      {/* ─── PROMO DEMO ─────────────────────────────── */}
      <PromoDemoWidget lang="ko" />

      {/* ─── 실시간 트렌드 티커(슬림) + 내부 링크 ───── */}
      <TrendWidget variant="strip" />
      <InternalSeoPills />

      {/* ─── PRODUCT SHOWCASE ────────────────────────── */}
      <ProductShowcase />

      {/* ─── DEMO ANIMATION ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-8">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">작동 방식</p>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
            입력하면,<br />
            <span className="text-gray-300">AI가 알아서 완성합니다.</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">실제 서비스 시뮬레이션 · 자동 반복</p>
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
              팔리는 상품에는<br />
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
            { value: '10X', label: '비용 절감', sub: '외주 대비' },
            { value: '2X', label: '구매 전환율', sub: '평균 향상' },
            { value: '5X', label: '생산성 증가', sub: '제작 속도' },
            { value: '10X', label: '신제품 출시', sub: '속도 향상' },
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
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">지금 바로 시작하세요</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-5 md:mb-6">
              나만의 전문가 AI 팀,<br />
              <span className="text-gray-400">지금 바로 구독하세요.</span>
            </h2>
            <p className="text-gray-400 mb-7 md:mb-10 text-base md:text-lg">신용카드 불필요 · 무료로 시작</p>
            <Link
              href="/login"
              className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg font-black hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
            >
              무료로 시작하기 →
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
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">어떤 글이든 AI가 5분 만에 완성.</p>
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
