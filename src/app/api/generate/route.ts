import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { buildDataContextBlock } from '@/lib/marketIntelCopy'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const FREE_LIMIT = 5

export async function POST(req: NextRequest) {
  let orderId: string | undefined
  try {
    const body = await req.json()
    orderId = body.orderId
    const { outputLang = 'ko' } = body as { outputLang?: string }
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

      // profiles 테이블에서 플랜 확인 (없으면 free로 간주)
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      const plan = profile?.plan ?? 'free'

      if (plan === 'free' && monthlyCount > FREE_LIMIT) {
        return NextResponse.json(
          { error: 'LIMIT_EXCEEDED', message: `무료 플랜은 월 ${FREE_LIMIT}회까지 생성할 수 있어요.` },
          { status: 402 }
        )
      }
    }
    // ─────────────────────────────────────────────────────────────

    // 상태 업데이트
    await supabase.from('orders').update({ status: 'generating' }).eq('id', orderId)

    // ── 양식 자동 작성 모드 감지 ──────────────────────────────
    const templateMatch = (order.description ?? '').match(/\[TEMPLATE_FORM\]([\s\S]*?)\[\/TEMPLATE_FORM\]/)
    if (templateMatch) {
      const templateContent = templateMatch[1].trim()
      const userInfo = (order.description ?? '').replace(/\[TEMPLATE_FORM\][\s\S]*?\[\/TEMPLATE_FORM\]/, '').trim()

      const LANG_NAMES_T: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' }
      const langInstructionT = outputLang !== 'ko'
        ? ` All answers must be written in ${LANG_NAMES_T[outputLang] ?? outputLang}.`
        : ''

      // ── 1단계: 양식을 분석해 항목 목록을 텍스트로 추출 ─────────
      const analyzeMsg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: '당신은 문서 양식 분석 전문가입니다. 주어진 양식에서 작성해야 할 모든 항목/질문을 파악하고, 각 항목에 구체적인 답변을 작성합니다.',
        messages: [
          {
            role: 'user',
            content: `아래 양식의 각 항목/질문에 답변을 작성해주세요.${langInstructionT}

문서 제목: ${order.product_name}
${userInfo ? `\n참고 정보 (답변 작성 시 활용):\n${userInfo}` : ''}

=== 양식 내용 ===
${templateContent}
=== 양식 끝 ===

위 양식의 각 항목을 순서대로 아래 형식으로 답변해주세요:
[항목1 제목]
(답변 내용 - 최소 2문장 이상, 구체적으로)

[항목2 제목]
(답변 내용 - 최소 2문장 이상, 구체적으로)

...

규칙:
- 양식의 모든 빈칸/항목에 답변
- 참고 정보를 최대한 반영
- 공식적이고 전문적인 문체
- 항목이 명확하지 않으면 논리적으로 섹션을 구성`,
          },
        ],
      })

      const analyzeContent = analyzeMsg.content[0]
      if (analyzeContent.type !== 'text') throw new Error('AI 응답 형식 오류')
      const filledText = analyzeContent.text.trim()

      // ── 2단계: 텍스트 답변을 JSON sections로 변환 ──────────────
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
      roleDesc = '대한민국 최고의 마케팅 카피라이터이자 SEO 전문가'
      sectionGuide = `
[제품 상세페이지 — 6개 섹션 구성]
1. 후킹 헤드라인: 의문형으로 고객 문제 제기
2. 문제 공감: 구매 전 고민·불편함 공감
3. 제품 소개: 핵심 가치와 차별점 (수치 포함)
4. 핵심 특징: 3~5가지 특징 (✓ 기호, 숫자 포함)
5. 사용 방법/추천 대상: 단계별 안내 또는 이런 분께 추천
6. 구매 유도 CTA: 지금 바로 구매·시작 유도`
    }

    const docRules = isDocType ? `
추가 문서 작성 규칙:
- 공식적이고 명확한 문체 사용 (비격식체 금지)
- 주요 수치·통계·날짜는 반드시 포함 (입력 정보 기반)
- 목적·대상·기대효과를 각 섹션에서 구체적으로 명시
- 전문 용어 적절히 활용 (과제명, 기관명 등)` : `
추가 카피라이팅 규칙:
- 섹션 제목 3개 이상에 구체적 숫자 포함
- 최소 1개 섹션 제목은 의문형
- 제품/서비스명 키워드를 최소 3개 섹션 제목에 자연스럽게 포함
- 마지막 섹션에 행동 유도 키워드 2개 이상 ("지금", "바로", "무료", "상담", "예약", "구매")`

    const LANG_NAMES: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語 (Japanese)', zh: '中文 (Chinese)' }
    const langInstruction = outputLang !== 'ko'
      ? `\n⚠️ IMPORTANT: Write ALL output content (title, body, section names) entirely in ${LANG_NAMES[outputLang] ?? outputLang}. Do NOT use Korean anywhere.`
      : ''

    // ── 데이터 기반 카피 컨텍스트 (7번 기능) ──────────────────
    const dataContext = !isDocType
      ? buildDataContextBlock(
          outputLang as 'ko' | 'en' | 'ja' | 'zh',
          order.product_name,
          order.category,
          order.description ?? '',
        )
      : ''
    // ──────────────────────────────────────────────────────────

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `당신은 ${roleDesc}입니다.
아래 카테고리와 정보를 분석하여, 업종에 맞는 고품질 문서를 작성해주세요.${langInstruction}

카테고리: ${order.category}
제목/이름: ${order.product_name}
내용: ${order.description}
${dataContext}
${sectionGuide}

반드시 지켜야 할 규칙:
1. 각 섹션 본문 150자 이상 (구체적 정보, 설득력 있는 문장)
2. 제목 길이 15~40자
3. 카테고리 업종에 맞는 전문 용어 사용
${docRules}

⚠️ SEO 100점 필수 조건 (아래 7가지 모두 충족할 것):
[1] 키워드 밀도: "${order.product_name.slice(0, 4)}" 또는 제품명 키워드를 3개 이상의 섹션 제목에 자연스럽게 포함
[2] 충분한 본문량: 6개 섹션 본문 합계 900자 이상
[3] 제목 길이: 모든 섹션 제목 15~40자 유지
[4] 숫자 활용: 최소 3개 이상의 섹션 제목에 숫자(%, 회, 개, mg, ml, 배, 원, 일, 명, 단계 등) 포함
[5] 의문형 제목: 최소 1개 섹션 제목에 "?" 또는 "인가요", "나요", "까요", "세요" 포함
[6] CTA 강화: 마지막(6번) 섹션 본문에 "지금", "바로", "구매", "시작", "할인", "무료" 중 2개 이상 포함
[7] 섹션별 분량: 모든 섹션 본문 각 100자 이상

JSON만 출력 (다른 텍스트 없이):

{
  "sections": [
    { "id": 1, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFFFFF" },
    { "id": 2, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#F8F9FA" },
    { "id": 3, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFFFFF" },
    { "id": 4, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#F0F7FF" },
    { "id": 5, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFFFFF" },
    { "id": 6, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFF8E7" }
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
