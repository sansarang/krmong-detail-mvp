import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { buildDataContextBlock } from '@/lib/marketIntelCopy'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const FREE_LIMIT = 5

// ── 글로벌 프리미엄 시스템 프롬프트 ────────────────────────────────────
const GLOBAL_SYSTEM_PROMPT = `You are PageAI — the world's most sophisticated global e-commerce copywriter and product page architect. You write premium, culturally-native, conversion-optimized product pages for the world's top marketplaces.

YOUR NON-NEGOTIABLE STANDARDS:
1. SPECIFICITY: Every claim must be quantified. Never write vague sentences like "high quality" or "great product." Write "tested to 10,000+ wash cycles" or "98.7% customer satisfaction rate."
2. CULTURAL FLUENCY: Content must feel native — not translated. Japanese reads like a Japanese copywriter wrote it. Chinese reads like a Tmall expert. English reads like an Amazon A+ specialist.
3. ZERO FILLER: Every single sentence exists to move the reader toward purchase. Delete any sentence that doesn't serve conversion.
4. STORYTELLING: The best product pages tell a story. Hero narrative → problem agitation → solution reveal → proof → CTA.
5. PREMIUM FEEL: You write for luxury and premium brands. Sophisticated vocabulary. Confident voice. Never desperate or pushy.
6. JSON ONLY: Output must be valid JSON with no extra text before or after.`

