import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = 'onboarding@resend.dev' // 도메인 인증 후 noreply@페이지ai.kr 로 변경

export const WELCOME_EMAIL = (email: string) => ({
  from: FROM_EMAIL,
  to: email,
  subject: '페이지AI 뉴스레터 구독 완료 🎉',
  html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Apple SD Gothic Neo',Pretendard,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #f3f4f6;">
        <!-- 헤더 -->
        <tr><td style="background:#000000;padding:32px 40px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#ffffff;width:28px;height:28px;border-radius:8px;text-align:center;vertical-align:middle;">
                <span style="font-size:11px;font-weight:900;color:#000;">AI</span>
              </td>
              <td style="padding-left:10px;font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">페이지AI</td>
            </tr>
          </table>
        </td></tr>
        <!-- 본문 -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">뉴스레터 구독 완료</p>
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#000;line-height:1.2;letter-spacing:-1px;">
            매주 전환율 높이는<br>카피 공식을 보내드릴게요.
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;">
            안녕하세요! 페이지AI 뉴스레터에 구독해주셔서 감사합니다.<br>
            매주 스마트스토어·쿠팡 셀러를 위한 <strong style="color:#000;">전환율 높이는 카피 공식 1개</strong>를 실제 예시와 함께 보내드립니다.
          </p>
          <!-- 혜택 박스 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:16px;margin-bottom:28px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">구독자 혜택</p>
              ${[
                '매주 카피 공식 1개 + 실전 예시',
                '스마트스토어·쿠팡 전환율 데이터',
                '업종별 잘 팔리는 소구점 분석',
              ].map(item => `
              <table cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td style="width:20px;height:20px;background:#000;border-radius:50%;text-align:center;vertical-align:middle;font-size:10px;color:#fff;font-weight:900;">✓</td>
                  <td style="padding-left:10px;font-size:14px;color:#374151;font-weight:500;">${item}</td>
                </tr>
              </table>`).join('')}
            </td></tr>
          </table>
          <!-- CTA -->
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#000;border-radius:14px;">
              <a href="https://krmong-detail-mvp.vercel.app/login" style="display:block;padding:16px 32px;font-size:14px;font-weight:900;color:#fff;text-decoration:none;letter-spacing:-0.3px;">
                AI 상세페이지 무료로 만들기 →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <!-- 푸터 -->
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#d1d5db;line-height:1.6;">
            © 2026 페이지AI · <a href="#" style="color:#9ca3af;">구독 해지</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
})

export const SIGNUP_WELCOME_EMAIL = (email: string) => ({
  from: FROM_EMAIL,
  to: email,
  subject: '페이지AI에 오신 걸 환영합니다 👋',
  html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Apple SD Gothic Neo',Pretendard,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #f3f4f6;">
        <tr><td style="background:#000000;padding:32px 40px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#fff;width:28px;height:28px;border-radius:8px;text-align:center;vertical-align:middle;font-size:11px;font-weight:900;">AI</td>
            <td style="padding-left:10px;font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.5px;">페이지AI</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">가입 완료</p>
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#000;line-height:1.2;letter-spacing:-1px;">
            이제 5분 만에<br>전문가 상세페이지를<br>만들 수 있어요.
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">
            무료 플랜으로 매달 <strong style="color:#000;">5개의 상세페이지</strong>를 생성할 수 있습니다.<br>
            제품 정보를 입력하면 AI가 전환율 높은 카피를 즉시 완성해드려요.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#000;border-radius:14px;">
            <a href="https://krmong-detail-mvp.vercel.app/order/new" style="display:block;padding:16px 32px;font-size:14px;font-weight:900;color:#fff;text-decoration:none;">
              첫 상세페이지 만들기 →
            </a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#d1d5db;">© 2026 페이지AI</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
})

