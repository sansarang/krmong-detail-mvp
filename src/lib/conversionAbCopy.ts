import type { UiLang } from '@/lib/uiLocale'

export type ConversionAbSet = {
  titles: [string, string, string]
  openers: [string, string, string]
}

type Section = { title: string; body: string }

function firstBodyLine(body: string): string {
  const line = body.split('\n').map(l => l.trim()).find(Boolean) ?? ''
  return line.slice(0, 120)
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
  }
}