export async function POST(req: NextRequest) {
  let orderId: string | undefined
  try {
    const body = await req.json()
    orderId = body.orderId
    const { outputLang = 'ko', customInstructions = '' } = body as { outputLang?: string; customInstructions?: string }
    const supabase = createAdminClient()

    // 주문 조회
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // ── 사용량 제한 체크 (무료 플랜) ──────────────────────────────
    const userSupabase = await createServerSupabaseClient()
    const { data: { user } } = await userSupabase.auth.getUser()

    if (user) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .neq('status', 'error')

      const monthlyCount = count ?? 0

      // 관리자 이메일 먼저 체크 (profiles 테이블 없어도 동작)
      const HARDCODED_ADMINS = ['jyj1653@krmong.local']
      const envAdmins = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
      const allAdmins = [...new Set([...HARDCODED_ADMINS, ...envAdmins])]

      if (allAdmins.includes(user.email ?? '')) {
        // 관리자 → 바로 생성 진행 (무제한)
      } else {
        // profiles 테이블에서 플랜 확인 (테이블 없으면 free로 간주)
        let plan = 'free'
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single()
          plan = profile?.plan ?? 'free'
        } catch { /* profiles 테이블 없음 */ }

        const isPaidPlan = plan === 'admin' || plan === 'pro' || plan === 'business'
        if (!isPaidPlan && monthlyCount > FREE_LIMIT) {
          return NextResponse.json(
            { error: 'LIMIT_EXCEEDED', message: `무료 플랜은 월 ${FREE_LIMIT}회까지 생성할 수 있어요.` },
            { status: 402 }
          )
        }
      }

    }
    // ─────────────────────────────────────────────────────────────

    // 상태 업데이트
    await supabase.from('orders').update({ status: 'generating' }).eq('id', orderId)

    // ── 양식 자동 작성 모드 감지 (완전 독립 처리) ────────────────
    const templateMatch = (order.description ?? '').match(/\[TEMPLATE_FORM\]([\s\S]*?)\[\/TEMPLATE_FORM\]/)
    if (templateMatch) {
      const templateContent = templateMatch[1].trim()
      const userInfo = (order.description ?? '')
        .replace(/\[TEMPLATE_FORM\][\s\S]*?\[\/TEMPLATE_FORM\]/, '')
        .replace(/\[MARKETS:[^\]]*\]/g, '')
        .replace(/\[CROSSBORDER:[^\]]*\]/g, '')
        .trim()

      const LANG_NAMES_T: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' }
      const isMultiLangT = outputLang === 'all'
      const targetLangs = isMultiLangT ? ['ko', 'en', 'ja', 'zh'] : [outputLang]

      const TEMPLATE_SYSTEM = `You are an elite document completion specialist — the world's best at filling in forms, templates, applications, reports, and proposals. You understand document structure, professional tone, and context-appropriate content.

YOUR STANDARDS:
1. COMPLETENESS: Fill EVERY blank, field, and section — never leave anything empty
2. PROFESSIONALISM: Use appropriate formal/professional language for the document type
3. SPECIFICITY: Include specific details, dates, numbers, and concrete examples
4. CONTEXTUAL FIT: Match the document's purpose (business plan ≠ academic report ≠ application form)
5. OUTPUT FORMAT: Return structured sections as JSON only`

      const buildTemplatePrompt = (lang: string) => {
        const langInst = lang !== 'ko'
          ? ` CRITICAL: All answers must be written entirely in ${LANG_NAMES_T[lang] ?? lang}.`
          : ''
        const docTitle = order.product_name || '문서'
        const customBlock = customInstructions
          ? `\n🔴 CUSTOM INSTRUCTIONS (HIGHEST PRIORITY):\n${customInstructions}\n🔴 END\n`
          : ''

        return `${customBlock}Complete this document/form with expert-level content.${langInst}

Document Title: ${docTitle}
${userInfo ? `\n=== USER PROVIDED REFERENCE INFO (use this to fill in answers) ===\n${userInfo}\n=== END REFERENCE INFO ===\n` : ''}

=== FORM / TEMPLATE TO COMPLETE ===
${templateContent}
=== END OF FORM ===

TASK:
1. Read the form/template above carefully
2. Identify ALL fields, blanks, questions, and sections
3. Fill in every single item with professional, specific, contextually-appropriate content
4. Use the reference info provided (if any) as the primary source of truth

FORMAT (for each section/field):
[Section or Field Name]
(Complete answer — minimum 2 sentences, specific and professional)

RULES:
- Fill EVERY field — no skipping
- Use reference info maximally — don't invent conflicting details
- If a field is unclear, make a logical professional assumption
- Formal, professional tone throughout
- Numbers, dates, and specifics where appropriate`
      }

      // 다중 언어 동시 생성
      if (isMultiLangT) {
        const langResults = await Promise.all(
          targetLangs.map(async (lang) => {
            const msg = await anthropic.messages.create({
              model: 'claude-sonnet-4-5',
              max_tokens: 3000,
              system: TEMPLATE_SYSTEM,
              messages: [{ role: 'user', content: buildTemplatePrompt(lang) }],
            })
            const c = msg.content[0]
            if (c.type !== 'text') throw new Error(`${lang} template 응답 오류`)
            const BG_COLORS = ['#FFFFFF', '#F8F9FA', '#F0F7FF', '#FFF8E7', '#F0FFF4', '#FFF0F5']
            const sections = parseTemplateTextToSections(c.text.trim(), BG_COLORS)
            return { lang, sections }
          })
        )
        const multiResult: Record<string, unknown> = { multi_lang: true, output_lang: 'all', template_mode: true }
        for (const { lang, sections } of langResults) {
          multiResult[lang] = { sections }
        }
        await supabase.from('orders').update({ status: 'done', result_json: multiResult }).eq('id', orderId)
        return NextResponse.json({ success: true, result: multiResult })
      }

      // 단일 언어
      const analyzeMsg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 3000,
        system: TEMPLATE_SYSTEM,
        messages: [{ role: 'user', content: buildTemplatePrompt(outputLang) }],
      })

      const analyzeContent = analyzeMsg.content[0]
      if (analyzeContent.type !== 'text') throw new Error('AI 응답 형식 오류')
      const filledText = analyzeContent.text.trim()

      const BG_COLORS = ['#FFFFFF', '#F8F9FA', '#F0F7FF', '#FFF8E7', '#F0FFF4', '#FFF0F5']
      const sections = parseTemplateTextToSections(filledText, BG_COLORS)

      if (sections.length === 0) throw new Error('양식 항목을 파싱하지 못했습니다')

      const tResult = { sections, output_lang: outputLang, template_mode: true }
      await supabase.from('orders').update({ status: 'done', result_json: tResult }).eq('id', orderId)
      return NextResponse.json({ success: true, result: tResult })
    }
    // ──────────────────────────────────────────────────────────

    // ── 업종 타입 자동 감지 ────────────────────────────────────
    const SERVICE_CATS = ['car_service','car_repair','interior','window','cleaning','moving',
      'construction','restaurant','cafe','delivery','franchise','academy','coaching','medical',
      'beauty_shop','fitness','realestate','pension','travel','insurance','saas','it_service','design']
    const AUTO_CATS    = ['used_car','new_car']
    const PUBLIC_CATS  = ['press_release','policy_pr','public_notice','project_intro']
    const GOV_CATS     = ['gov_proposal','research_proposal','performance_report','tech_intro']
    const ACADEMIC_CATS= ['paper_summary','research_intro','patent_intro','academic_report']
    const BIZPLAN_CATS = ['business_proposal','company_intro','ir_pitch','pr_article']

    const isService  = SERVICE_CATS.includes(order.category)
    const isAuto     = AUTO_CATS.includes(order.category)
    const isPublic   = PUBLIC_CATS.includes(order.category)
    const isGov      = GOV_CATS.includes(order.category)
    const isAcademic = ACADEMIC_CATS.includes(order.category)
    const isBizPlan  = BIZPLAN_CATS.includes(order.category)
    const isDocType  = isPublic || isGov || isAcademic || isBizPlan

    let sectionGuide: string
    let roleDesc: string

    if (isAuto) {
      roleDesc = '대한민국 최고의 자동차 판매 카피라이터'
      sectionGuide = `
[자동차 업종 — 6개 섹션 구성]
1. 후킹 헤드라인: 차량 핵심 어필 + 의문형 (연식/상태 포함)
2. 차량 상태: 사고 이력·점검 결과·보증 (숫자/수치 포함)
3. 주요 사양: 핵심 옵션과 특장점 나열 (✓ 기호 활용)
4. 구매 혜택: 할부/금융/보험 등 구매 지원 조건
5. 시승 안내: 방문·비대면 시승 예약 방법
6. 상담 유도 CTA: 지금 바로 연락/상담 유도`
    } else if (isService) {
      roleDesc = '대한민국 최고의 마케팅 카피라이터 겸 SEO 전문가'
      sectionGuide = `
[서비스업 — 6개 섹션 구성]
1. 후킹 헤드라인: 의문형으로 고객의 핵심 고민 제기
2. 고객 고민 공감: 이 서비스가 필요한 상황·불편함 묘사
3. 서비스 소개: 핵심 서비스 내용과 차별점 (수치/경력 포함)
4. 작업/시공 과정: 단계별 프로세스 (신뢰도 향상, 숫자 포함)
5. 시공 사례/후기: 실제 결과·고객 반응 구체적으로 언급
6. 예약/상담 CTA: 지금 바로 견적·예약·문의 유도`
    } else if (isPublic) {
      roleDesc = '공공기관 보도자료 및 홍보문 전문 작성가'
      sectionGuide = `
[공공기관·관공서 — 6개 섹션 구성]
1. 핵심 요약 헤드라인: 사업/정책명 + 핵심 성과/목적 한 문장
2. 배경 및 목적: 이 사업/정책이 필요한 사회적 배경과 추진 배경
3. 주요 내용: 구체적 사업 내용·정책 내용 (수혜 대상, 지원 규모, 일정 포함)
4. 기대 효과: 시민/국민에게 미치는 실질적 효과와 기대 성과 (수치 포함)
5. 신청 방법/일정: 신청 자격, 방법, 기간, 제출 서류
6. 담당 부서/문의: 관련 부서, 연락처, 추가 정보 안내`
    } else if (isGov) {
      roleDesc = '정부 R&D 과제 및 사업계획서 전문 컨설턴트'
      sectionGuide = `
[정부과제·R&D — 6개 섹션 구성]
1. 사업 개요: 과제명·사업 목적·추진 배경 (핵심 한 문장)
2. 필요성 및 문제점: 현재 시장·기술의 문제점, 왜 이 과제가 필요한가
3. 목표 및 내용: 정량적 목표 (수치), 세부 추진 내용 (단계별)
4. 추진 체계/방법론: 수행 기관, 역할 분담, 연구 방법론
5. 기대 성과·파급 효과: 기술적·경제적·사회적 기대 효과 (숫자 포함)
6. 예산 계획·일정: 연차별 예산 개요, 마일스톤, 신청 방법`
    } else if (isAcademic) {
      roleDesc = '학술 논문 및 연구 보고서 전문 작성가'
      sectionGuide = `
[논문·학술 — 6개 섹션 구성]
1. 연구 제목 및 요약 (Abstract): 연구 목적·방법·결과를 200자 내외로 압축
2. 연구 배경 및 필요성: 기존 연구의 한계, 이 연구가 필요한 이유
3. 연구 방법: 연구 설계, 대상, 분석 방법 (구체적 수치/지표 포함)
4. 핵심 연구 결과: 주요 발견사항, 통계적 수치, 그래프/표 설명
5. 결론 및 시사점: 연구의 학술적·실용적 기여, 한계점
6. 향후 연구 방향: 추가 연구 과제, 적용 가능 분야`
    } else if (isBizPlan) {
      roleDesc = '스타트업 투자 유치 및 사업계획서 전문 컨설턴트'
      sectionGuide = `
[기획·IR·PR — 6개 섹션 구성]
1. 핵심 가치 제안 (Value Proposition): 어떤 문제를 어떻게 해결하는가 한 문장
2. 시장 분석: TAM/SAM/SOM 또는 시장 규모, 경쟁 구도, 기회
3. 제품/서비스 소개: 핵심 기능·차별점, 현재 단계 (수치 포함)
4. 비즈니스 모델: 수익 구조, 고객 획득 전략, 단가/마진
5. 팀 및 실적: 창업팀 강점, 지금까지의 성과 (MAU, 매출, 파트너십 등)
6. 투자 요청/다음 단계: 필요 금액, 사용 계획, 마일스톤`
    } else {
      roleDesc = '세계 최고 수준의 e-commerce 카피라이터이자 브랜드 스토리텔러'
      sectionGuide = `
[제품 상세페이지 — 6개 섹션 구성 (인간적·유기적 흐름 필수)]

⚠️ CRITICAL: 아래 구성은 큰 흐름 가이드일 뿐이다. 각 섹션 제목·내용·문체는 제품 개성에 맞게 자유롭고 창의적으로 써야 한다. 판에 박힌 "후킹 헤드라인 → 문제 공감 → 제품 소개" 패턴을 기계적으로 반복하지 말 것.

흐름 원칙:
• 섹션 1 (오프닝): 독자를 즉시 사로잡는 강렬한 첫 문장. 질문형, 선언형, 이야기형 중 제품에 가장 어울리는 것으로. 절대 "여러분은 이런 불편함이 있으신가요?"처럼 뻔하게 시작하지 말 것.
• 섹션 2 (맥락 구축): 이 제품이 존재하는 이유. 세상의 문제, 또는 더 좋은 삶의 가능성을 그려라.
• 섹션 3 (솔루션 공개): 제품 자체를 소개. 핵심 가치 1~2개에 집중하고 나머지는 과감히 버려라.
• 섹션 4 (증거와 디테일): 숫자, 소재, 기술, 인증. 구체적인 수치가 신뢰를 만든다. ✓ 기호 활용.
• 섹션 5 (사용 경험): 이 제품을 사용하는 삶을 묘사. 감각적이고 생동감 있게.
• 섹션 6 (클로징): 구매로 이어지는 마무리. 긴박감, 독점성, 또는 감성적 연결 중 하나를 선택.

문체 다양성 규칙:
- 섹션마다 다른 톤과 리듬을 사용할 것 (짧고 강한 문장 vs 긴 서사 혼합)
- 최소 2개 섹션에서 의외성 있는 앵글 (의외의 통계, 반전, 스토리) 사용
- 본문에서 제품명을 직접 언급하되 지나치게 반복하지 말 것
- 수치는 최소 3개 섹션에서 자연스럽게 녹여 넣을 것`
    }

    const docRules = isDocType ? `
추가 문서 작성 규칙:
- 공식적이고 명확한 문체 사용 (비격식체 금지)
- 주요 수치·통계·날짜는 반드시 포함 (입력 정보 기반)
- 목적·대상·기대효과를 각 섹션에서 구체적으로 명시
- 전문 용어 적절히 활용 (과제명, 기관명 등)` : `
카피라이팅 품질 규칙:
- 섹션 제목은 각각 완전히 다른 스타일로 (의문형, 선언형, 수사학적 역설, 숫자 강조 등 혼합)
- 본문 길이도 섹션마다 다르게 (짧은 펀치 문단과 긴 설득 문단을 교차)
- "고품질", "최고의", "뛰어난" 같은 진부한 형용사 금지 — 구체적 사실로 대체
- 마지막 섹션은 읽은 후 즉시 행동하고 싶게 만드는 감정적 트리거 포함`

    // ── 마켓 & 크로스보더 마커 파싱 ──────────────────────────
    const marketsMatch = (order.description ?? '').match(/\[MARKETS:([^\]]+)\]/)
    const selectedMarkets = marketsMatch
      ? marketsMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
    const crossborderMatch = (order.description ?? '').match(/\[CROSSBORDER:([^\]]+)\]/)
    const crossborderPlatforms = crossborderMatch
      ? crossborderMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
    const cleanDescription = (order.description ?? '')
      .replace(/\[MARKETS:[^\]]+\]/g, '')
      .replace(/\[CROSSBORDER:[^\]]+\]/g, '')
      .trim()

    // ── 마켓별 특화 섹션 가이드 오버라이드 ───────────────────
    const MARKET_SECTION_GUIDES: Record<string, string> = {
      smartstore: `
[🏪 스마트스토어 — 모바일 세로형 긴 상세페이지]

⚠️ 스마트스토어 작성 원칙:
• 모바일 최적화: 문단당 3~4줄 이내, 짧고 임팩트 있게
• 이미지 삽입 마커 [IMAGE_N]을 본문 중간에 자연스럽게 배치
• 소제목은 감성+숫자 조합으로, 과하지 않게 (6개 섹션 모두 다른 스타일)

1. 후킹 헤드라인: 모바일 15자 내외의 강렬한 감성 질문 또는 선언 (뻔한 "~하시나요?" 패턴 금지)
2. 브랜드 스토리: 감성적 배경 + 사용 전/후 대비를 스토리로 풀어냄 [IMAGE_1]
3. 핵심 성분·소재·기능: ✓ 체크형 3~5가지 (각각 구체적 수치 포함) [IMAGE_2]
4. 실구매 후기 & 인증: "OO명 선택", 수상이력, 미디어 언급 (신뢰 구체화) [IMAGE_3]
5. 사용법 & 추천 대상: 단계별 + "이런 분께 딱" (공감 언어 사용)
6. 구매 유도 CTA: 한정수량·오늘만특가·무료배송·즉시구매 — 감정적 긴박감`,

      naver_blog: `
[📝 네이버 블로그 — 자연스러운 리뷰형 롱폼 글쓰기]

⚠️ 네이버 블로그 핵심 원칙 (반드시 준수):
• 소제목(H2/H3)을 최소화 — 6개 섹션 중 소제목을 쓴다면 2~3개 이하로 제한
• 소제목 없이 자연스러운 문단 전환으로 글 흐름 유지
• 인간이 직접 쓴 리뷰처럼 — "저는~", "솔직히~", "처음엔~" 등 1인칭 경험 서술 권장
• 글 중간에 [IMAGE_N] 마커로 사진을 자연스럽게 삽입
• 과도한 줄바꿈·광고성 문구 지양, 독자가 끝까지 읽고 싶은 흐름 유지

1. 도입부: 개인 경험담 또는 공감되는 상황에서 시작 (소제목 없이 자연스럽게) [IMAGE_1 — 제품 전체]
2. 첫인상 & 언박싱: 실제 받아본 느낌, 패키지 디테일, 기대감 (소제목 가볍게 또는 없이) [IMAGE_2]
3. 실제 써보니: 솔직한 사용 경험, 체감 효과, 예상과 달랐던 점 (가장 긴 섹션) [IMAGE_3]
4. 성분·스펙 분석: 전문적이지만 쉬운 언어로 — 독자 눈높이에 맞게
5. 비교 & 추천 대상: 다른 선택지와 비교, "이런 분께 강추" (자연스럽게 이어짐)
6. 마무리 & 구매 안내: 별점·총평 + 구매처 (광고성 느낌 없이 자연스럽게)`,

      coupang: `
[🛒 쿠팡 — 스펙 중심 + A/S 강조 상세페이지]

⚠️ 쿠팡 작성 원칙:
• 스펙·수치 중심 — 모호한 표현 없이 구체적 숫자로
• 신뢰도 요소 전면 배치 (로켓배송, 반품정책, 후기수)

1. 핵심 요약: 3줄 핵심 특징 (번호 목록, 가격 경쟁력 명시)
2. 상세 스펙: 크기·무게·소재·인증번호 수치 중심 (표 형식 권장)
3. 주요 특징 5가지: ✓ 체크리스트 + 각 항목 구체적 수치
4. 사용법 & 주의사항: 단계별 안내 + 보관법·주의문
5. A/S & 교환·반품: 로켓배송 여부 + 무료반품 + 고객센터 정보
6. 쿠팡에서 사야 하는 이유: 최저가 보장 + 빠른 배송 + 후기 수 강조`,

      amazon: `
[🛍️ Amazon JP A+ Content — Bullet-first premium format]

⚠️ Amazon A+ 작성 원칙:
• 소제목보다 BULLET POINTS가 핵심 — 각 bullet은 CAPITALIZED KEYWORD로 시작
• 모든 주장은 수치로 증명 (%, 숫자, 인증)
• 영어로 작성 시 passive voice 전면 금지

1. HOOK HEADLINE: One bold quantified benefit claim — shocking, specific, and believable
2. [CAPITALIZED KEYWORD]: Primary benefit deep-dive — mechanism + proof + result
3. [CAPITALIZED KEYWORD]: Quality/materials/certifications — specs, standards, test results
4. [CAPITALIZED KEYWORD]: Versatility & use cases — who, when, how, results achieved
5. SOCIAL PROOF: "★4.8 from 12,000+ verified buyers" + certifications + guarantee
6. CTA + URGENCY: Add-to-Cart copy + limited stock signal + 30-day return guarantee`,

      rakuten: `
[🎏 楽天市場 — 丁寧・品質・安心の詳細ページ]

⚠️ 楽天 執筆原則:
• 丁寧語・敬語を徹底 — 素直で誠実なトーン
• 品質へのこだわりと職人技を具体的数値で表現
• 小見出しは簡潔に、礼儀正しい言葉で (全6セクション異なるスタイル)

1. キャッチコピー: 品質と価格の両立 (楽天ランキング実績があれば具体的に記載)
2. 商品の特長: ✓リスト3〜5項目 (各項目に数値データ必須)
3. 品質保証: 素材・製造・検査プロセス + 職人のこだわりを人間的に語る
4. 使い方・シーン提案: 季節別・用途別の具体的な場面描写 [IMAGE_1]
5. お客様の声: 実際の購入者体験 (具体的エピソード含む) + 累計販売数
6. 購入特典 & CTA: 送料無料条件 + ポイント還元率 + 今すぐ購入`,

      tmall: `
[🏮 天猫A+详情页 — 爆款三角公式]

⚠️ 天猫 写作原则:
• 标题5字以内冲击力 — 不啰嗦，直接打心理
• 社交证明必须出现具体数据
• 场景化描述 — 让读者代入生活场景

1. 主图文案: 5字以内高冲击标题 + 核心卖点一句话 (如"轻奢必备·全网爆款")
2. 品牌故事与品质: 品牌背书 + 原材料/工艺细节 + 正品保障 (用讲故事方式)
3. 核心卖点×3: 每卖点配场景描述 + 数据证明 [IMAGE_1][IMAGE_2][IMAGE_3]
4. 社交证明: "已售XX万件" + KOL/达人推荐 + 买家真实反馈精选
5. 使用场景: 通勤/约会/送礼/自用场景化 — 让读者看到自己的生活
6. 促销CTA: 限时特价 + 满减活动 + 7天无理由退换 + 立即抢购`,
    }

    // 선택된 마켓이 있으면 sectionGuide를 마켓별로 오버라이드
    const primaryMarket = selectedMarkets.find((m: string) => MARKET_SECTION_GUIDES[m])
    if (primaryMarket && !isDocType) {
      sectionGuide = MARKET_SECTION_GUIDES[primaryMarket]
    }

    // ── 타겟 마켓 문화 로컬라이징 ────────────────────────────
    const CULTURAL_CONTEXT: Record<string, string> = {
      ko: `[🇰🇷 한국 내수 시장 — 스마트스토어 / 쿠팡 / 무신사 최적화]
TONE: 감성적 스토리텔링 + 구매 심리 자극 + 신뢰 구축
- 고객의 핵심 고민에 먼저 공감하고 "이 제품이 정확한 해결책"임을 자연스럽게 연결
- 신뢰 요소 필수 포함: 누적 판매량, 언론보도/수상내역, 실구매자 후기 (구체적 수치 포함)
- 구매 촉진 트리거: 한정수량, 오늘만 특가, 무료배송+당일출고, 첫 구매 특별 혜택
- 스마트스토어 SEO: 제품 핵심 키워드를 제목/첫 문단에 자연스럽게 2~3회 반복
- CTA: "지금 바로", "오늘 안에", "선착순 마감" 패턴으로 즉각 행동 유도`,
      en: `[🇺🇸🌎 Global English Market — Amazon A+ / Shopify Premium Optimization]
TONE: Bold benefit-first, premium lifestyle brand storytelling, direct & punchy
- OPEN with a specific, quantified benefit claim (e.g. "Cuts drying time by 40% — proven by 12,000 buyers")
- Amazon A+ Content structure: Hook → Problem Agitation → Solution Reveal → 5 Feature Bullets → Social Proof → CTA
- Feature bullets MUST start with a CAPITALIZED benefit keyword (e.g. "ULTRA-LIGHTWEIGHT:", "CLINICALLY PROVEN:")
- Trust signals: "4.8★ from 12,000+ verified reviews", FDA/CE certifications, before/after statistics
- Urgency & FOMO: "Only 47 left in stock", "Ships within 24 hours", "30-Day money-back guarantee"
- Zero passive voice — every sentence must be active, direct, and conversion-optimized`,
      ja: `[🇯🇵 日本市場 — 楽天市場 / Yahoo!ショッピング / Amazon.co.jp プレミアム最適化]
TONE: 丁寧語・敬語を徹底、礼儀正しく誠実、品質と職人技を強調
- 品質・精度・職人技・細部へのこだわりを具体的数値で表現（例：「0.1mmの精密加工」）
- 季節感と使用シーンを必ず明記：「乾燥が気になる季節に」「大切な方へのギフトにも最適」
- 実績と信頼の証拠：「累計○万本突破」「お客様満足度98.7%」「楽天デイリーランキング1位獲得」
- 安心保証を強調：「全品検品済み」「品質保証付き」「お問い合わせ24時間対応」「返品・交換無料」
- 楽天SEO: 商品名＋用途＋特徴を自然に組み合わせ、「レビュー高評価」「人気」等の長尾キーワードを活用`,
      zh: `[🇨🇳 中国市场 — 天猫 / 淘宝 / 京东 A+详情页爆款公式]
TONE: 高端品质感 × 社会认同 × 限时紧迫 = 爆款三角公式
- 开篇必须用5字以内的高冲击力标题（如"轻奢爆款"、"全网热销"、"国货之光"）
- 社交证明硬数据：「已售XX万件」「好评率99.8%」「XX位达人种草推荐」「微博热搜话题」
- 场景化痛点描述：在具体日常场景（通勤、约会、送礼、自用犒劳）中展示产品使用价值
- 品质与正品背书：「正品保障」「官方旗舰店直营」「7天无理由退换」「顺丰快递包邮」
- 限时促销必须出现：「限时秒杀」「今日特惠」「满减优惠」「新品首发价」
- 关键词埋点：将天猫/淘宝热搜词自然融入各卖点标题和描述中`,
    }
    const culturalContext = !isDocType ? (CULTURAL_CONTEXT[outputLang] ?? '') : ''

    // ── 크로스보더 플랫폼별 추가 섹션 가이드 ────────────────
    const PLATFORM_GUIDE: Record<string, string> = {
      amazon: '・Amazon: SEO title (80자), 5 Feature Bullets (each starting with caps), A+ Content description',
      shopify: '・Shopify: Brand story, detailed product features, social proof, strong CTA with urgency',
      tmall: '・天猫: 主图文案(5字以内冲击力标题), 详情页卖点(3个核心), 场景图说明, 促销活动',
      rakuten: '・楽天: 商品名キーワード最適化, 商品説明(詳細スペック含む), セール情報, お客様の声',
      qoo10: '・Qoo10: Deal highlight, product detail with specs, seller reputation signals',
      lazada: '・Lazada: Product highlights (5 bullets), brand story, warranty/return policy',
    }
    const platformGuide = crossborderPlatforms.length > 0
      ? `\n[크로스보더 플랫폼 최적화 — ${crossborderPlatforms.map((p: string) => p.toUpperCase()).join('/')}]\n` +
        crossborderPlatforms.map((p: string) => PLATFORM_GUIDE[p] ?? '').filter(Boolean).join('\n')
      : ''

    const LANG_NAMES: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語 (Japanese)', zh: '中文 (Chinese)' }
    const langInstruction = outputLang !== 'ko'
      ? `\n⚠️ IMPORTANT: Write ALL output content (title, body, section names) entirely in ${LANG_NAMES[outputLang] ?? outputLang}. Do NOT use Korean anywhere.`
      : ''

    // ── 데이터 기반 카피 컨텍스트 ─────────────────────────────
    const dataContext = !isDocType && outputLang !== 'all'
      ? buildDataContextBlock(
          outputLang as 'ko' | 'en' | 'ja' | 'zh',
          order.product_name,
          order.category,
          cleanDescription,
        )
      : ''

    // ── 제품 앵커 블록 (hallucination 방지 핵심) ─────────────
    // 카테고리별 "이것이 아니다" negative 힌트
    const NEGATIVE_HINTS: Record<string, string> = {
      beauty:      'NOT a food, clothing, electronics, or furniture product.',
      fashion:     'NOT a beauty product, electronics, food, or home appliance.',
      electronics: 'NOT a clothing, food, beauty, or furniture product.',
      food:        'NOT a beauty product, clothing, electronics, or furniture.',
      living:      'NOT a beauty product, clothing, or electronics product.',
      health:      'NOT a food brand, clothing, or electronics product.',
      sports:      'NOT a beauty product, food, or home appliance.',
      saas:        'NOT a physical product. This is a software/digital service.',
      other:       '',
    }
    const negativeHint = NEGATIVE_HINTS[order.category] ?? ''

    const buildProductAnchor = (lang: string) => {
      if (lang === 'ko' || lang === 'all') {
        return `🔒 제품 앵커 (절대 지켜야 할 사실):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
제품명: ${order.product_name}
카테고리: ${order.category}
핵심 설명: ${cleanDescription.slice(0, 500)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 이 제품은 반드시 위의 제품명과 카테고리를 기반으로 작성해야 한다.
⚠️ 절대 다른 제품이나 브랜드로 착각하거나 다른 제품에 대한 내용을 쓰지 마라.${negativeHint ? `\n⚠️ ${negativeHint}` : ''}
⚠️ 입력된 제품명 "${order.product_name}"을 3개 이상 섹션에서 반드시 언급할 것.
`
      }
      return `🔒 PRODUCT ANCHOR (ABSOLUTE TRUTH — DO NOT DEVIATE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product Name: ${order.product_name}
Category: ${order.category}
Core Description: ${cleanDescription.slice(0, 500)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: You are writing about THIS SPECIFIC PRODUCT: "${order.product_name}"
⚠️ DO NOT confuse this with any other product or brand.${negativeHint ? `\n⚠️ ${negativeHint}` : ''}
⚠️ MUST mention the product name "${order.product_name}" in at least 3 sections.
`
    }
    // ──────────────────────────────────────────────────────────

    // ── 4개 언어 동시 생성 모드 ───────────────────────────────
    if (outputLang === 'all') {
      const LANGS_ALL = ['ko', 'en', 'ja', 'zh']
      const LANG_NAMES_ALL: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' }

      const buildMultiPrompt = (lang: string) => {
        const lInst = lang !== 'ko'
          ? `\n⚠️ CRITICAL: Write ALL output (section name, title, body) ENTIRELY in ${LANG_NAMES_ALL[lang]}. Zero Korean characters allowed.`
          : ''
        const cCtx = !isDocType ? (CULTURAL_CONTEXT[lang] ?? '') : ''
        const dCtx = !isDocType
          ? buildDataContextBlock(lang as 'ko' | 'en' | 'ja' | 'zh', order.product_name, order.category, cleanDescription)
          : ''
        const langLabel: Record<string,string> = {
          ko: '한국어 카피라이터',
          en: 'English premium copywriter (Amazon A+ / Shopify specialist)',
          ja: '日本語カピーライター（楽天・Amazon.co.jp専門）',
          zh: '中文电商文案专家（天猫A+详情页专业）',
        }
        const customBlock = customInstructions
          ? `\n\n🔴 USER'S CUSTOM INSTRUCTIONS (HIGHEST PRIORITY — override defaults if conflicting):\n${customInstructions}\n🔴 END CUSTOM INSTRUCTIONS\n`
          : ''
        const anchor = buildProductAnchor(lang)
        return `${anchor}${customBlock}You are a world-class ${langLabel[lang] ?? roleDesc}.${lInst}

Product: ${order.product_name}
Category: ${order.category}
Description: ${cleanDescription}
${dCtx}
${cCtx ? `\n=== CULTURAL MARKET OPTIMIZATION ===\n${cCtx}\n=== END ===\n` : ''}${platformGuide ? '\n' + platformGuide : ''}
${sectionGuide}

MANDATORY QUALITY STANDARDS:
1. SPECIFICITY: Every body section must contain at least 1 quantified claim (number, %, stat, or metric)
2. CULTURAL VOICE: Write as a native speaker of the target market — not a translation
3. MINIMUM LENGTH: Each section body minimum 220 characters, mix short punchy paras with longer ones
4. ZERO FILLER: Never write "high quality," "great product," or any generic phrase — use concrete facts instead
5. SOCIAL PROOF: Include trust signals (reviews, certifications, sales numbers) in at least 2 sections
6. HUMAN FLOW: Each section must have a DIFFERENT tone, rhythm, and angle. Vary sentence length. Use storytelling, unexpected angles, sensory language. Never repeat the same structural pattern twice.
7. DIVERSE TITLES: Section titles must each use a completely different style — interrogative, declarative, paradoxical, numerical, evocative — never two titles with the same structure
8. ORGANIC TRANSITIONS: Content must flow naturally between sections like a human writer, not a template
${docRules}

Output JSON only (no other text, no markdown):
{"sections": [
  {"id": 1, "name": "Section Name", "title": "Compelling Title", "body": "Body 200+ chars", "bg_color": "#FFFFFF"},
  {"id": 2, "name": "Section Name", "title": "Compelling Title", "body": "Body 200+ chars", "bg_color": "#F8F9FA"},
  {"id": 3, "name": "Section Name", "title": "Compelling Title", "body": "Body 200+ chars", "bg_color": "#FFFFFF"},
  {"id": 4, "name": "Section Name", "title": "Compelling Title", "body": "Body 200+ chars", "bg_color": "#F0F7FF"},
  {"id": 5, "name": "Section Name", "title": "Compelling Title", "body": "Body 200+ chars", "bg_color": "#FFFFFF"},
  {"id": 6, "name": "Section Name", "title": "Compelling Title", "body": "Body 200+ chars", "bg_color": "#FFF8E7"}
]}`
      }

      const langResults = await Promise.all(
        LANGS_ALL.map(async (lang) => {
          const msg = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 3500,
            system: GLOBAL_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: buildMultiPrompt(lang) }],
          })
          const c = msg.content[0]
          if (c.type !== 'text') throw new Error(`${lang} 응답 오류`)
          const raw = c.text.trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```\s*$/i, '')
            .trim()
          const match = raw.match(/\{[\s\S]*\}/)
          if (!match) throw new Error(`${lang} JSON 파싱 실패`)
          const parsed = JSON.parse(match[0]) as { sections: unknown[] }
          return { lang, sections: parsed.sections }
        })
      )

      const multiResult: Record<string, unknown> = { multi_lang: true, output_lang: 'all' }
      for (const { lang, sections } of langResults) {
        multiResult[lang] = { sections }
      }

      await supabase.from('orders').update({ status: 'done', result_json: multiResult }).eq('id', orderId)
      return NextResponse.json({ success: true, result: multiResult })
    }
    // ─────────────────────────────────────────────────────────

    const customBlock = customInstructions
      ? `\n🔴 USER'S CUSTOM INSTRUCTIONS (HIGHEST PRIORITY):\n${customInstructions}\n🔴 END\n`
      : ''

    const productAnchor = buildProductAnchor(outputLang)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4500,
      system: GLOBAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${productAnchor}${customBlock}당신은 ${roleDesc}입니다.${langInstruction}

