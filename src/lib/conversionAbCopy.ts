import type { UiLang } from '@/lib/uiLocale'

export type AbRecommendation = {
  titleIdx: 0 | 1 | 2
  openerIdx: 0 | 1 | 2
  ctaIdx: 0 | 1
  reason: string
}

/** 1차 실험 후 번갈아 시도할 조합 */
export type AbRunnerUp = {
  titleIdx: 0 | 1 | 2
  openerIdx: 0 | 1 | 2
  ctaIdx: 0 | 1
  reason: string
}

export type ConversionAbSet = {
  titles: [string, string, string]
  openers: [string, string, string]
  ctas: [string, string]
  recommendation: AbRecommendation
  runnerUp: AbRunnerUp
  /** 붙여넣기용 query string (앞에 ? 또는 & 연결) */
  utmRecommendedQuery: string
  /** 스프레드시트·노션용 실험 메모 */
  experimentSheet: string
}

type Section = { title: string; body: string }

function firstBodyLine(body: string): string {
  const line = body.split('\n').map(l => l.trim()).find(Boolean) ?? ''
  return line.slice(0, 120)
}

export function abVariantSlug(titleIdx: 0 | 1 | 2, openerIdx: 0 | 1 | 2, ctaIdx: 0 | 1): string {
  return `ab_t${titleIdx + 1}_o${openerIdx + 1}_c${ctaIdx + 1}`
}

function campaignSlug(productName: string): string {
  const s = productName
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)
  return encodeURIComponent(s || 'product')
}

function runnerUpKo(): AbRunnerUp {
  return {
    titleIdx: 2,
    openerIdx: 2,
    ctaIdx: 1,
    reason:
      '1차 이후 전환만 더 올리고 싶을 때: 질문형 제목(C)+차별 포인트 첫문장(C)+강한 CTA(B)를 추천 조합과 주간 단위로 번갈아 노출해 보세요.',
  }
}

function runnerUpJa(): AbRunnerUp {
  return {
    titleIdx: 2,
    openerIdx: 2,
    ctaIdx: 1,
    reason:
      '1回目のあとCVだけ伸ばしたい場合：質問型タイトル(C)+差別化の冒頭(C)+強めCTA(B)を、推奨セットと週替わりで試してください。',
  }
}

function runnerUpZh(): AbRunnerUp {
  return {
    titleIdx: 2,
    openerIdx: 2,
    ctaIdx: 1,
    reason:
      '首轮之后若只想拉高转化：疑问型标题(C)+差异开头(C)+强 CTA(B)，与推荐组合按周轮换曝光。',
  }
}

function runnerUpEn(): AbRunnerUp {
  return {
    titleIdx: 2,
    openerIdx: 2,
    ctaIdx: 1,
    reason:
      'After the first test, to push conversion harder: rotate title C + opener C + CTA B weekly against the recommended set.',
  }
}

function buildUtmRecommended(productName: string, rec: AbRecommendation): string {
  return `utm_source=blog&utm_medium=owned&utm_campaign=${campaignSlug(productName)}&utm_content=${abVariantSlug(rec.titleIdx, rec.openerIdx, rec.ctaIdx)}`
}

function buildExperimentSheetKo(
  productName: string,
  category: string,
  titles: [string, string, string],
  openers: [string, string, string],
  ctas: [string, string],
  rec: AbRecommendation,
  run: AbRunnerUp,
): string {
  const lines = [
    `━━ 전환 A/B 실험 시트 · ${productName} (${category}) ━━`,
    '',
    '[규칙] utm_content=ab_t{제목1~3}_o{첫문장1~3}_c{CTA1~2}  예: ab_t2_o1_c1',
    '',
    `[추천 1차] ${abVariantSlug(rec.titleIdx, rec.openerIdx, rec.ctaIdx)}`,
    `  제목: ${titles[rec.titleIdx]}`,
    `  첫문장: ${openers[rec.openerIdx]}`,
    `  CTA: ${ctas[rec.ctaIdx]}`,
    '',
    `[2차(전환 강화)] ${abVariantSlug(run.titleIdx, run.openerIdx, run.ctaIdx)}`,
    `  제목: ${titles[run.titleIdx]}`,
    `  첫문장: ${openers[run.openerIdx]}`,
    `  CTA: ${ctas[run.ctaIdx]}`,
    '',
    '[UTM 예시 — 도메인 뒤에 붙이기]',
    `  ?${buildUtmRecommended(productName, rec)}`,
    '',
    '[제목 코드]',
    ...titles.map((t, i) => `  T${i + 1} → ${t}`),
    '',
    '[첫문장 코드]',
    ...openers.map((t, i) => `  O${i + 1} → ${t}`),
    '',
    '[CTA 코드]',
    ...ctas.map((t, i) => `  C${i + 1} → ${t}`),
    '',
    '※ utm_source / utm_medium 은 실제 채널에 맞게 바꾸세요.',
  ]
  return lines.join('\n')
}

