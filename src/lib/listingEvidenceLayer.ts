import type { UiLang } from '@/lib/uiLocale'

type Section = { name: string; title: string; body: string }

export type EvidenceRow = {
  sectionLabel: string
  rationale: string
  footnoteHint: string
  /** 제안서에 붙일 빈 출처 칸 */
  sourceSlot: string
  /** 본문에 수치가 있을 때만 채워지는 점검 문장 */
  dataNotes: string
}

export type ListingEvidencePack = {
  rows: EvidenceRow[]
  /** 섹션별 근거 + 각주 힌트 (기존) */
  copyBlock: string
  /** 경영진/표지용 2~3문장 */
  executiveSummary: string
  /** 제안서 부속 각주 초안 [1]… 형식 */
  footnoteAppendix: string
  /** 발표 3장 분량 불릿 */
  slideOutline: string
  /** 전체 패키지 (요약+슬라이드+부록+본문) */
  copyFullPackage: string
}

function hasNumericClaims(body: string): boolean {
  return (
    /\d+\s*%/.test(body) ||
    /[\d,.]+\s*원/.test(body) ||
    /\$\s*[\d,.]+/.test(body) ||
    /20\d{2}\s*년?/.test(body) ||
    /\d+\s*(mg|ml|g|kg|kcal)/i.test(body)
  )
}

function dataNotesFor(lang: UiLang, body: string): string {
  if (!hasNumericClaims(body)) return ''
  if (lang === 'ko') {
    return '→ 본문에 %·금액·연도·함량 등이 있습니다. 각 수치마다 출처(문서명·URL·집계 기준일)를 각주로 남기세요.'
  }
  if (lang === 'ja') {
    return '→ 数値・％・金額・年号等があります。各数値に出典（文書名・URL・基準日）を脚注で残してください。'
  }
  if (lang === 'zh') {
    return '→ 文中含百分比、金额、年份或含量等，请为每项补充来源（文档名、URL、统计日）。'
  }
  return '→ This section includes numbers, %, currency, dates, or units—add a footnote per figure (source, URL, as-of date).'
}

function sourceSlotLine(lang: UiLang): string {
  if (lang === 'ko') return '출처 슬롯: 공식 URL 또는 내부 문서번호 __________________'
  if (lang === 'ja') return '出典スロット: 公式URLまたは社内文書番号 __________________'
  if (lang === 'zh') return '来源占位：官方 URL 或内部文档编号 __________________'
  return 'Source slot: official URL or doc ID __________________'
}

