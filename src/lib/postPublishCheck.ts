import type { UiLang } from '@/lib/uiLocale'

export type ComplianceSeverity = 'high' | 'medium'

/** P4: 업종별 추가 규칙 묶음 */
export type IndustryBucket = 'general' | 'health' | 'beauty' | 'food' | 'finance' | 'medical'

export function detectIndustryBucket(category: string, productName: string): IndustryBucket {
  const s = `${category} ${productName}`.toLowerCase()
  if (
    /투자|펀드|etf|주식|채권|대출|이자|수익률|리스크\s*없|원금\s*보장|투자\s*확정|100%\s*수익|부동산\s*투자\s*확정|investment\s+advice|mutual\s+fund|forex|guaranteed\s+return|high\s+yield\s+investment/i.test(
      s,
    )
  ) {
    return 'finance'
  }
  if (
    /의료|병원|진단|처방|약물|의사\s*소견|치료\s*방법|수술|임상|medical\s+advice|diagnosis|prescription|drug\s+treatment/i.test(
      s,
    )
  ) {
    return 'medical'
  }
  if (
    /건강|영양|다이어트|보조제|비타민|프로바이오|오메가|혈당|콜레스테롤|血圧|サプリ|健康|保健|营养|维生素|supplement|vitamin|probiotic|omega|glucose|cholesterol/i.test(
      s,
    )
  ) {
    return 'health'
  }
  if (
    /화장|스킨|로션|클렌징|코스메|뷰티|미백|여드름|기미|주름|cosmetic|skincare|美容|护肤|化粧|美白|ニキビ|シワ/i.test(
      s,
    )
  ) {
    return 'beauty'
  }
  if (
    /식품|간식|커피|차|음료|건강식|푸드|food|snack|beverage|食品|零食|饮料|咖啡/i.test(s)
  ) {
    return 'food'
  }
  return 'general'
}

export interface ComplianceFinding {
  severity: ComplianceSeverity
  /** Short excerpt of what matched (for display) */
  matched: string
  tip: string
  /** 참고용 완화 문안 (법률 검토 아님) */
  suggest?: string
}