카테고리: ${order.category}
제목/이름: ${order.product_name}
내용: ${cleanDescription}
${dataContext}
${culturalContext ? `\n=== CULTURAL MARKET CONTEXT ===\n${culturalContext}\n=== END ===\n` : ''}${platformGuide ? `\n${platformGuide}` : ''}
${sectionGuide}

반드시 지켜야 할 품질 기준:
1. 각 섹션 본문 220자 이상 — 짧고 강한 문단과 긴 문단을 교차해서 리듬감 형성
2. 각 섹션 제목은 서로 완전히 다른 스타일 (의문형, 선언형, 수사적 역설, 숫자 강조, 감성 호소 혼합)
3. 카테고리·제품에 맞는 전문 용어 + 감각적 언어 사용
4. 첫 번째 섹션: 예상치 못한 앵글로 시작 — "여러분은 ~불편함이 있으신가요?" 같은 뻔한 시작 절대 금지
5. 마지막 섹션: 감정적 트리거 + 명확한 행동 유도 (긴박감, 독점성, 감성 연결 중 택일)
6. 전체 섹션 본문 합계 1500자 이상
7. 인간 작가처럼 자연스럽고 유기적인 흐름 — 섹션 간 패턴 반복 금지
${docRules}

⚠️ SEO + 인간화 동시 달성:
- 제품명 핵심 키워드를 3개 이상 섹션에 자연스럽게 (억지로 끼워 넣지 말 것)
- 수치는 최소 3개 섹션에서 문장 속에 자연스럽게 (제목에 강제 삽입 금지)
- 섹션 제목 6개가 모두 달라야 함 — 같은 구조 2개 이상 금지
- 마지막 섹션에 구체적 행동 유도 + 감정적 클로징

