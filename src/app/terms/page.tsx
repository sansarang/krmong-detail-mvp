import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '이용약관 — PageAI',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 bg-black rounded-lg" />
          <span className="font-bold text-lg tracking-tight">PageAI</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-black mb-2">이용약관</h1>
        <p className="text-gray-400 text-sm mb-12">최종 수정일: 2026년 3월 28일</p>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-black mb-3">제1조 (목적)</h2>
            <p className="text-sm">이 약관은 PageAI(이하 "서비스")가 제공하는 AI 상세페이지 자동 생성 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>"서비스"란 PageAI가 운영하는 AI 상세페이지 자동 생성 플랫폼을 의미합니다.</li>
              <li>"이용자"란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.</li>
              <li>"회원"이란 서비스에 개인정보를 제공하여 회원 등록을 한 자로, 서비스의 기능을 이용할 수 있는 자를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제3조 (약관의 효력 및 변경)</h2>
            <p className="text-sm">이 약관은 서비스 화면에 게시하거나 이메일로 이용자에게 공지함으로써 효력이 발생합니다. 서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 날부터 효력이 발생합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제4조 (서비스 이용)</h2>
            <p className="text-sm">서비스는 다음과 같은 기능을 제공합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>AI를 활용한 상품 상세페이지 자동 생성</li>
              <li>생성된 상세페이지의 저장 및 다운로드</li>
              <li>플랜에 따른 월 생성 횟수 제공</li>
            </ul>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-bold mb-2">플랜별 이용 한도</p>
              <ul className="space-y-1">
                <li>• 무료 플랜: 월 5회 생성</li>
                <li>• 프로 플랜: 월 50회 생성</li>
                <li>• 비즈니스 플랜: 무제한 생성</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제5조 (이용자의 의무)</h2>
            <p className="text-sm">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>타인의 개인정보 도용 또는 허위 정보 등록</li>
              <li>서비스를 이용하여 불법적인 콘텐츠 생성</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 통해 생성된 콘텐츠를 재판매하거나 무단 배포하는 행위</li>
              <li>API를 무단으로 사용하거나 크롤링하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제6조 (지식재산권)</h2>
            <p className="text-sm">서비스를 통해 생성된 상세페이지의 저작권은 이를 생성한 이용자에게 귀속됩니다. 서비스의 소프트웨어, 디자인, 로고 등의 지식재산권은 PageAI에 귀속됩니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제7조 (서비스 중단)</h2>
            <p className="text-sm">서비스는 다음의 경우 서비스 제공을 일시적으로 중단할 수 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>시스템 정기 점검 및 유지보수</li>
              <li>천재지변, 국가비상사태 등 불가항력적 사유</li>
              <li>기간 통신 사업자의 서비스 중단</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제8조 (환불 정책)</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
              <p className="font-bold text-blue-800 mb-2">30일 환불 보장</p>
              <p className="text-blue-700">결제 후 30일 이내에 서비스에 불만족하시는 경우 전액 환불해 드립니다. 환불 요청은 privacy@pageai.kr로 연락해 주세요.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제9조 (면책 조항)</h2>
            <p className="text-sm">서비스는 AI가 생성한 콘텐츠의 정확성, 완전성, 유용성을 보증하지 않습니다. AI 생성 콘텐츠를 실제 사용 전에 이용자가 직접 검토하고 필요한 경우 수정하여 사용하시기 바랍니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">제10조 (분쟁 해결)</h2>
            <p className="text-sm">서비스 이용과 관련하여 발생하는 분쟁에 대해서는 대한민국 법률을 적용하며, 관할 법원은 서울중앙지방법원으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">부칙</h2>
            <p className="text-sm">이 약관은 2026년 3월 28일부터 시행합니다.</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">홈으로</Link>
          <Link href="/privacy" className="hover:text-black transition-colors">개인정보처리방침</Link>
        </div>
      </div>
    </main>
  )
}