type Rule = {
  match: (text: string) => string | null
  severity: ComplianceSeverity
  tip: string
  suggest?: string
}

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
    suggest: '개인적으로는 증상 완화에 도움이 될 수 있었어요(체험 기준, 개인차 있음).',
  },
  {
    match: t => t.match(/100%\s*효과|무조건\s*효과|반드시\s*효과|완벽한\s*해결|틀림없이|절대\s*효과/i)?.[0] ?? null,
    severity: 'high',
    tip: '효과를 단정·보장하는 표현은 공정위 과징금 사례가 많습니다. “도움될 수 있어요” 등으로 완화하세요.',
    suggest: '사용 환경에 따라 체감이 다를 수 있었고, 저에게는 이런 점이 도움이 되었어요.',
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
    suggest: 'In my routine it felt supportive for comfort—not a substitute for medical care.',
  },
  {
    match: t => t.match(/\b100%\s+effective\b|\bguaranteed\s+results\b|\bmiracle\b|\bclinically\s+proven\b(?!\s*\()/i)?.[0] ?? null,
    severity: 'high',
    tip: 'Absolute or “miracle” claims often violate ad rules. Soften with “may help” or “many users report…”.',
    suggest: 'Results may vary; here’s what I noticed after a few weeks of use.',
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

const KO_HEALTH_EXTRA: Rule[] = [
  {
    match: t => t.match(/혈당.*(낮추|정상|치료)|콜레스테롤.*(낮추|치료)|고혈압.*치료|암\s*예방|암을\s*막|면역력\s*극대화|질병\s*예방에\s*효과/i)?.[0] ?? null,
    severity: 'high',
    tip: '건강기능식품·일반식품은 질병의 치료·예방 효과를 표시할 수 없습니다. “일상 관리 보조” 등으로 순화하세요.',
  },
]

const KO_BEAUTY_EXTRA: Rule[] = [
  {
    match: t => t.match(/기미\s*완전\s*제거|여드름\s*치료|미백\s*효과\s*보장|각질\s*완치|주름\s*완전\s*제거|흉터\s*완치/i)?.[0] ?? null,
    severity: 'high',
    tip: '화장품은 의약품이 아니므로 치료·완치·의약적 효능 표현은 화장품법상 문제가 될 수 있습니다.',
  },
]

const KO_FOOD_EXTRA: Rule[] = [
  {
    match: t => t.match(/암\s*예방|항암|면역\s*치료|약\s*대신|질병을\s*고침/i)?.[0] ?? null,
    severity: 'high',
    tip: '식품은 질병 치료·예방·의약품 대체를 암시하면 표시광고법 위반 소지가 큽니다.',
  },
]

const EN_HEALTH_EXTRA: Rule[] = [
  {
    match: t => t.match(/\b(prevents?|cures?|treats?)\s+(cancer|diabetes|heart disease)\b|\bclinically\s+proven\s+to\s+(heal|cure)\b/i)?.[0] ?? null,
    severity: 'high',
    tip: 'Supplements/foods cannot claim to treat or prevent disease. Use “may support wellness” framing.',
  },
]

const EN_BEAUTY_EXTRA: Rule[] = [
  {
    match: t => t.match(/\bcures?\s+acne\b|\bremoves?\s+wrinkles\s+completely\b|\bguaranteed\s+whitening\b/i)?.[0] ?? null,
    severity: 'high',
    tip: 'Cosmetics cannot claim drug-like curing or guaranteed therapeutic outcomes.',
  },
]

const EN_FOOD_EXTRA: Rule[] = [
  {
    match: t => t.match(/\bcures?\s+disease\b|\bprevents?\s+cancer\b|\binstead\s+of\s+medicine\b/i)?.[0] ?? null,
    severity: 'high',
    tip: 'Food products must not imply disease treatment or drug substitution.',
  },
]

const JA_HEALTH_EXTRA: Rule[] = [
  {
    match: t => t.match(/糖尿病を治す|癌を防ぐ|免疫を治療|病気を治す効果/i)?.[0] ?? null,
    severity: 'high',
    tip: '健康食品・食品で疾病の治療・予防効果を謳うのはリスクが高いです。体験・生活習慣の補助に留めてください。',
  },
]

const JA_BEAUTY_EXTRA: Rule[] = [
  {
    match: t => t.match(/シミ完全除去|ニキビ治療保証|シワ完全消失/i)?.[0] ?? null,
    severity: 'high',
    tip: '化粧品は医薬品的な治癒・保証表現を避けてください。',
  },
]

const ZH_HEALTH_EXTRA: Rule[] = [
  {
    match: t => t.match(/治疗糖尿病|预防癌症|代替药物|治愈疾病/i)?.[0] ?? null,
    severity: 'high',
    tip: '普通食品/保健品不宜宣称治疗、预防疾病或替代药品。',
  },
]

const ZH_BEAUTY_EXTRA: Rule[] = [
  {
    match: t => t.match(/保证祛斑|痤疮治疗保证|皱纹完全消除/i)?.[0] ?? null,
    severity: 'high',
    tip: '化妆品不得宣称医疗级治愈或保证疗效。',
  },
]

const KO_FINANCE_EXTRA: Rule[] = [
  {
    match: t => t.match(/원금\s*100%\s*보장|무조건\s*수익|확정\s*수익|손해\s*없는\s*투자|절대\s*안\s*깨짐|월\s*\d+%\s*고정/i)?.[0] ?? null,
    severity: 'high',
    tip: '금융·투자 광고는 수익 보장·원금 보장 표현이 엄격히 제한됩니다. 과거 실적은 미래 수익을 보장하지 않는다는 식의 고지가 필요할 수 있어요.',
    suggest: '과거 데이터는 참고용이며, 투자 결과는 시장 상황에 따라 달라질 수 있습니다.',
  },
]

const KO_MEDICAL_EXTRA: Rule[] = [
  {
    match: t => t.match(/진단|처방|약\s*복용|수술\s*필요|의학적\s*효과\s*보장|병원\s*대신/i)?.[0] ?? null,
    severity: 'high',
    tip: '의료 행위·진단·치료를 대체한다는 뉘앙스는 의료법·광고 규제 리스크가 큽니다. 일반 정보·경험 공유로 한정하세요.',
    suggest: '개인 경험을 공유하는 목적이며, 증상이 지속되면 전문의 상담을 권장합니다.',
  },
]

const EN_FINANCE_EXTRA: Rule[] = [
  {
    match: t =>
      t.match(
        /\bguaranteed\s+returns?\b|\bno\s+risk\b.*\binvest|\bprincipal\s+protected\b.*\b(yield|return)\b|\b\d+%\s+per\s+month\s+guaranteed\b/i,
      )?.[0] ?? null,
    severity: 'high',
    tip: 'Investment promotions usually cannot promise returns or imply zero risk. Disclosures and licensing rules apply.',
    suggest: 'Past performance does not guarantee future results; consider your own risk tolerance.',
  },
]

const EN_MEDICAL_EXTRA: Rule[] = [
  {
    match: t =>
      t.match(
        /\breplaces?\s+your\s+doctor\b|\bdiagnos(e|is)\s+your\b|\bprescrib(e|ing)\b.*\bwithout\b|\bmedical\s+treatment\b.*\bguaranteed\b/i,
      )?.[0] ?? null,
    severity: 'high',
    tip: 'Avoid implying medical diagnosis, prescription, or guaranteed therapeutic outcomes outside licensed professional care.',
    suggest: 'For education only; seek a qualified clinician for personal medical decisions.',
  },
]

function bucketExtraRules(lang: UiLang, bucket: IndustryBucket): Rule[] {
  if (bucket === 'general') return []
  if (lang === 'ko') {
    if (bucket === 'health') return KO_HEALTH_EXTRA
    if (bucket === 'beauty') return KO_BEAUTY_EXTRA
    if (bucket === 'food') return KO_FOOD_EXTRA
    if (bucket === 'finance') return KO_FINANCE_EXTRA
    if (bucket === 'medical') return KO_MEDICAL_EXTRA
    return []
  }
  if (lang === 'ja') {
    if (bucket === 'health') return JA_HEALTH_EXTRA
    if (bucket === 'beauty') return JA_BEAUTY_EXTRA
    if (bucket === 'finance') return EN_FINANCE_EXTRA
    if (bucket === 'medical') return EN_MEDICAL_EXTRA
    return []
  }
  if (lang === 'zh') {
    if (bucket === 'health') return ZH_HEALTH_EXTRA
    if (bucket === 'beauty') return ZH_BEAUTY_EXTRA
    if (bucket === 'finance') return EN_FINANCE_EXTRA
    if (bucket === 'medical') return EN_MEDICAL_EXTRA
    return []
  }
  if (bucket === 'health') return EN_HEALTH_EXTRA
  if (bucket === 'beauty') return EN_BEAUTY_EXTRA
  if (bucket === 'food') return EN_FOOD_EXTRA
  if (bucket === 'finance') return EN_FINANCE_EXTRA
  if (bucket === 'medical') return EN_MEDICAL_EXTRA
  return []
}

function runRules(text: string, rules: Rule[]): ComplianceFinding[] {
  const out: ComplianceFinding[] = []
  for (const r of rules) {
    const m = r.match(text)
    if (m) out.push({ severity: r.severity, matched: m.slice(0, 48), tip: r.tip, suggest: r.suggest })
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

export function scanPostPublishCompliance(
  text: string,
  lang: UiLang,
  industry: IndustryBucket = 'general',
): ComplianceFinding[] {
  const base =
    lang === 'ko' ? KO_RULES : lang === 'ja' ? JA_RULES : lang === 'zh' ? ZH_RULES : EN_RULES
  const extra = bucketExtraRules(lang, industry)
  return runRules(text, [...base, ...extra])
}