function buildExperimentSheetEn(
  productName: string,
  category: string,
  titles: [string, string, string],
  openers: [string, string, string],
  ctas: [string, string],
  rec: AbRecommendation,
  run: AbRunnerUp,
): string {
  const lines = [
    `━━ Conversion A/B sheet · ${productName} (${category}) ━━`,
    '',
    '[Rule] utm_content=ab_t{1-3}_o{1-3}_c{1-2}  e.g. ab_t2_o1_c1',
    '',
    `[1st test] ${abVariantSlug(rec.titleIdx, rec.openerIdx, rec.ctaIdx)}`,
    `  Title: ${titles[rec.titleIdx]}`,
    `  Opener: ${openers[rec.openerIdx]}`,
    `  CTA: ${ctas[rec.ctaIdx]}`,
    '',
    `[2nd (conversion push)] ${abVariantSlug(run.titleIdx, run.openerIdx, run.ctaIdx)}`,
    `  Title: ${titles[run.titleIdx]}`,
    `  Opener: ${openers[run.openerIdx]}`,
    `  CTA: ${ctas[run.ctaIdx]}`,
    '',
    '[Sample UTM — append to your landing URL]',
    `  ?${buildUtmRecommended(productName, rec)}`,
    '',
    '[Title codes]',
    ...titles.map((t, i) => `  T${i + 1} → ${t}`),
    '',
    '[Opener codes]',
    ...openers.map((t, i) => `  O${i + 1} → ${t}`),
    '',
    '[CTA codes]',
    ...ctas.map((t, i) => `  C${i + 1} → ${t}`),
    '',
    '※ Replace utm_source / utm_medium with your real channels.',
  ]
  return lines.join('\n')
}

function buildExperimentSheet(
  lang: UiLang,
  productName: string,
  category: string,
  titles: [string, string, string],
  openers: [string, string, string],
  ctas: [string, string],
  rec: AbRecommendation,
  run: AbRunnerUp,
): string {
  if (lang === 'ko') return buildExperimentSheetKo(productName, category, titles, openers, ctas, rec, run)
  return buildExperimentSheetEn(productName, category, titles, openers, ctas, rec, run)
}

function packAb(
  lang: UiLang,
  productName: string,
  category: string,
  titles: [string, string, string],
  openers: [string, string, string],
  ctas: [string, string],
  recommendation: AbRecommendation,
  runnerUp: AbRunnerUp,
): ConversionAbSet {
  return {
    titles,
    openers,
    ctas,
    recommendation,
    runnerUp,
    utmRecommendedQuery: buildUtmRecommended(productName, recommendation),
    experimentSheet: buildExperimentSheet(lang, productName, category, titles, openers, ctas, recommendation, runnerUp),
  }
}

function recommendKo(lead: string): AbRecommendation {
  const openerIdx: 0 | 1 | 2 = lead.length < 40 ? 0 : 1
  return {
    titleIdx: 1,
    openerIdx,
    ctaIdx: 0,
    reason:
      '검색 유입에는 B안(후킹)이, 신뢰 누적에는 첫 문장 ' +
      (openerIdx === 0 ? 'A(경험 서술)' : 'B(요약 결론)') +
      ' 조합이 균형이 좋습니다. CTA는 부드러운 A를 먼저 넣고 전환을 보세요.',
  }
}

function recommendJa(lead: string): AbRecommendation {
  const openerIdx: 0 | 1 | 2 = lead.length < 40 ? 0 : 1
  return {
    titleIdx: 1,
    openerIdx,
    ctaIdx: 0,
    reason:
      '検索向けはBタイトル、信頼の土台は' +
      (openerIdx === 0 ? 'A冒頭' : 'B冒頭') +
      'の組み合わせがバランス良いです。CTAはまずソフトなAから試してください。',
  }
}

