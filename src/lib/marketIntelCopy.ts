import type { UiLang } from '@/lib/uiLocale'

type Section = { title: string; body: string }

export type MarketIntelPack = {
  competitorPatterns: string[]
  categoryKeywords: string[]
  reviewThemes: string[]
  gapNote: string
  checklistBlock: string
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(w => w.length > 1)
    .slice(0, 40)
}

export function buildMarketIntelHeuristics(
  lang: UiLang,
  productName: string,
  category: string,
  sections: Section[],
): MarketIntelPack {
  const blob = sections.map(s => `${s.title} ${s.body}`).join(' ')
  const words = tokenize(`${category} ${productName} ${blob}`)
  const freq = new Map<string, number>()
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1)
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w)
  const categoryKeywords = [...new Set([category, productName, ...top])].slice(0, 10)

  const competitorPatterns =
    lang === 'ko'
      ? [
          `[브랜드] ${productName} ${category} 후기`,
          `${category} 추천 TOP / 비교`,
          `${productName} 장단점 솔직`,
          `2025 ${category} 인기 모델 정리`,
        ]
      : lang === 'ja'
        ? [
            `[ブランド] ${productName} ${category} レビュー`,
            `${category} おすすめ 比較`,
            `${productName} メリット デメリット`,
          ]
        : lang === 'zh'
          ? [`[品牌]${productName}${category}测评`, `${category}推荐对比`, `${productName}优缺点`]
          : [
              `[Brand] ${productName} ${category} review`,
              `Best ${category} picks compared`,
              `${productName} pros and cons (honest)`,
            ]

  const reviewThemes =
    lang === 'ko'
      ? [
          '배송·포장 불만이 리뷰에 반복되면: 상단에 “포장 상태” 한 줄을 넣을지 검토',
          '내구·AS 언급이 많으면: 보증·문의 채널을 CTA 근처에 명시',
          '향·성분 민감 댓글이 많으면: 성분/사용 주의를 불릿으로 선제 고지',
          '사이즈 혼동이 많으면: 체형/용량 비교 표를 상세 초안에 추가',
        ]
      : [
          'If reviews stress shipping damage, add a packaging note up top.',
          'If durability/support shows up often, surface warranty/contact near the CTA.',
          'If scent/ingredient sensitivity appears, add a short sensitivity disclaimer.',
          'If sizing is confusing, add a simple comparison table to the draft.',
        ]

  const gapNote =
    lang === 'ko'
      ? '실제 경쟁사 제목·리뷰 키워드는 쿠팡/스마트스토어/네이버 쇼핑 API 또는 내부 크롤 파이프라인을 연결하면 이 블록이 자동으로 채워집니다.'
      : 'Wire competitor titles + review facets from marketplace APIs or your crawl pipeline to replace these templates with live data.'

  const checklistBlock = [
    lang === 'ko' ? '━━ 데이터 각도 체크리스트 ━━' : '━━ Data-angle checklist ━━',
    '',
    lang === 'ko' ? '[경쟁 상품명 패턴]' : '[Competitor title patterns]',
    ...competitorPatterns.map(s => `- ${s}`),
    '',
    lang === 'ko' ? '[본문에서 잡힌 키워드 힌트]' : '[Keyword hints from draft]',
    categoryKeywords.join(', '),
    '',
    lang === 'ko' ? '[리뷰 불만 반영 질문]' : '[Review themes to reflect]',
    ...reviewThemes.map(s => `- ${s}`),
    '',
    gapNote,
  ].join('\n')

  return { competitorPatterns, categoryKeywords, reviewThemes, gapNote, checklistBlock }
}
