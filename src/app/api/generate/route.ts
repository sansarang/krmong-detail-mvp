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

      // ── 토큰 안전망: 대용량 콘텐츠 스마트 압축 ────────────────────
      // Korean ≈ 1 char/token, English ≈ 4 chars/token
      // Budget: 200,000 - system(~500) - overhead(~1500) - output(~3500) = ~194,500 tokens
      // Conservative safe limit: 24,000 chars (leaves plenty of room)
      const TOKEN_SAFE_CHARS = 24000

      function smartTruncateContent(content: string, docType: string): string {
        if (content.length <= TOKEN_SAFE_CHARS) return content

        const originalLen = content.length
        const truncNote = `\n\n[⚠️ 원본 ${originalLen.toLocaleString()}자 → AI 처리 한도 초과로 핵심 구조 추출 (${TOKEN_SAFE_CHARS.toLocaleString()}자). 모든 주요 항목 포함됨.]`

        // For Excel/inspection: already has structured header + sample from parse-file
        // Just take the most important first portion
        if (docType === 'excel' || docType === 'inspection_report') {
          // Extract all header/column info lines first (they're most important)
          const lines  = content.split('\n')
          const headerLines: string[] = []
          const dataLines:   string[] = []

          lines.forEach(l => {
            const lTrim = l.trim()
            if (
              lTrim.startsWith('[') ||
              lTrim.startsWith('총 데이터') ||
              lTrim.startsWith('컬럼:') ||
              lTrim.startsWith('수치 통계') ||
              lTrim.startsWith('--- ') ||
              lTrim.startsWith('... (중간')
            ) {
              headerLines.push(l)
            } else {
              dataLines.push(l)
            }
          })

          // Take all header lines + as many data lines as fit
          const headerText  = headerLines.join('\n')
          const remaining   = TOKEN_SAFE_CHARS - headerText.length - truncNote.length - 200
          const dataText    = dataLines.join('\n').slice(0, Math.max(remaining, 0))
          return (headerText + '\n' + dataText).trim() + truncNote
        }

        // For questionnaires/exams: try to keep complete questions (don't cut mid-question)
        if (docType === 'questionnaire' || docType === 'exam') {
          const questionBlocks = content.split(/\n(?=\d+[\.\)]\s)/) // split at "1. " or "1) "
          let result = ''
          for (const block of questionBlocks) {
            if ((result + block).length > TOKEN_SAFE_CHARS - truncNote.length) break
            result += block + '\n'
          }
          if (result.length < 500) {
            // fallback: just truncate
            result = content.slice(0, TOKEN_SAFE_CHARS - truncNote.length)
          }
          return result.trim() + truncNote
        }

        // Default: first 75% + last 10% of safe limit for context continuity
        const firstPart = Math.floor(TOKEN_SAFE_CHARS * 0.75)
        const lastPart  = Math.floor(TOKEN_SAFE_CHARS * 0.10)
        return (
          content.slice(0, firstPart) +
          '\n\n[...]\n\n' +
          content.slice(-(lastPart)) +
          truncNote
        )
      }

      // 문서 유형 자동 감지 (XLSX, 질문지, 보고서 등)
      const detectDocumentType = (title: string, content: string, hint: string) => {
        const text = (title + ' ' + content + ' ' + hint).toLowerCase()
        if (/\[file_type:\s*excel_spreadsheet/i.test(content)) return 'excel'
        if (/\[file_type:\s*question_sheet/i.test(content)) return 'questionnaire'
        if (/\[문서 유형:.*질문지|questionnaire|survey|설문/i.test(hint)) return 'questionnaire'
        if (/\[문서 유형:.*시험지|exam|quiz|test/i.test(hint)) return 'exam'
        if (/\[문서 유형:.*사업계획서|business plan/i.test(hint)) return 'business_plan'
        if (/\[문서 유형:.*ir|피칭|pitch deck/i.test(hint)) return 'ir_pitch'
        if (/\[문서 유형:.*보고서|report/i.test(hint)) return 'report'
        if (/\[문서 유형:.*제안서|proposal/i.test(hint)) return 'proposal'
        if (text.includes('defect') || text.includes('grade') || text.includes('countermeasure') || text.includes('inspection') || text.includes('점검')) return 'inspection_report'
        if (text.includes('area_number') || text.includes('location') || text.includes('points')) return 'inspection_report'
        return 'general'
      }

      const docType = detectDocumentType(order.product_name ?? '', templateContent, userInfo)

      const getDocTypeInstructions = (type: string, lang: string) => {
        const isKo = lang === 'ko'
        switch (type) {
          case 'excel':
            return isKo
              ? `이 문서는 엑셀 스프레드시트 데이터입니다. 각 행/열의 데이터를 분석하여 아래 형식으로 완전한 전문 보고서를 작성하세요:
1. 각 항목(컬럼)을 독립적인 섹션으로 처리
2. raw 데이터를 그대로 나열하지 말고, 데이터를 해석하여 자연스러운 문장으로 설명
3. 수치 데이터는 분석·요약하여 전문적으로 서술
4. 표 형식 데이터는 bullet points나 요약 문단으로 변환`
              : `This is Excel spreadsheet data. Analyze each row/column and write a complete professional document:
1. Treat each column as an independent section
2. Do NOT list raw data — interpret and explain in natural professional sentences
3. Summarize numerical data analytically
4. Convert tabular data into clear bullet points or summary paragraphs`

          case 'inspection_report':
            return isKo
              ? `이 문서는 점검/검사 보고서입니다. 각 검사 항목(AREA, LOCATION, DEFECTS, GRADE, POINTS 등)을 분석하여:
1. 전체 검사 결과 요약 (총평)
2. 각 구역별 상세 분석 (발견된 결함, 등급, 점수)
3. 심각도 평가 및 우선순위
4. 구체적인 개선 조치(COUNTERMEASURE) 권고 사항
5. 결론 및 다음 단계
형식으로 전문 점검 보고서를 작성하세요. 숫자 데이터는 통계로 정리하세요.`
              : `This is an inspection/quality report. Analyze each inspection item (AREA, LOCATION, DEFECTS, GRADE, POINTS, COUNTERMEASURE etc.) and write:
1. Executive Summary of total inspection results
2. Detailed analysis per area (defects found, grade, score)
3. Severity assessment and priority ranking
4. Specific countermeasure recommendations
5. Conclusion and next steps
Present numerical data as statistics. Write as a formal professional inspection report.`

          case 'questionnaire':
            return isKo
              ? `이 문서는 질문지/설문지입니다. 각 질문에 완전하고 전문적인 답변을 제공하세요:
1. 각 질문 번호와 질문 내용을 유지하면서 답변 작성
2. 주관식: 3-5문장으로 구체적이고 전문적으로 답변
3. 객관식: 답을 선택하고 이유를 설명
4. 서술형: 논리적 구조로 상세히 작성`
              : `This is a questionnaire/survey. Provide complete professional answers:
1. Maintain each question number and content while writing answers
2. Open questions: 3-5 sentences, specific and professional
3. Multiple choice: select answer and explain reasoning
4. Essay questions: write in logical structure with detail`

          case 'exam':
            return isKo
              ? `이 문서는 시험지/테스트입니다. 각 문항에 정확하고 완전한 답변을 제공하세요:
1. 문항 번호와 유형(객관식/주관식/서술형)을 정확히 인식
2. 객관식: 정답과 간략한 해설
3. 주관식: 핵심 포인트를 포함한 모범 답안
4. 서술형: 논리적이고 체계적인 답안 작성`
              : `This is an exam/test. Provide accurate and complete answers:
1. Identify question number and type (multiple choice/short answer/essay)
2. Multiple choice: correct answer with brief explanation
3. Short answer: model answer with key points
4. Essay: logical and systematic answer`

          default:
            return isKo
              ? `이 문서의 모든 항목과 빈칸을 전문가 수준으로 작성하세요. 각 섹션에 충분한 내용(최소 3-5문장)을 포함하고, 구체적인 수치와 사례를 활용하세요.`
              : `Complete all fields and blanks at expert level. Include sufficient content (minimum 3-5 sentences per section) with specific numbers and examples.`
        }
      }

      const TEMPLATE_SYSTEM = `You are an elite document completion specialist — the world's best at analyzing forms, spreadsheets, questionnaires, and templates, then producing polished, professional, human-readable documents.

CRITICAL RULES:
1. NEVER output raw JSON, raw data dumps, or machine-readable formats
2. ALWAYS write in natural, professional language that humans can read directly
3. NEVER copy-paste raw table data or spreadsheet rows without interpretation
4. Transform ALL structured/tabular data into readable professional prose, bullet points, or summaries
5. Every section must read like it was written by a domain expert, not a data entry tool
6. COMPLETENESS: Fill EVERY blank, field, and section — never skip
7. OUTPUT FORMAT: Plain text with [Section Name] headers followed by natural prose — NOT JSON`

      // Excel 등 raw data에서 FILE_TYPE 힌트 제거 + 토큰 안전 압축 (buildTemplatePrompt 밖에 정의)
      const cleanTemplate = smartTruncateContent(
        templateContent
          .replace(/\[FILE_TYPE:[^\]]*\]/gi, '')
          .replace(/\[TRANSLATION_MODE:[^\]]*\]/gi, '')
          .trim(),
        docType
      )

      const buildTemplatePrompt = (lang: string) => {
        const langInst = lang !== 'ko'
          ? ` CRITICAL: Write ALL output entirely in ${LANG_NAMES_T[lang] ?? lang}. Translate section names too.`
          : ''
        const docTitle = order.product_name || '문서'
        const customBlock = customInstructions
          ? `\n🔴 CUSTOM INSTRUCTIONS (HIGHEST PRIORITY — override all defaults):\n${customInstructions}\n🔴 END\n`
          : ''
        const typeInstructions = getDocTypeInstructions(docType, lang)

        return `${customBlock}

=== DOCUMENT TASK ===
Document Title: ${docTitle}
Document Type: ${docType}
Output Language: ${LANG_NAMES_T[lang] ?? lang}${langInst}

${typeInstructions}

${userInfo ? `=== REFERENCE INFORMATION (USE THIS AS PRIMARY SOURCE — DO NOT CONTRADICT) ===\n${userInfo}\n=== END REFERENCE ===\n` : ''}

=== ORIGINAL FORM / DATA TO PROCESS ===
${cleanTemplate}
=== END OF ORIGINAL ===

=== OUTPUT INSTRUCTIONS ===
Write a complete, professional document based on the above form/data.
- Use [Section Title] to mark each section
- Under each section, write natural professional prose (NOT raw data, NOT JSON)
- Each section body: minimum 3 sentences, maximum 1 paragraph or bullet list
- For Excel/spreadsheet data: summarize and interpret each data column/category
- For inspection reports: create executive summary → detailed findings → recommendations
- For questionnaires: answer each question naturally and professionally
- Final section: always include a "결론 및 권고사항" (Conclusion & Recommendations) or equivalent
- Tone: professional, clear, authoritative

⚠️ FORBIDDEN: raw JSON output, raw table dumps, "undefined", empty sections, "{}" or "[]" characters
✅ REQUIRED: natural flowing prose, professional vocabulary, complete sentences`
      }

      // 다중 언어 동시 생성
      // 안전한 API 호출 래퍼 — prompt_too_long 에러 시 자동 재시도
      async function safeTemplateCall(lang: string, attempt = 0): Promise<string> {
        try {
          const msg = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 3000,
            system: TEMPLATE_SYSTEM,
            messages: [{ role: 'user', content: buildTemplatePrompt(lang) }],
          })
          const c = msg.content[0]
          if (c.type !== 'text') throw new Error(`${lang} 응답 오류`)
          return c.text.trim()
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err)
          // Claude returns 400 with "prompt is too long" — retry with halved content
          if ((errMsg.includes('prompt is too long') || errMsg.includes('too_long') || errMsg.includes('400')) && attempt < 2) {
            console.warn(`[template] ${lang} token limit hit (attempt ${attempt + 1}), retrying with reduced content`)
            const reduction = attempt === 0 ? 0.5 : 0.25 // 50% then 25% of safe limit
            const reducedLen = Math.floor(TOKEN_SAFE_CHARS * reduction)
            // Re-truncate more aggressively by modifying templateContent variable
            const aggressiveTrunc = templateContent.slice(0, reducedLen) +
              `\n\n[⚠️ 토큰 한도로 ${reducedLen.toLocaleString()}자로 축소됨]`
            // Temporarily override for this call
            const shortPrompt = buildTemplatePrompt(lang).replace(
              cleanTemplate,
              aggressiveTrunc.replace(/\[FILE_TYPE:[^\]]*\]/gi, '').trim()
            )
            const msg2 = await anthropic.messages.create({
              model: 'claude-sonnet-4-5',
              max_tokens: 3000,
              system: TEMPLATE_SYSTEM,
              messages: [{ role: 'user', content: shortPrompt }],
            })
            const c2 = msg2.content[0]
            if (c2.type !== 'text') throw new Error(`${lang} 재시도 응답 오류`)
            return c2.text.trim()
          }
          throw err
        }
      }

      if (isMultiLangT) {
        const langResults = await Promise.all(
          targetLangs.map(async (lang) => {
            const text = await safeTemplateCall(lang)
            const BG_COLORS = ['#FFFFFF', '#F8F9FA', '#F0F7FF', '#FFF8E7', '#F0FFF4', '#FFF0F5']
            const sections = parseTemplateTextToSections(text, BG_COLORS)
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
      const filledText = await safeTemplateCall(outputLang)

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

    // ── 참고 URL 재작성 모드 감지 ──────────────────────────────────────
    const refUrlMatch      = (order.description ?? '').match(/\[REF_URL:([^\]]+)\]/)
    const refTitleMatch    = (order.description ?? '').match(/\[REF_TITLE:([^\]]+)\]/)
    const refStructMatch   = (order.description ?? '').match(/\[REF_STRUCTURE:([^\]]+)\]/)
    const refKeywordsMatch = (order.description ?? '').match(/\[REF_KEYWORDS:([^\]]+)\]/)
    const refSummaryMatch  = (order.description ?? '').match(/\[REF_SUMMARY:([^\]]+)\]/)

    const refUrl       = refUrlMatch?.[1]?.trim() ?? null
    const refTitle     = refTitleMatch?.[1]?.trim() ?? null
    const refStructure = refStructMatch?.[1]?.trim() ?? null
    const refKeywords  = refKeywordsMatch?.[1]?.trim() ?? null
    const refSummary   = refSummaryMatch?.[1]?.trim() ?? null

    const cleanDescription = (order.description ?? '')
      .replace(/\[MARKETS:[^\]]+\]/g, '')
      .replace(/\[CROSSBORDER:[^\]]+\]/g, '')
      .replace(/\[REF_URL:[^\]]+\]/g, '')
      .replace(/\[REF_TITLE:[^\]]+\]/g, '')
      .replace(/\[REF_STRUCTURE:[^\]]+\]/g, '')
      .replace(/\[REF_KEYWORDS:[^\]]+\]/g, '')
      .replace(/\[REF_SUMMARY:[^\]]+\]/g, '')
      .trim()

    // 참고 URL 재작성 컨텍스트 블록
    const buildRefUrlBlock = () => {
      if (!refUrl) return ''
      const lines = [
        `╔══════════════════════════════════════════════════════════╗`,
        `║  🔁 REFERENCE URL REWRITE MODE — ACTIVE                 ║`,
        `╚══════════════════════════════════════════════════════════╝`,
        ``,
        `The user provided a reference article/blog URL to use as inspiration.`,
        `CRITICAL RULES FOR THIS MODE:`,
        `1. DO NOT copy, quote, or reproduce any text from the original`,
        `2. ANALYZE the structure, flow, and persuasion techniques of the reference`,
        `3. CREATE a completely original, new piece using the product info provided`,
        `4. MATCH OR EXCEED the quality of the reference article`,
        `5. Use the reference's keyword strategy and section flow as a guide`,
        `6. The output must pass plagiarism checks — 100% new content`,
        ``,
        `Reference URL: ${refUrl}`,
        refTitle     ? `Reference Title: ${refTitle}` : '',
        refStructure ? `Reference Section Structure: ${refStructure}` : '',
        refKeywords  ? `Reference Keywords: ${refKeywords}` : '',
        refSummary   ? `Reference Summary: ${refSummary}` : '',
        ``,
        `→ Study the reference's structure and write a BETTER version using the product info below.`,
        `→ Mirror the section flow where relevant, but with completely new sentences.`,
        `→ Include a note in the output: [REF_REWRITE:${refUrl}]`,
      ].filter(s => s !== null && s !== undefined && (s as string).length >= 0)
       .join('\n')
      return lines
    }

    // ── 마켓별 특화 섹션 가이드 오버라이드 ───────────────────
    const MARKET_SECTION_GUIDES: Record<string, string> = {
      smartstore: `
[🏪 스마트스토어 — 네이버 쇼핑 SEO + 모바일 세로형 상세페이지]

⚠️ 스마트스토어 필수 원칙:
• 네이버 쇼핑 검색 노출: 제품명 핵심 키워드를 섹션 1~2에 자연스럽게 2~3회 삽입
• 모바일 최적화: 문단당 3~4줄 이내, 긴 줄바꿈 대신 짧고 임팩트 있게
• [IMAGE_N] 마커를 섹션 2, 3, 4에 배치 — 네이버 쇼핑 이미지 슬라이드 구조
• 소제목은 감성+숫자 조합, 검색 키워드 자연 포함 (6개 모두 다른 스타일)
• 뻔한 "~하시나요?" "~고민되시나요?" 패턴 절대 금지

1. 오프닝 훅: 모바일 첫 화면에서 즉시 스크롤 멈추게 하는 강렬한 선언 또는 숫자 (15자 내외)
2. 브랜드 스토리 & 차별점: 감성적 배경 + 왜 이 제품인가 스토리로 풀기 [IMAGE_1]
3. 핵심 성분·소재·기능: ✓ 체크형 4~5가지 (각 항목 구체적 수치 필수, 네이버 키워드 자연 삽입) [IMAGE_2]
4. 실구매 후기 & 신뢰 신호: "N명 선택", 수상이력, 언론 보도, 미디어 언급 구체화 [IMAGE_3]
5. 사용법 & 추천 대상: 단계별 + "이런 분께 딱" (공감 언어, SEO 롱테일 키워드 포함)
6. 구매 유도 CTA: 한정수량·오늘만특가·무료배송·즉시구매 — 감정적 긴박감 + 재고 수량 암시`,

      naver_blog: `
[📝 네이버 블로그 — 검색 최상위 노출 리뷰형 롱폼]

⚠️ 네이버 블로그 핵심 원칙 (절대 준수):
• 소제목(H2/H3) 최소화 — 전체 6섹션 중 2개 이하로만 소제목 사용
• 소제목 없이 자연스러운 문단 전환 — 독자가 소제목을 의식하지 못하게
• 네이버 검색 SEO: 제품 핵심 키워드를 첫 단락에 자연스럽게 1~2회, 글 중간에 2~3회
• 1인칭 경험 서술 권장: "저는~", "솔직히~", "처음엔~", "써보니~"
• [IMAGE_N] 마커를 글 흐름상 자연스러운 위치에 삽입 (억지 삽입 금지)
• 광고성 문구·과도한 줄바꿈 지양 — 독자가 끝까지 읽고 싶은 흐름 최우선

1. 도입부: 제품을 처음 접하게 된 개인적 상황 또는 공감되는 일상에서 시작 (소제목 없이) [IMAGE_1]
2. 첫인상 & 언박싱: 배송, 패키지 디테일, 첫 번째 느낌 — 실감나게 묘사 (소제목 있거나 없거나) [IMAGE_2]
3. 실제 사용 경험 (가장 긴 섹션): 솔직한 사용기, 체감 효과, 예상과 달랐던 점, 며칠 사용 후 변화 [IMAGE_3]
4. 성분·스펙·기술 분석: 전문적이지만 독자 눈높이 언어로 — 어려운 용어는 쉽게 풀어서
5. 비교 & 추천 대상: 다른 제품과 비교, "이런 분들께 강추" — 자연스럽게 이어지는 흐름
6. 마무리 총평: 솔직한 별점 이유 + 구매처 안내 (광고처럼 느껴지지 않게)`,

      coupang: `
[🛒 쿠팡 — 스펙 직결형 + 로켓배송 신뢰 상세페이지]

⚠️ 쿠팡 작성 원칙:
• 스펙·수치 중심 — 모호한 표현 절대 없이 구체적 숫자로만
• 신뢰도 요소 전면 배치 (로켓배송, 무료반품, 실구매 후기 수)
• 쿠팡 검색 알고리즘: 제품명 키워드 + 카테고리 키워드를 섹션 1~2에 자연 포함
• bullet points 적극 활용 — 모바일에서 빠르게 스캔되는 구조

1. 핵심 요약 (3줄): 제품의 핵심 가치 3가지를 번호 목록으로 — 가격 경쟁력 포함
2. 상세 스펙: 크기·무게·소재·성능·인증번호 (수치 중심, 표 형식 권장)
3. 주요 특징 5가지: ✓ 체크리스트 형식 + 각 항목 구체적 수치 + 경쟁 제품 대비 우위
4. 사용법 & 주의사항: 단계별 사용법 + 보관법 + 안전 주의문
5. A/S·교환·반품 정책: 로켓배송 여부 + 무료반품 조건 + AS 보증 기간 + 고객센터
6. 쿠팡에서 사야 하는 이유: 최저가 보장 + 로켓배송 속도 + 실구매 후기 수 + 쿠팡캐시 혜택`,

      elevenst: `
[1️⃣ 11번가 — 할인·쿠폰 중심 전환율 최적화 상세페이지]

⚠️ 11번가 작성 원칙:
• 가격 경쟁력과 쿠폰·할인 혜택을 전면에 배치
• SK페이, 할인쿠폰, 포인트 적립 등 11번가 전용 혜택 강조
• 직관적 스펙 + 빠른 구매 결정 유도

1. 가격 경쟁력 훅: "최대 N% 할인" + "쿠폰 적용 시 N원" — 즉시 눈에 띄는 혜택 선언
2. 제품 핵심 특징: 3~4가지 핵심 기능·혜택 (✓ 체크형, 각 수치 포함)
3. 상세 스펙: 크기·무게·소재·인증 등 구체적 수치 중심
4. 11번가 전용 혜택: SK페이 할인 + 쿠폰 + 포인트 적립 + 무료배송 조건
5. 사용법 & 추천 대상: 누구에게 어떤 상황에서 딱 맞는지 구체적으로
6. 구매 유도 CTA: 오늘 안에 사야 하는 이유 + 재고 소진 임박 + 빠른 배송 강조`,

      amazon: `
[🛍️ Amazon JP A+ Content — Benefit-first premium SEO format]

⚠️ Amazon A+ 필수 원칙:
• BULLET POINTS가 핵심 — 각 bullet은 CAPITALIZED KEYWORD로 시작 (Amazon algorithm SEO)
• 모든 주장은 수치로 증명 (%, 숫자, 인증, 리뷰 수)
• 일본어 작성 시 敬語 철저, 영어 작성 시 passive voice 전면 금지
• Amazon JP SEO: 상품 title에 핵심 검색어 포함 (80자 이내), 섹션 1~2에 자연 키워드 포함
• 신뢰 지수: 리뷰 수, 평점, 인증, 보증 기간을 구체적 수치로

1. HOOK HEADLINE: One bold, specific, quantified benefit claim (e.g. "Cuts drying time by 40% — proven by 12,000 buyers")
2. PRIMARY BENEFIT — [CAPITALIZED KEYWORD]: Deep-dive on main value — mechanism + proof + before/after result
3. QUALITY ASSURANCE — [CAPITALIZED KEYWORD]: Materials/certifications/manufacturing standards with specific specs
4. VERSATILITY — [CAPITALIZED KEYWORD]: Who uses it, when, how, with real-world use case examples
5. SOCIAL PROOF: "★4.8 from 12,000+ verified buyers" + certifications + guarantee + FBA/Prime eligibility
6. PURCHASE CONFIDENCE + CTA: 30-day money-back + stock urgency + bundle options + secure checkout`,

      rakuten: `
[🎏 楽天市場 — 丁寧語・品質・季節感・ポイント戦略詳細ページ]

⚠️ 楽天 執筆原則:
• 丁寧語・敬語を徹底 — 誠実で礼儀正しいトーン (タメ口・若者言葉は絶対NG)
• 楽天SEO: 商品名＋用途＋特徴キーワードを自然に組み合わせ (楽天内検索最適化)
• 品質・職人技・こだわりを具体的数値で表現 (「0.1mm精密加工」等)
• 季節感必須: 「乾燥が気になる季節に」「大切な方へのギフトに最適」
• ポイント還元・送料無料・楽天スーパーセール情報を必ず言及

1. キャッチコピー: 楽天ランキング実績 or 品質と価格の両立 (数値・実績を具体的に)
2. 商品の特長: ✓リスト4〜5項目 (各項目に数値データ + 丁寧語で)
3. 品質・素材・製造へのこだわり: 職人技・検査工程・素材の由来を人間的に語る
4. 使い方・季節別シーン提案: 季節感 + 贈り物シーン + 用途別場面描写 [IMAGE_1]
5. お客様の声と実績: 購入者の具体的なエピソード + 累計販売数 + 楽天レビュー評価
6. 楽天購入特典 & CTA: ポイント還元率 + 送料無料条件 + スーパーセール情報 + 今すぐご注文`,

      tmall: `
[🏮 天猫A+详情页 — 爆款三角公式 × 社交证明 × 场景化]

⚠️ 天猫 写作原则:
• 标题5字以内高冲击力 — 直接打动心理，不啰嗦
• 社交证明必须有具体数据: "已售XX万件" "XX位达人推荐" "好评率99.8%"
• 场景化描述: 让读者代入自己的日常生活
• 天猫SEO: 热搜关键词自然融入标题和卖点描述
• 正品保障 + 7天无理由必须出现

1. 主图爆款文案: 5字以内冲击力标题 + 核心卖点一句话 (如"轻奢必备·全网爆款100万+")
2. 品牌背书与品质故事: 品牌历史·正品背书·原材料/工艺细节 (用讲故事方式，不说教)
3. 三大核心卖点: 每卖点配场景描述 + 数据证明 + 实拍图说明 [IMAGE_1][IMAGE_2][IMAGE_3]
4. 社交证明爆炸: "已售XX万件" + KOL/达人种草截图 + 微博/小红书话题 + 买家真实反馈精选
5. 使用场景化: 通勤·约会·送礼·自用·出差场景 — 让读者看到自己的生活
6. 促销CTA: 限时秒杀价 + 满减活动规则 + 正品保障 + 7天无理由退换 + 顺丰包邮 + 立即抢购`,

      shopify: `
[💻 Shopify — Brand Story + Meta SEO + Lifestyle Premium]

⚠️ Shopify 작성 원칙:
• Brand Storytelling First — why this brand exists, the founder's mission, values
• Meta SEO: 첫 섹션에 primary keyword 자연 포함, meta description용 핵심 문장 포함
• 감성 + 전문성 균형 — 라이프스타일 브랜드 느낌
• CTA는 soft한 초대형으로 — "shop now"보다 "discover yours", "join N,000 customers"

1. BRAND HERO: The brand's origin story — why it was created, what problem it solves uniquely
2. THE PRODUCT STORY: How this specific item embodies the brand's philosophy (sensory + emotional)
3. WHAT'S INSIDE / HOW IT WORKS: Materials, craftsmanship, specifications (data-driven but warm)
4. STYLED FOR YOUR LIFE: Use cases, lifestyle contexts, who it's perfect for + styling suggestions
5. SOCIAL PROOF + COMMUNITY: Customer testimonials, UGC mentions, press features, review count
6. INVITE TO PURCHASE: Soft but compelling CTA — free shipping threshold, money-back, loyalty program`,

      qoo10: `
[🏬 Qoo10 — ディール中心・簡潔・価格訴求詳細ページ]

⚠️ Qoo10 執筆原則:
• 価格競争力とセール情報を最前面に — 「今だけ」「限定」「特価」
• 日本語は丁寧だが簡潔に — 長すぎる説明は避ける
• Qoo10 Mega Week・クーポン情報を積極的に言及
• 信頼感: セラー評価、配送速度、返品保証を明記

1. 特価アピール: 「本日限定N%OFF」「クーポン適用でX円」 — 価格の魅力を即座に
2. 商品ハイライト: 3〜4つの主要特徴 (✓リスト + 各数値)
3. 詳細スペック: サイズ・重量・素材・認証など具体的数値
4. Qoo10特典: Mega Week対象 + クーポン + ポイント + 送料条件
5. 使い方・対象者: 誰にどんな場面でぴったりか具体的に
6. 安心保証 & CTA: 返品保証 + セラー評価 + 在庫わずか + 今すぐ購入`,

      lazada: `
[📦 Lazada — Southeast Asia Price-Competitive Product Page]

⚠️ Lazada 작성 원칙:
• Southeast Asia (SG, MY, TH, ID, PH, VN) 다국적 소비자 타겟
• 가격 경쟁력 + 빠른 배송 + Lazada Guarantee 전면 강조
• 영어 기본, 간결하고 스캔 가능한 구조
• Flash Sale, Voucher, Coins Cashback 등 Lazada 플랫폼 혜택 언급

1. PRODUCT HIGHLIGHTS (5 bullets): Core benefits, key specs, and unique selling points — numbered list
2. WHY CHOOSE THIS: Quality differentiators vs. competitors + verified purchase count
3. DETAILED SPECIFICATIONS: Full spec table — dimensions, weight, materials, certifications
4. HOW TO USE: Step-by-step guide + tips for best results
5. LAZADA GUARANTEE: Free returns, buyer protection, official store verification + delivery speed
6. DEAL & CTA: Flash sale price + Voucher codes + Coins cashback + limited stock urgency`,

      temu: `
[🌟 Temu — Global Ultra-Value Fast-Ship Product Description]

⚠️ Temu 작성 원칙:
• 가격 경쟁력이 최우선 — "unbeatable price", "free shipping", "best deal"
• 빠른 배송 강조 — warehouse location, estimated delivery
• 간결하고 직접적 — 긴 설명보다 핵심 benefit 나열
• 트렌드 키워드 자연 포함 (viral, trending, popular)

1. VALUE HEADLINE: Price + free shipping + trending badge (e.g. "🔥 #1 Trending — 50,000+ Sold, Free Ship")
2. TOP FEATURES: 4~5 key benefits in bullet format — each with a specific number or fact
3. PRODUCT SPECS: Dimensions, materials, what's included in the package
4. WHY TEMU: Free return policy + buyer protection + authentic product guarantee
5. BEST FOR: Who needs this + use cases + gifting suitability
6. GRAB YOURS: Limited quantity signal + shipping time estimate + shop with confidence badge`,

      aliexpress: `
[🧧 AliExpress — Global Bulk & Value Shopping Description]

⚠️ AliExpress 작성 원칙:
• 글로벌 바이어 타겟 (영어 기본) — 대량 구매, 도매, 리셀러도 고려
• 상세한 스펙 + 패키지 내용물 + MOQ (minimum order quantity) 정보
• Buyer Protection, Free Return, AliExpress Standard Shipping 강조
• 진짜 리뷰와 판매량 수치 포함

1. PRODUCT OVERVIEW: Core product with key specs — weight, size, material, color options
2. KEY FEATURES (5 bullets): Main benefits with specific data — each bullet one clear advantage
3. PACKAGE CONTENTS: Exactly what's included, quantities, accessories
4. QUALITY CERTIFICATIONS: CE/FCC/RoHS certifications, quality control process, factory info
5. SHIPPING & PROTECTION: AliExpress Standard Shipping ETA + tracking + buyer protection
6. ORDER NOW + BULK PRICING: Quantity discounts + wholesale price tiers + secure payment`,

      shein: `
[👗 SHEIN — Fast Fashion Trend-Driven Product Description]

⚠️ SHEIN 작성 원칙:
• 트렌드와 패션 감각이 핵심 — "on-trend", "style inspo", "OOTD"
• 젊은 감각의 짧고 임팩트 있는 문장 (Z세대 타겟)
• 컬러·핏·소재·스타일링 팁 중심
• Social proof: 리뷰 수, "New Arrival", "Sold Out Fast" 배지

1. STYLE HOOK: Trend badge + aesthetic vibe description (e.g. "Y2K vibes / cottagecore / clean girl aesthetic")
2. THE FIT & FABRIC: Exact measurements, material feel, size guide advice, stretch/structure
3. STYLE IT WITH: 3 outfit combinations + occasion suggestions + accessory pairings
4. DETAILS: Specific product details — closures, pockets, lining, care instructions
5. CUSTOMER STYLE INSPO: Review highlights + customer photo mentions + star rating
6. ADD TO CART: Restock urgency + size selling fast + "complete the look" cross-sell hint`,
    }

    // 선택된 마켓이 있으면 sectionGuide를 마켓별로 오버라이드
    const primaryMarket = selectedMarkets.find((m: string) => MARKET_SECTION_GUIDES[m])
    if (primaryMarket && !isDocType) {
      sectionGuide = MARKET_SECTION_GUIDES[primaryMarket]
      // 복수 마켓 선택 시 보조 마켓 힌트 추가
      const secondaryMarkets = selectedMarkets.filter((m: string) => m !== primaryMarket && MARKET_SECTION_GUIDES[m])
      if (secondaryMarkets.length > 0) {
        sectionGuide += `\n\n[추가 최적화 마켓: ${secondaryMarkets.join(', ')} — 해당 플랫폼 규칙도 가능한 한 반영]`
      }
    }

    // ── CVR 예측 데이터 (마켓 × 카테고리 기반) ────────────────
    const CVR_BASE: Record<string, number> = {
      smartstore: 4.2, naver_blog: 3.8, coupang: 3.5, elevenst: 3.1,
      amazon: 5.3, rakuten: 4.7, tmall: 6.9, shopify: 4.5,
      qoo10: 4.2, lazada: 3.9, temu: 4.1, aliexpress: 3.7, shein: 4.6,
    }
    const CVR_CAT_BONUS: Record<string, number> = {
      beauty: 0.8, fashion: 0.6, health: 0.5, food: 0.3,
      electronics: 0.4, sports: 0.3, living: 0.2,
    }
    const computeCvr = (market: string, cat: string) => {
      const base = CVR_BASE[market] ?? 3.5
      const bonus = CVR_CAT_BONUS[cat] ?? 0
      return +(base + bonus).toFixed(1)
    }

    const SEO_TIPS: Record<string, string> = {
      smartstore: '네이버 쇼핑 노출을 위해 상품명에 핵심 키워드를 앞쪽에 배치하고, 상품 설명 첫 단락에 2~3회 자연스럽게 반복하세요.',
      naver_blog: '네이버 검색 노출을 위해 포스트 제목에 핵심 키워드 + 경험/후기 단어를 조합하고, 본문 길이를 1500자 이상 유지하세요.',
      coupang: '쿠팡 검색 알고리즘은 제품명 완성도와 리뷰 수를 중시합니다. 상품명에 브랜드 + 제품명 + 주요 스펙을 포함하세요.',
      elevenst: '11번가 검색 최적화: 상품명에 주요 키워드 포함, 할인쿠폰·혜택을 상단에 명확히 표시하세요.',
      amazon: 'Amazon JP SEO: title에 brand + main keyword + key specs (80자 내), backend keywords 활용, 리뷰 획득 전략이 노출 순위의 핵심입니다.',
      rakuten: '楽天検索最適化: 商品名にカテゴリー＋ブランド＋用途キーワードを含め、レビュー件数と評価が検索順位に直結します。',
      tmall: '天猫搜索优化：标题前20字必须含核心搜索词，主图首图直接展示核心卖点，买家好评率和DSR评分影响搜索排名。',
      shopify: 'Shopify SEO: meta title (60자)에 primary keyword, meta description (160자)에 CTA 포함, URL slug를 영문 키워드로 설정하세요.',
      qoo10: 'Qoo10 검색 최적화: 상품명에 일본어 검색 키워드 포함, Mega Week 기간에 노출 부스팅이 크게 증가합니다.',
      lazada: 'Lazada SEO: product title에 brand + category keyword + key feature, primary image에 white background 권장.',
      temu: 'Temu visibility: 가격 경쟁력이 노출의 핵심입니다. Free shipping threshold를 충족하면 노출이 크게 올라갑니다.',
      aliexpress: 'AliExpress SEO: title에 exact-match 영어 키워드, 첫 이미지가 클릭율을 결정합니다. 리뷰 수가 노출에 직접 영향.',
      shein: 'SHEIN 노출: 트렌드 키워드와 시즌 태그를 적극 활용하고, 상품 이미지 퀄리티와 스타일링이 클릭율을 결정합니다.',
    }

    // ── 타겟 마켓 문화 로컬라이징 ────────────────────────────
    const CULTURAL_CONTEXT: Record<string, string> = {
      ko: `[🇰🇷 한국 내수 시장 — 스마트스토어 / 쿠팡 / 네이버 최적화]
TONE: 감성적 스토리텔링 + 구체적 신뢰 구축 + 구매 심리 자극
SEO 필수: 제품 핵심 키워드를 첫 섹션에 자연스럽게 2~3회, 이후 섹션에도 자연스럽게 분산
- 고객의 핵심 고민에 먼저 공감 → "이 제품이 정확한 해결책"임을 스토리로 연결
- 신뢰 요소 필수: 누적 판매량 수치, 언론보도/수상내역, 실구매자 후기 (구체적 숫자)
- 구매 촉진: 한정수량·오늘만특가·무료배송+당일출고·첫구매특별혜택
- CTA: "지금 바로", "오늘 안에", "선착순 마감" — 즉각 행동 유도
- 인간적 문체: AI 특유의 "이 제품은 여러분의 삶을 바꿔드릴..." 같은 과장 금지`,
      en: `[🇺🇸🌎 Global English Market — Amazon JP A+ / Shopify Premium]
TONE: Bold benefit-first, premium lifestyle, direct & conversion-optimized
SEO: Primary keyword natural in first 150 chars + in 3+ section titles/bodies
- OPEN with specific quantified benefit (e.g. "Cuts drying time by 40% — proven by 12,000 buyers")
- Amazon A+ structure: Hook → Feature Bullets (CAPITALIZED KEYWORD start) → Social Proof → CTA
- Trust signals: "★4.8 from 12,000+ verified reviews", certifications, money-back guarantee
- Urgency: "Only 47 left", "Ships within 24 hours", "30-day money-back guarantee"
- Zero passive voice — active, direct, conversion-optimized throughout
- NO generic phrases: "high quality", "premium product", "great value" — replace with specific facts`,
      ja: `[🇯🇵 日本市場 — 楽天市場 / Amazon.co.jp / Yahoo!ショッピング最適化]
TONE: 丁寧語・敬語を徹底、誠実で礼儀正しい、品質と安心を前面に
SEO: 商品名＋用途＋カテゴリーキーワードを最初のセクションに自然に含める
- 品質・精度・職人技を具体的数値で：「0.1mmの精密加工」「20工程の品質検査」
- 季節感と贈り物シーンを必ず言及：「乾燥が気になる季節に」「大切な方へのギフトにも」
- 実績と信頼数値：「累計○万本突破」「満足度98.7%」「楽天ランキング1位獲得」
- 安心保証：「全品検品済み」「30日間返品保証」「24時間サポート」
- 人間的な文体: 過度にフォーマルすぎず、誠実なお店の人が語りかけるように`,
      zh: `[🇨🇳 中国市场 — 天猫旗舰店 / 淘宝 / 京东A+详情页]
TONE: 高端品质感 × 社交证明 × 场景化 × 限时紧迫 = 爆款公式
SEO: 天猫热搜关键词自然融入标题前20字和各卖点描述中
- 开篇必须: 5字以内冲击力标题 (如"轻奢爆款"·"全网热销"·"国货之光")
- 社交证明硬数据必须出现: "已售XX万件" "好评率99.8%" "XX位达人种草"
- 场景化: 通勤·约会·送礼·自用·出差 — 让读者在场景中看到自己
- 正品背书: "正品保障" "官方旗舰店直营" "7天无理由退换" "顺丰包邮"
- 限时促销: "限时秒杀" "今日特惠" "满减活动" — 必须出现
- 禁止: 过于生硬的翻译腔，太正式的书面语`,
    }
    const culturalContext = !isDocType ? (CULTURAL_CONTEXT[outputLang] ?? '') : ''

    // ── 플랫폼 CVR 예측 계산 ─────────────────────────────────
    const platformCvrData = primaryMarket ? {
      market: primaryMarket,
      estimated_cvr: computeCvr(primaryMarket, order.category),
      seo_tip: SEO_TIPS[primaryMarket] ?? '',
      all_markets: selectedMarkets.map((m: string) => ({
        market: m,
        cvr: computeCvr(m, order.category),
      })),
    } : null

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

    // 카테고리별 정적 "이것이 아니다" negative 힌트
    const STATIC_NEGATIVE_HINTS: Record<string, string> = {
      beauty:      '지갑/가방/신발/의류/전자기기/식품이 아님.',
      fashion:     '뷰티/전자기기/식품/가전제품이 아님.',
      electronics: '의류/식품/뷰티/가구/지갑/신발이 아님.',
      food:        '뷰티/의류/전자기기/가구가 아님.',
      living:      '뷰티/의류/전자기기가 아님.',
      health:      '식품 브랜드/의류/전자기기가 아님.',
      sports:      '뷰티/식품/가전제품이 아님.',
      saas:        '물리적 제품이 아닌 소프트웨어/디지털 서비스.',
      pet:         '인간용 제품이 아닌 반려동물 관련 제품.',
      other:       '',
    }

    // 동적 negative hint — 설명에서 키워드 분석해 반대 카테고리 명시
    function buildDynamicNegative(name: string, desc: string, category: string): string {
      const text = (name + ' ' + desc).toLowerCase()
      const negatives: string[] = []

      // 통신/전자 기기 관련 키워드 감지
      if (/통신|무선|블루투스|wireless|bluetooth|earphone|이어폰|headset|헤드셋|radio|라디오|walkie|워키|talkie|receiver|발신기|수신기|송신|speaker|스피커|microphone|마이크/.test(text)) {
        negatives.push('지갑·가방·신발·의류가 절대 아님 — 이것은 전자/통신 장치임')
      }
      // 신발 관련
      if (/신발|운동화|슬리퍼|부츠|loafer|sneaker|shoes|footwear|sole|insole|밑창/.test(text)) {
        negatives.push('지갑·가방·전자기기가 절대 아님 — 이것은 신발/풋웨어 제품임')
      }
      // 지갑/가방
      if (/지갑|wallet|purse|handbag|백|bag|파우치|pouch|clutch|클러치/.test(text)) {
        negatives.push('신발·전자기기·의류가 절대 아님 — 이것은 가방/지갑 제품임')
      }
      // 식품
      if (/식품|음료|원두|커피|tea|차|snack|과자|건강식|supplement|비타민/.test(text)) {
        negatives.push('전자기기·의류·가방이 절대 아님 — 이것은 식품/건강식품 제품임')
      }

      const staticHint = STATIC_NEGATIVE_HINTS[category] ?? ''
      const allHints = [staticHint, ...negatives].filter(Boolean)
      return allHints.join('\n⛔ ')
    }

    const dynamicNegative = buildDynamicNegative(order.product_name, cleanDescription, order.category)

    const buildProductAnchor = (lang: string) => {
      const descSnippet = cleanDescription.slice(0, 600)
      if (lang === 'ko' || lang === 'all') {
        return `
╔══════════════════════════════════════════════════════╗
║  🔒 제품 앵커 — 절대 진실 (위반 금지)                ║
╠══════════════════════════════════════════════════════╣
║  제품명 : ${order.product_name}
║  카테고리: ${order.category}
║  핵심설명: ${descSnippet}
╠══════════════════════════════════════════════════════╣
║  ⛔ 이것은 반드시 "${order.product_name}"에 관한 글이어야 한다.
${dynamicNegative ? `║  ⛔ ${dynamicNegative}` : ''}
║  ⛔ 제품명을 다른 제품이나 카테고리로 착각하지 마라.
║  ⛔ 위 제품명을 최소 3개 이상 섹션에서 반드시 언급할 것.
║  ⛔ 제품명: "${order.product_name}" — 이것이 유일한 제품명이다.
╚══════════════════════════════════════════════════════╝
`
      }
      return `
╔══════════════════════════════════════════════════════╗
║  🔒 PRODUCT ANCHOR — ABSOLUTE TRUTH (DO NOT DEVIATE) ║
╠══════════════════════════════════════════════════════╣
║  Product Name : ${order.product_name}
║  Category     : ${order.category}
║  Core Desc    : ${descSnippet}
╠══════════════════════════════════════════════════════╣
║  ⛔ You MUST write ONLY about this product: "${order.product_name}"
${dynamicNegative ? `║  ⛔ ${dynamicNegative}` : ''}
║  ⛔ DO NOT confuse with any other product or category.
║  ⛔ Mention "${order.product_name}" in at least 3 separate sections.
║  ⛔ This product name is LOCKED — do not change or generalize it.
╚══════════════════════════════════════════════════════╝
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
        const refBlock = buildRefUrlBlock()
        const anchor = buildProductAnchor(lang)
        return `${anchor}${refBlock ? '\n' + refBlock + '\n' : ''}${customBlock}You are a world-class ${langLabel[lang] ?? roleDesc}.${lInst}

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
${refUrl ? `9. REFERENCE REWRITE: Study the reference structure above. Mirror its flow quality but write 100% new original content.` : ''}
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

      const multiResult: Record<string, unknown> = {
        multi_lang: true,
        output_lang: 'all',
        ...(platformCvrData ? { platform_cvr: platformCvrData } : {}),
        ...(refUrl ? { ref_url: refUrl, ref_title: refTitle ?? undefined } : {}),
      }
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
    const refBlock = buildRefUrlBlock()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4500,
      system: GLOBAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${productAnchor}${refBlock ? '\n' + refBlock + '\n' : ''}${customBlock}당신은 ${roleDesc}입니다.${langInstruction}

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
${refUrl ? `8. 참고 URL 재작성 모드: 위 참고 글의 구조를 학습하고 완전히 새로운 원본 문장으로 재작성` : ''}
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
      ...(platformCvrData ? { platform_cvr: platformCvrData } : {}),
      ...(refUrl ? { ref_url: refUrl, ref_title: refTitle ?? undefined } : {}),
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

  // JSON 오염 감지 및 제거
  let cleanText = text
  // 만약 텍스트가 JSON처럼 보이면, 값들만 추출
  if (cleanText.trim().startsWith('{') || cleanText.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(cleanText)
      // JSON sections 배열이라면 변환
      if (Array.isArray(parsed)) {
        return parsed.map((item: Record<string,unknown>, i: number) => ({
          id: i + 1,
          name: String(item.name || item.title || item.section || `항목 ${i+1}`),
          title: String(item.title || item.name || item.section || `항목 ${i+1}`),
          body: String(item.body || item.content || item.answer || item.text || JSON.stringify(item)),
          bg_color: bgColors[i % bgColors.length],
        }))
      }
      if (typeof parsed === 'object' && parsed !== null) {
        const entries = Object.entries(parsed as Record<string, unknown>)
        return entries.map(([k, v], i) => ({
          id: i + 1,
          name: k,
          title: k,
          body: typeof v === 'string' ? v : JSON.stringify(v, null, 2),
          bg_color: bgColors[i % bgColors.length],
        }))
      }
    } catch {
      // not valid JSON — continue with text parsing
    }
  }

  // 마크다운 헤딩 (## Title) 또는 [Title] 패턴 두 가지 지원
  // 먼저 ## / # 헤딩 패턴 시도
  const headingPattern = /^#{1,3}\s+(.+)$/gm
  const headingMatches = [...cleanText.matchAll(headingPattern)]

  if (headingMatches.length >= 2) {
    headingMatches.forEach((m, i) => {
      const title = m[1].trim()
      const start = (m.index ?? 0) + m[0].length
      const end = headingMatches[i + 1]?.index ?? cleanText.length
      const body = cleanText.slice(start, end).trim()
      if (!title) return
      sections.push({
        id: i + 1,
        name: title,
        title,
        body: body || title,
        bg_color: bgColors[i % bgColors.length],
      })
    })
    if (sections.length > 0) return sections
  }

  // [항목 제목] 패턴으로 분할
  const blockPattern = /\[([^\]]+)\]\s*([\s\S]*?)(?=\[[^\]]+\]|$)/g
  let match: RegExpExecArray | null
  let id = 1

  while ((match = blockPattern.exec(cleanText)) !== null) {
    const title = match[1].trim()
    const body = match[2].trim()
    // 빈 body나 단순 FILE_TYPE 힌트 skip
    if (!title || !body || /^(FILE_TYPE|TRANSLATION_MODE|MARKETS|CROSSBORDER):/i.test(title)) continue
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
    const paragraphs = cleanText.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    paragraphs.forEach((para, i) => {
      const lines = para.split('\n')
      const firstLine = lines[0].replace(/^#+\s*/, '').trim()
      const title = firstLine.length < 80 ? firstLine : `섹션 ${i + 1}`
      const body = lines.length > 1 ? lines.slice(1).join('\n').trim() : para
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