JSON만 출력 (마크다운 없이, 앞뒤 텍스트 없이):
{
  "sections": [
    { "id": 1, "name": "섹션명", "title": "제목", "body": "본문 200자 이상", "bg_color": "#FFFFFF" },
    { "id": 2, "name": "섹션명", "title": "제목", "body": "본문 200자 이상", "bg_color": "#F8F9FA" },
    { "id": 3, "name": "섹션명", "title": "제목", "body": "본문 200자 이상", "bg_color": "#FFFFFF" },
    { "id": 4, "name": "섹션명", "title": "제목", "body": "본문 200자 이상", "bg_color": "#F0F7FF" },
    { "id": 5, "name": "섹션명", "title": "제목", "body": "본문 200자 이상", "bg_color": "#FFFFFF" },
    { "id": 6, "name": "섹션명", "title": "제목", "body": "본문 200자 이상", "bg_color": "#FFF8E7" }
  ]
}`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('AI 응답 형식 오류')

    const text = content.text.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[generate] JSON not found:', text.slice(0, 500))
      throw new Error('AI 응답 JSON 파싱 실패')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const result = {
      sections: parsed.sections,
      output_lang: outputLang,
    }

    await supabase
      .from('orders')
      .update({ status: 'done', result_json: result })
      .eq('id', orderId)

    return NextResponse.json({ success: true, result })

  } catch (err: unknown) {
    console.error('Generate error:', err)
    if (orderId) {
      try {
        const supabase = createAdminClient()
        await supabase.from('orders').update({ status: 'error' }).eq('id', orderId)
      } catch { /* ignore */ }
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 생성 실패' },
      { status: 500 }
    )
  }
}

// ── 양식 텍스트 답변 → sections 배열 변환 ─────────────────────────────────
function parseTemplateTextToSections(
  text: string,
  bgColors: string[],
): { id: number; name: string; title: string; body: string; bg_color: string }[] {
  const sections: { id: number; name: string; title: string; body: string; bg_color: string }[] = []

  // [항목 제목] 패턴으로 분할
  const blockPattern = /\[([^\]]+)\]\s*([\s\S]*?)(?=\[[^\]]+\]|$)/g
  let match: RegExpExecArray | null
  let id = 1

  while ((match = blockPattern.exec(text)) !== null) {
    const title = match[1].trim()
    const body = match[2].trim()
    if (!title || !body) continue
    sections.push({
      id,
      name: title,
      title,
      body,
      bg_color: bgColors[(id - 1) % bgColors.length],
    })
    id++
  }

  // [항목] 패턴이 없으면 빈 줄로 단락 분리
  if (sections.length === 0) {
    const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    paragraphs.forEach((para, i) => {
      const lines = para.split('\n')
      const title = lines[0].replace(/^#+\s*/, '').trim() || `항목 ${i + 1}`
      const body = lines.slice(1).join('\n').trim() || para
      sections.push({
        id: i + 1,
        name: title,
        title,
        body: body || title,
        bg_color: bgColors[i % bgColors.length],
      })
    })
  }

  return sections
}
