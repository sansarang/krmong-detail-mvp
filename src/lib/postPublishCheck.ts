import type { UiLang } from '@/lib/uiLocale'

export type ComplianceSeverity = 'high' | 'medium'

export interface ComplianceFinding {
  severity: ComplianceSeverity
  /** Short excerpt of what matched (for display) */
  matched: string
  tip: string
}

type Rule = { match: (text: string) => string | null; severity: ComplianceSeverity; tip: string }

function dedupeByTip(findings: ComplianceFinding[]): ComplianceFinding[] {
  const seen = new Set<string>()
  return findings.filter(f => {
    const k = `${f.severity}:${f.tip}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const KO_RULES: Rule[] = [
  {
    match: t => t.match(/완치|치료(?!사|법|학)|질병을\s*고치|의약품이\s*아닌데\s*치료|각종\s*질병/i)?.[0] ?? null,
    severity: 'high',
    tip: '질병 치료·완치 표현은 의약품 아닌 일반상품 광고에서 금지에 가깝습니다. 체감·후기 중심으로 바꾸세요.',
  },
  {
    match: t => t.match(/100%\s*효과|무조건\s*효과|반드시\s*효과|완벽한\s*해결|틀림없이|절대\s*효과/i)?.[0] ?? null,
    severity: 'high',
    tip: '효과를 단정·보장하는 표현은 공정위 과징금 사례가 많습니다. “도움될 수 있어요” 등으로 완화하세요.',
  },
  {
    match: t => t.match(/세계\s*1위|업계\s*1위|전\s*세계\s*1위|국내\s*1위/i)?.[0] ?? null,
    severity: 'medium',
    tip: '“1위” 등 최상급 표시는 객관적 근거·출처 표기 없으면 부당표시에 해당할 수 있습니다.',
  },
  {
    match: t => t.match(/업계\s*최고|역대\s*최고|최고\s*경지|유일무이|독보적|압도적\s*1위|최상의\s*효과/i)?.[0] ?? null,
    severity: 'medium',
    tip: '과장 광고로 볼 수 있는 최상급 표현입니다. 비교 대상·기간·근거를 넣거나 순화하세요.',
  },
  {
    match: t => t.match(/의료진\s*추천|의사\s*추천|병원\s*사용|임상시험\s*완료(?!\s*자료)/i)?.[0] ?? null,
    severity: 'high',
    tip: '의료인·임상 표현은 심의·근거 없이 쓰기 어렵습니다. 삭제하거나 공식 자료가 있을 때만 검토하세요.',
  },
]

const EN_RULES: Rule[] = [
  {
    match: t => t.match(/\bcures\b|\btreats\s+(your\s+)?(disease|acne|eczema|diabetes|cancer)\b|\bFDA[\s-]approved\b(?!\s+for)/i)?.[0] ?? null,
    severity: 'high',
    tip: 'Disease treatment or “FDA approved” claims need strict substantiation. Rephrase as personal experience or general wellness.',
  },
  {
    match: t => t.match(/\b100%\s+effective\b|\bguaranteed\s+results\b|\bmiracle\b|\bclinically\s+proven\b(?!\s*\()/i)?.[0] ?? null,
    severity: 'high',
    tip: 'Absolute or “miracle” claims often violate ad rules. Soften with “may help” or “many users report…”.',
  },
  {
    match: t => t.match(/\b#1\s+in\s+the\s+world\b|\bbest\s+ever\b|\bonly\s+product\s+you\b/i)?.[0] ?? null,
    severity: 'medium',
    tip: 'Superlatives usually need proof. Add qualifiers, time frame, or survey source.',
  },
]

const JA_RULES: Rule[] = [
  {
    match: t => t.match(/完治|治る|病気が治|医薬品以外.*治療|100%\s*効果|絶対\s*効く|必ず\s*効果/i)?.[0] ?? null,
    severity: 'high',
    tip: '疾病の治療・効果保証に見える表現は景品表示法・薬機法のリスクがあります。体験談や「〜しやすくする」に弱めてください。',
  },
  {
    match: t => t.match(/世界一|国内一|最高(?!の品質を目指)|No\.1(?!\s*※)/i)?.[0] ?? null,
    severity: 'medium',
    tip: '最上級表示は根拠・条件の明示がないと優良誤認になりやすいです。',
  },
]

const ZH_RULES: Rule[] = [
  {
    match: t => t.match(/包治|根治|治愈|疗效\s*100%|绝对\s*有效|肯定\s*治好|神药/i)?.[0] ?? null,
    severity: 'high',
    tip: '疾病治疗或绝对疗效表述在广告法中风险很高，建议改为体验描述或“可能有助于…”。',
  },
  {
    match: t => t.match(/全球第一|行业第一|史上最强|唯一(?!\s*指定)/i)?.[0] ?? null,
    severity: 'medium',
    tip: '顶级用语通常需要数据来源支撑，否则可能构成虚假宣传。',
  },
]

function runRules(text: string, rules: Rule[]): ComplianceFinding[] {
  const out: ComplianceFinding[] = []
  for (const r of rules) {
    const m = r.match(text)
    if (m) out.push({ severity: r.severity, matched: m.slice(0, 48), tip: r.tip })
  }
  return dedupeByTip(out)
}

export function flattenContentForScan(
  productName: string,
  category: string,
  sections: { title: string; body: string }[],
): string {
  const parts = [productName, category, ...sections.flatMap(s => [s.title, s.body])]
  return parts.join('\n')
}

export function scanPostPublishCompliance(text: string, lang: UiLang): ComplianceFinding[] {
  const rules =
    lang === 'ko' ? KO_RULES : lang === 'ja' ? JA_RULES : lang === 'zh' ? ZH_RULES : EN_RULES
  return runRules(text, rules)
}
