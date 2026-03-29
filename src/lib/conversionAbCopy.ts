import type { UiLang } from '@/lib/uiLocale'

export type AbRecommendation = {
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
}

type Section = { title: string; body: string }

function firstBodyLine(body: string): string {
  const line = body.split('\n').map(l => l.trim()).find(Boolean) ?? ''
  return line.slice(0, 120)
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
    return {
      titles: [
        `${productName} 후기 — ${category} 기준 총정리`,
        `${hook} 솔직 리뷰 (${productName})`,
        `${category} 고민 끝? ${productName} 실사용 정리`,
      ],
      openers: [
        lead || `${productName}을(를) ${category} 관점에서 써보며 느낀 점부터 적어볼게요.`,
        `요약부터 말하면, ${productName}은(는) ${category} 제품 중에서도 이런 사람에게 특히 잘 맞았어요.`,
        `비슷한 ${category} 제품 여러 개 써봤는데, ${productName}에서만 달랐던 포인트를 짚어볼게요.`,
      ],
      ctas: [
        `더 알아보기 · ${productName} 공식/판매처에서 조건 확인하기`,
        `지금 바로 ${category} 맞춤으로 ${productName} 비교·구매하기 →`,
      ],
      recommendation: recommendKo(lead),
    }
  }

  if (lang === 'ja') {
    return {
      titles: [
        `${productName} レビュー — ${category}視点まとめ`,
        `${hook} 正直レビュー（${productName}）`,
        `${category}で迷っているなら：${productName} 実使用メモ`,
      ],
      openers: [
        lead || `${productName}を${category}の観点で使ってみた感想から書きます。`,
        `先に結論：${productName}は${category}の中でも、こんな人に特に合いそうでした。`,
        `似た${category}製品をいくつか試しましたが、${productName}だけ違った点を整理します。`,
      ],
      ctas: [
        `詳しく見る · ${productName} の条件は公式・販売ページで確認`,
        `いま ${category} 向けに ${productName} を比較・購入する →`,
      ],
      recommendation: recommendJa(lead),
    }
  }

  if (lang === 'zh') {
    return {
      titles: [
        `${productName} 测评 — 按${category}维度整理`,
        `${hook} 真实体验（${productName}）`,
        `还在纠结${category}？${productName} 使用笔记`,
      ],
      openers: [
        lead || `从${category}角度使用 ${productName} 的感受先写在前头。`,
        `先说结论：在${category}里，${productName} 更适合这类人群。`,
        `同类${category}产品试过几款，只有 ${productName} 在这些地方不一样。`,
      ],
      ctas: [
        `了解更多 · 到官方/销售渠道核对 ${productName} 条件`,
        `现在就按${category}需求比较并购买 ${productName} →`,
      ],
      recommendation: recommendZh(lead),
    }
  }

  return {
    titles: [
      `${productName} review — ${category} breakdown`,
      `${hook}: honest notes on ${productName}`,
      `Still comparing ${category} picks? ${productName} field test`,
    ],
    openers: [
      lead || `Here’s what stood out using ${productName} for ${category}—starting with the first impression.`,
      `TL;DR: ${productName} fits a specific ${category} buyer profile—here’s who.`,
      `I’ve tried a few ${category} options; ${productName} differed in these concrete ways.`,
    ],
    ctas: [
      `Learn more — check ${productName} terms on the official or retailer page`,
      `Compare & buy ${productName} for your ${category} needs →`,
    ],
    recommendation: recommendEn(lead),
  }
}