// D+1 온보딩 이메일 — 전환율 비밀
export const ONBOARDING_DAY1_EMAIL = (email: string) => ({
  from: FROM_EMAIL,
  to: email,
  subject: '팔리는 상세페이지의 비밀 3가지 (셀러 필독)',
  html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Apple SD Gothic Neo',Pretendard,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #f3f4f6;">
        <tr><td style="background:#000000;padding:32px 40px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#fff;width:28px;height:28px;border-radius:8px;text-align:center;vertical-align:middle;font-size:11px;font-weight:900;">AI</td>
            <td style="padding-left:10px;font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.5px;">페이지AI</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">전환율 높이는 공식</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:900;color:#000;line-height:1.3;letter-spacing:-1px;">
            잘 팔리는 상세페이지에는<br>공통점이 있습니다.
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;">
            수백 개의 스마트스토어 상세페이지를 분석한 결과, 구매전환율 상위 10%는 이 3가지를 꼭 지키고 있었습니다.
          </p>
          ${[
            { num: '01', title: '첫 화면에서 고객의 "문제"를 말하라', desc: '구매 결정의 70%는 첫 3초에 일어납니다. "이 제품이 좋아요"가 아닌 "이런 문제 있으신가요?"로 시작하세요. 페이지AI는 이 원칙을 첫 섹션에 자동 적용합니다.' },
            { num: '02', title: '숫자로 증명하라', desc: '"효과가 좋아요"보다 "2주 만에 피부 수분도 28% 증가"가 3배 더 설득력 있습니다. 수치, 기간, 퍼센트를 반드시 포함하세요.' },
            { num: '03', title: '마지막 섹션은 반드시 행동 유도로 끝내라', desc: '상세페이지를 끝까지 읽은 고객은 구매 의향이 높습니다. "지금 구매하면 ~" 식의 명확한 행동 유도 문구로 마무리하세요.' },
          ].map(item => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background:#f9fafb;border-radius:16px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#9ca3af;letter-spacing:2px;">${item.num}</p>
              <p style="margin:0 0 8px;font-size:15px;font-weight:900;color:#000;">${item.title}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">${item.desc}</p>
            </td></tr>
          </table>`).join('')}
          <table cellpadding="0" cellspacing="0" style="margin-top:8px;"><tr><td style="background:#000;border-radius:14px;">
            <a href="https://krmong-detail-mvp.vercel.app/order/new" style="display:block;padding:16px 32px;font-size:14px;font-weight:900;color:#fff;text-decoration:none;">
              이 원칙 적용된 상세페이지 만들기 →
            </a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#d1d5db;">© 2026 페이지AI · 이 메일은 가입 후 자동 발송됩니다</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
})

// D+3 온보딩 이메일 — 넛지
export const ONBOARDING_DAY3_EMAIL = (email: string) => ({
  from: FROM_EMAIL,
  to: email,
  subject: '아직 첫 상세페이지를 안 만드셨나요? (샘플 드릴게요)',
  html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Apple SD Gothic Neo',Pretendard,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #f3f4f6;">
        <tr><td style="background:#000000;padding:32px 40px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#fff;width:28px;height:28px;border-radius:8px;text-align:center;vertical-align:middle;font-size:11px;font-weight:900;">AI</td>
            <td style="padding-left:10px;font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.5px;">페이지AI</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">아직 시작 전이시라면</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:900;color:#000;line-height:1.3;letter-spacing:-1px;">
            먼저 실제 결과물을<br>눈으로 확인해보세요.
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;">
            "잘 나올까?" 걱정되시죠? 직접 보시면 안심이 됩니다.<br>
            건강식품, 뷰티, 주방용품 카테고리별 실제 생성 샘플을 준비했습니다.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:2px solid #000;border-radius:16px;overflow:hidden;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:900;color:#000;">📋 샘플 미리보기</p>
              ${[
                '🌿 건강식품 — 유산균 상세페이지 6섹션 전문',
                '✨ 뷰티/스킨케어 — 히알루론산 앰플 상세페이지',
                '🍳 주방용품 — 스테인리스 용기 세트 상세페이지',
              ].map(item => `<p style="margin:0 0 8px;font-size:13px;color:#374151;">✓ ${item}</p>`).join('')}
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr><td style="background:#000;border-radius:14px;">
            <a href="https://krmong-detail-mvp.vercel.app/samples" style="display:block;padding:16px 32px;font-size:14px;font-weight:900;color:#fff;text-decoration:none;">
              실제 샘플 보러 가기 →
            </a>
          </td></tr></table>
          <table cellpadding="0" cellspacing="0"><tr><td style="border:1px solid #e5e7eb;border-radius:14px;">
            <a href="https://krmong-detail-mvp.vercel.app/order/new" style="display:block;padding:14px 32px;font-size:14px;font-weight:700;color:#374151;text-decoration:none;">
              바로 만들어보기 →
            </a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#d1d5db;">© 2026 페이지AI · 이 메일은 가입 3일 후 자동 발송됩니다</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
})
