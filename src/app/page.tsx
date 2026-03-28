'use client'
import Link from 'next/link'
import { useState } from 'react'
import DemoAnimation from '@/components/DemoAnimation'
import CompareSection from '@/components/CompareSection'
import PricingSection from '@/components/PricingSection'
import LiveTicker from '@/components/LiveTicker'

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

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── 얼리버드 배너 ───────────────────────────── */}
      <div className="bg-black text-white text-center py-3 px-4 text-sm font-medium">
        <span className="text-yellow-400 font-black">⚡ 얼리버드 특가</span>
        {' '}프로 플랜 <span className="line-through text-gray-400">₩29,000</span>
        {' '}<span className="text-white font-black">₩14,500</span> · 종료까지
        {' '}<span className="bg-white text-black text-xs font-black px-2 py-0.5 rounded-full mx-1">D-3</span>
        <Link href="/login" className="ml-2 underline underline-offset-2 text-yellow-400 font-bold hover:text-yellow-300 transition-colors">
          지금 시작 →
        </Link>
      </div>

      {/* ─── NAV ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-black">AI</span>
            </div>
            <span className="font-black text-xl tracking-tight">페이지AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">주요 기능</a>
            <a href="#reviews" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">이용 후기</a>
            <a href="#faq" className="text-gray-500 text-sm hover:text-black transition-colors font-medium">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:block">로그인</Link>
            <Link href="/login" className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105">
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        {/* 소셜 프루프 배지 */}
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-2.5 rounded-full mb-8">
          <div className="flex -space-x-1">
            {['#FF5C35','#6366F1','#10B981','#F59E0B'].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="w-px h-3 bg-gray-300" />
          <span className="text-green-600 font-bold">1,200+</span>명이 이미 사용 중
          <span className="flex ml-1">
            {'★★★★★'.split('').map((s, i) => <span key={i} className="text-yellow-400 text-xs">{s}</span>)}
          </span>
          <span className="font-bold text-gray-700">4.9</span>
        </div>

        {/* 헤드라인 */}
        <h1
          className="text-[72px] md:text-[96px] font-black text-black leading-[0.92] tracking-[-0.04em] mb-8"
          style={{ fontFamily: "'Pretendard', sans-serif" }}
        >
          압도적 퀄리티<br />
          <span className="text-gray-200">상세페이지,</span><br />
          AI로 5분 완성.
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed font-medium">
          제품 정보 30초 입력하고, 지금 바로 다운로드 하세요.<br />
          <span className="text-gray-600 font-semibold">외주 비용 95% 절감, 제작 시간 100% 단축.</span>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/login"
            className="bg-black text-white px-10 py-4 rounded-2xl text-lg font-black hover:bg-gray-800 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-black/10 active:scale-100"
          >
            지금 무료로 시작하기 →
          </Link>
        </div>
        <p className="text-xs text-gray-300 font-medium">신용카드 불필요 · 무료로 시작 · 30초면 충분</p>
      </section>

      {/* ─── DEMO ANIMATION ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="text-center mb-10">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">작동 방식</p>
          <h2 className="text-5xl font-black text-black tracking-tight leading-tight mb-3">
            입력하면,<br />
            <span className="text-gray-300">AI가 알아서 완성합니다.</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">실제 서비스 시뮬레이션 · 자동 반복</p>
        </div>
        <DemoAnimation />
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


      {/* ─── COMPARE SECTION ─────────────────────────── */}
      <CompareSection />

      {/* ─── FEATURES ─────────────────────────────────── */}
      <section id="features" className="bg-black py-20 my-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">주요 기능</p>
            <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
              팔리는 상품에는<br />
              <span className="text-gray-500">공통된 법칙이 있어요.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:bg-white/10 transition-all group">
                <div className="text-4xl mb-5">{f.icon}</div>
                <h3 className="text-lg font-black text-white mb-2 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10X', label: '비용 절감', sub: '외주 대비' },
            { value: '2X', label: '구매 전환율', sub: '평균 향상' },
            { value: '5X', label: '생산성 증가', sub: '제작 속도' },
            { value: '10X', label: '신제품 출시', sub: '속도 향상' },
          ].map((s, i) => (
            <div key={i} className="text-center py-10 border border-gray-100 rounded-3xl hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="text-6xl font-black text-black tracking-[-0.04em] mb-1">{s.value}</div>
              <div className="text-sm font-bold text-gray-600 mb-0.5">{s.label}</div>
              <div className="text-xs text-gray-300">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────── */}
      <PricingSection />

      {/* ─── REVIEWS ──────────────────────────────────── */}
      <section id="reviews" className="bg-gray-50 py-20 my-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">실사용자 후기</p>
            <h2 className="text-5xl font-black text-black tracking-tight leading-tight mb-3">
              먼저 사용해본<br />사용자들의 생생한 후기.
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <span className="text-2xl font-black text-black">4.9</span>
              <span className="text-gray-400 text-sm">(실사용자 평점)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className={`bg-white border border-gray-100 rounded-3xl p-7 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100 transition-all hover:-translate-y-1 ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
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
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">자주 묻는 질문</p>
          <h2 className="text-5xl font-black text-black tracking-tight">궁금한 점이<br />있으신가요?</h2>
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

      {/* ─── FINAL CTA ────────────────────────────────── */}
      <section className="mx-6 mb-16">
        <div
          className="max-w-5xl mx-auto rounded-3xl p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)' }}
        >
          {/* 배경 글로우 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">지금 바로 시작하세요</p>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-6">
              나만의 전문가 AI 팀,<br />
              <span className="text-gray-400">지금 바로 구독하세요.</span>
            </h2>
            <p className="text-gray-400 mb-10 text-lg">신용카드 불필요 · 무료로 시작</p>
            <Link
              href="/login"
              className="inline-block bg-white text-black px-12 py-5 rounded-2xl text-lg font-black hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
            >
              무료로 시작하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-black rounded-xl flex items-center justify-center">
                  <span className="text-white text-xs font-black">AI</span>
                </div>
                <span className="font-black text-lg tracking-tight">페이지AI</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">당신의 상세페이지 제작 AI 파트너.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-gray-400">
              <Link href="/" className="hover:text-black transition-colors">홈</Link>
              <Link href="#features" className="hover:text-black transition-colors">주요 기능</Link>
              <Link href="#reviews" className="hover:text-black transition-colors">이용 후기</Link>
              <Link href="#faq" className="hover:text-black transition-colors">FAQ</Link>
              <Link href="/login" className="hover:text-black transition-colors">로그인</Link>
              <Link href="/dashboard" className="hover:text-black transition-colors">대시보드</Link>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-300">© 2026 페이지AI. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-300">
              <a href="#" className="hover:text-black transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-black transition-colors">이용약관</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── LIVE TICKER ──────────────────────────────── */}
      <LiveTicker />
    </main>
  )
}