function recommendZh(lead: string): AbRecommendation {
  const openerIdx: 0 | 1 | 2 = lead.length < 40 ? 0 : 1
  return {
    titleIdx: 1,
    openerIdx,
    ctaIdx: 0,
    reason:
      '搜索流量适合 B 标题；建立信任用' +
      (openerIdx === 0 ? 'A 开头' : 'B 开头') +
      '。CTA 建议先软后硬，用 A 观察转化。',
  }
}

function recommendEn(lead: string): AbRecommendation {
  const openerIdx: 0 | 1 | 2 = lead.length < 40 ? 0 : 1
  return {
    titleIdx: 1,
    openerIdx,
    ctaIdx: 0,
    reason:
      'Title B balances curiosity and keywords; opener ' +
      (openerIdx === 0 ? 'A' : 'B') +
      ' pairs well for trust. Start with the softer CTA A, then test B.',
  }
}

export function buildConversionAbCopy(
  lang: UiLang,
  productName: string,
  category: string,
  sections: Section[],
): ConversionAbSet {
  const hook = sections[0]?.title ?? productName
  const lead = firstBodyLine(sections[0]?.body ?? '')

  if (lang === 'ko') {
    const recommendation = recommendKo(lead)
    return packAb(
      lang,
      productName,
      category,
      [
        `${productName} 후기 — ${category} 기준 총정리`,
        `${hook} 솔직 리뷰 (${productName})`,
        `${category} 고민 끝? ${productName} 실사용 정리`,
      ],
      [
        lead || `${productName}을(를) ${category} 관점에서 써보며 느낀 점부터 적어볼게요.`,
        `요약부터 말하면, ${productName}은(는) ${category} 제품 중에서도 이런 사람에게 특히 잘 맞았어요.`,
        `비슷한 ${category} 제품 여러 개 써봤는데, ${productName}에서만 달랐던 포인트를 짚어볼게요.`,
      ],
      [
        `더 알아보기 · ${productName} 공식/판매처에서 조건 확인하기`,
        `지금 바로 ${category} 맞춤으로 ${productName} 비교·구매하기 →`,
      ],
      recommendation,
      runnerUpKo(),
    )
  }

  if (lang === 'ja') {
    const recommendation = recommendJa(lead)
    return packAb(
      lang,
      productName,
      category,
      [
        `${productName} レビュー — ${category}視点まとめ`,
        `${hook} 正直レビュー（${productName}）`,
        `${category}で迷っているなら：${productName} 実使用メモ`,
      ],
      [
        lead || `${productName}を${category}の観点で使ってみた感想から書きます。`,
        `先に結論：${productName}は${category}の中でも、こんな人に特に合いそうでした。`,
        `似た${category}製品をいくつか試しましたが、${productName}だけ違った点を整理します。`,
      ],
      [
        `詳しく見る · ${productName} の条件は公式・販売ページで確認`,
        `いま ${category} 向けに ${productName} を比較・購入する →`,
      ],
      recommendation,
      runnerUpJa(),
    )
  }

  if (lang === 'zh') {
    const recommendation = recommendZh(lead)
    return packAb(
      lang,
      productName,
      category,
      [
        `${productName} 测评 — 按${category}维度整理`,
        `${hook} 真实体验（${productName}）`,
        `还在纠结${category}？${productName} 使用笔记`,
      ],
      [
        lead || `从${category}角度使用 ${productName} 的感受先写在前头。`,
        `先说结论：在${category}里，${productName} 更适合这类人群。`,
        `同类${category}产品试过几款，只有 ${productName} 在这些地方不一样。`,
      ],
      [
        `了解更多 · 到官方/销售渠道核对 ${productName} 条件`,
        `现在就按${category}需求比较并购买 ${productName} →`,
      ],
      recommendation,
      runnerUpZh(),
    )
  }

  const recommendation = recommendEn(lead)
  return packAb(
    lang,
    productName,
    category,
    [
      `${productName} review — ${category} breakdown`,
      `${hook}: honest notes on ${productName}`,
      `Still comparing ${category} picks? ${productName} field test`,
    ],
    [
      lead || `Here’s what stood out using ${productName} for ${category}—starting with the first impression.`,
      `TL;DR: ${productName} fits a specific ${category} buyer profile—here’s who.`,
      `I’ve tried a few ${category} options; ${productName} differed in these concrete ways.`,
    ],
    [
      `Learn more — check ${productName} terms on the official or retailer page`,
      `Compare & buy ${productName} for your ${category} needs →`,
    ],
    recommendation,
    runnerUpEn(),
  )
}