export function buildListingEvidencePack(
  lang: UiLang,
  productName: string,
  category: string,
  sections: Section[],
): ListingEvidencePack {
  const rows: EvidenceRow[] = sections.slice(0, 10).map(s => {
    const dataNotes = dataNotesFor(lang, s.body)
    if (lang === 'ko') {
      return {
        sectionLabel: `${s.name}: ${s.title}`,
        rationale: `이 문단은 ${category} 구매자가 비교할 때 자주 보는 「${s.title}」 질문에 맞춰 ${productName}의 맥락을 설득력 있게 연결합니다.`,
        footnoteHint:
          '[출처] 스펙·가격·혜택은 판매 시점의 공식 페이지·약관을 1차 출처로 인용하세요. 리뷰 인용 시 게시일·플랫폼을 병기하세요.',
        sourceSlot: sourceSlotLine('ko'),
        dataNotes,
      }
    }
    if (lang === 'ja') {
      return {
        sectionLabel: `${s.name}: ${s.title}`,
        rationale: `この段落は${category}購入者が比較で見る「${s.title}」に沿って${productName}の文脈を説明します。`,
        footnoteHint: '[出典] 仕様・価格は販売時点の公式情報を一次ソースに。',
        sourceSlot: sourceSlotLine('ja'),
        dataNotes,
      }
    }
    if (lang === 'zh') {
      return {
        sectionLabel: `${s.name}: ${s.title}`,
        rationale: `本段对应 ${category} 买家常比的「${s.title}」，说明 ${productName} 的语境与卖点衔接。`,
        footnoteHint: '[来源] 规格与价格请以当时官方页面、条款为准。',
        sourceSlot: sourceSlotLine('zh'),
        dataNotes,
      }
    }
    return {
      sectionLabel: `${s.name}: ${s.title}`,
      rationale: `This block maps to a typical ${category} buyer question (“${s.title}”) and ties ${productName} into that decision frame.`,
      footnoteHint: '[Source] Cite official specs, pricing, and terms as of publication; attribute reviews with date and platform.',
      sourceSlot: sourceSlotLine('en'),
      dataNotes,
    }
  })

  const lead = sections[0]?.title ?? productName

  const headerKo = `근거·출처 패키지 · ${productName} (${category})
자동 생성 초안 — 대외 제출 전 수치·URL·날짜를 반드시 검증하세요.

`
  const headerEn = `Evidence & source package · ${productName} (${category})
Auto draft — verify figures, URLs, and dates before external use.

`
  const headerJa = `根拠・出典パッケージ · ${productName}（${category}）
自動下書き — 対外提出前に数値・URL・日付を確認してください。

`
  const headerZh = `依据与出处包 · ${productName}（${category}）
自动草稿 — 对外提交前请核实数字、链接与日期。

`

  const header =
    lang === 'ko' ? headerKo : lang === 'ja' ? headerJa : lang === 'zh' ? headerZh : headerEn

  const why =
    lang === 'ko' ? '왜' : lang === 'ja' ? '理由' : lang === 'zh' ? '理由' : 'Why'

  const copyBlock =
    header +
    rows
      .map(
        (r, i) =>
          `${i + 1}. ${r.sectionLabel}\n   — ${why}: ${r.rationale}\n   — ${r.footnoteHint}\n   — ${r.sourceSlot}${r.dataNotes ? `\n   ${r.dataNotes}` : ''}\n`,
      )
      .join('\n')

  const executiveSummary =
    lang === 'ko'
      ? `【경영진·표지용 한 블록】\n본 콘텐츠는 ${category} 영역에서 ${productName}에 대한 구매·도입 검토 시, 「${lead}」에서 시작해 스펙·사용 맥락·비교 포인트를 순서대로 제시하도록 설계되었습니다. 주장은 체험·공개 정보에 기반하며, 계약·의료·규제 판단은 담당 부서의 1차 자료 확인이 선행되어야 합니다.`
      : lang === 'ja'
        ? `【エグゼクティブ要約】\n${category}領域での${productName}検討向けに、「${lead}」から仕様・文脈・比較を順に提示する構成です。対外判断は必ず一次情報で確認してください。`
        : lang === 'zh'
          ? `【高管/封面摘要】\n面向 ${category} 场景下的 ${productName}，从「${lead}」起依次呈现规格、使用情境与对比点。对外决策须以一手资料为准。`
          : `【Executive blurb】\nStructured for ${category} evaluation of ${productName}, opening from “${lead}” then specs, usage context, and comparison points. Treat as non-binding narrative—confirm claims with primary sources before commitments.`

  const footnoteIntro =
    lang === 'ko'
      ? '【제안서·입찰 부속 — 각주 초안】\n아래 번호를 본문 상단/하단 각주와 맞추어 채우세요.\n'
      : lang === 'ja'
        ? '【提案書付録 — 脚注ドラフト】\n本文の脚注番号と対応させてください。\n'
        : lang === 'zh'
          ? '【投标/提案附件 — 脚注草稿】\n请与正文脚注编号对应填写。\n'
          : '【Proposal appendix — footnote draft】\nAlign numbers with in-text references.\n'

  const footnoteAppendix =
    footnoteIntro +
    rows
      .map(
        (r, i) =>
          `[${i + 1}] ${r.sectionLabel}\n    ${lang === 'ko' ? '근거' : lang === 'ja' ? '根拠' : lang === 'zh' ? '依据' : 'Basis'}: ${r.rationale}\n    URL/문헌: __________  확인일: ____\n`,
      )
      .join('\n')

  const slideOutline =
    lang === 'ko'
      ? `【발표 3슬라이드 아웃라인】
1) 한 줄 과제: ${category} 구매자가 ${productName}에서 가장 먼저 확인하는 것
2) 구조 근거: 섹션 순서가 질문 흐름(인지→비교→행동)과 어떻게 맞는지
3) 신뢰·한계: 출처 원칙, 자동 생성 포함 시 고지 문구`
      : lang === 'ja'
        ? `【3枚スライド案】
1) 課題の一行: ${category}購入者が${productName}で最初に見ること
2) 構成の根拠: セクション順と意思決定フローの対応
3) 信頼と限界: 出典方針・自動生成の注記`
        : lang === 'zh'
          ? `【3 页演示提纲】
1) 一句话议题：${category} 买家先看什么
2) 结构依据：章节顺序与决策链
3) 信任与边界：引用原则与生成内容声明`
          : `【3-slide outline】
1) One-line problem: what ${category} buyers check first for ${productName}
2) Why this order: how sections map to awareness → compare → act
3) Trust & limits: citation rules + auto-generated content disclaimer`

  const copyFullPackage = [
    executiveSummary,
    slideOutline,
    footnoteAppendix,
    copyBlock,
  ].join('\n\n────────────────\n\n')

  return {
    rows,
    copyBlock,
    executiveSummary,
    footnoteAppendix,
    slideOutline,
    copyFullPackage,
  }
}
