import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 — 페이지AI',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 bg-black rounded-lg" />
          <span className="font-bold text-lg tracking-tight">페이지AI</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-black mb-2">개인정보처리방침</h1>
        <p className="text-gray-400 text-sm mb-12">최종 수정일: 2026년 3월 28일</p>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-black mb-3">1. 수집하는 개인정보</h2>
            <p>페이지AI(이하 "서비스")는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>이메일 주소 (회원가입 및 로그인 시)</li>
              <li>서비스 이용 기록 (생성한 상세페이지 내용)</li>
              <li>접속 기록, IP 주소, 쿠키 (서비스 품질 개선 목적)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>회원 가입 및 본인 확인</li>
              <li>AI 상세페이지 생성 서비스 제공</li>
              <li>서비스 개선 및 신규 기능 개발</li>
              <li>공지사항 전달 및 고객 지원</li>
              <li>이용 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p>회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">4. 개인정보의 제3자 제공</h2>
            <p>서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 아래의 경우는 예외로 합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">5. 개인정보 처리 위탁</h2>
            <p className="text-sm">서비스는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁합니다.</p>
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden text-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-600">수탁업체</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-600">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3">Supabase Inc.</td>
                    <td className="px-4 py-3">회원 데이터 저장 및 인증</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3">Anthropic PBC</td>
                    <td className="px-4 py-3">AI 텍스트 생성</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3">Resend Inc.</td>
                    <td className="px-4 py-3">이메일 발송</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">6. 이용자의 권리</h2>
            <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>회원 탈퇴</li>
            </ul>
            <p className="mt-3 text-sm">권리 행사는 아래 이메일로 문의해 주세요.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">7. 쿠키(Cookie) 사용</h2>
            <p className="text-sm">서비스는 로그인 상태 유지 및 이용 통계 수집을 위해 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-3">8. 개인정보 보호 책임자</h2>
            <p className="text-sm">개인정보 보호 관련 문의는 아래로 연락해 주세요.</p>
            <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm">
              <p><span className="font-bold">이메일:</span> privacy@pageai.kr</p>
              <p className="mt-1"><span className="font-bold">처리 기간:</span> 문의 접수 후 7일 이내 답변</p>
            </div>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">홈으로</Link>
          <Link href="/terms" className="hover:text-black transition-colors">이용약관</Link>
        </div>
      </div>
    </main>
  )
}
