import type { UiLang } from '@/lib/uiLocale'

type Section = { title: string; body: string }

export type MarketIntelPack = {
  competitorPatterns: string[]
  categoryKeywords: string[]
  reviewThemes: string[]
  gapNote: string
  /** @deprecated use copyFullIntel — kept for callers that still read checklistBlock */
  checklistBlock: string
  copyFullIntel: string
  competitorsBlob: string
  keywordsBlob: string
  reviewBlob: string
  gapBlob: string
  searchQueries: string[]
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(w => w.length > 1)
    .slice(0, 40)
}

function reviewThemesForLang(lang: UiLang): string[] {
  if (lang === 'ko') {
    return [
      '배송·포장 불만이 리뷰에 반복되면: 상단에 “포장 상태” 한 줄을 넣을지 검토',
      '내구·AS 언급이 많으면: 보증·문의 채널을 CTA 근처에 명시',
      '향·성분 민감 댓글이 많으면: 성분/사용 주의를 불릿으로 선제 고지',
      '사이즈 혼동이 많으면: 체형/용량 비교 표를 상세 초안에 추가',
    ]
  }
  if (lang === 'ja') {
    return [
      '配送・梱包への不満が多い場合：冒頭に「梱包状態」の一文を入れるか検討',
      '耐久・サポート言及が多い場合：保証・問い合わせ先をCTA付近に明示',
      '香り・成分アレルギーが多い場合：注意事項を箇条書きで先に記載',
      'サイズ混乱が多い場合：体型・容量の比較表をドラフトに追加',
    ]
  }
  if (lang === 'zh') {
    return [
      '若差评常提物流/包装：考虑在文首加一句“包装说明”',
      '若常提耐用/售后：在 CTA 附近写明保修与客服渠道',
      '若常提气味/成分敏感：用要点提前做敏感提示',
      '若尺码混乱多：在初稿里加简单对比表',
    ]
  }
  return [
    'If reviews stress shipping damage, add a packaging note up top.',
    'If durability/support shows up often, surface warranty/contact near the CTA.',
    'If scent/ingredient sensitivity appears, add a short sensitivity disclaimer.',
    'If sizing is confusing, add a simple comparison table to the draft.',
  ]
}

function searchQueriesForLang(
  lang: UiLang,
  productName: string,
  category: string,
): string[] {
  if (lang === 'ko') {
    return [
      `${productName} ${category} 후기`,
      `${category} 비교 추천`,
      `${productName} 단점`,
      `네이버 쇼핑 ${category}`,
    ]
  }
  if (lang === 'ja') {
    return [
      `${productName} ${category} レビュー`,
      `${category} 比較 おすすめ`,
      `${productName} デメリット`,
      `${category} 通販`,
    ]
  }
  if (lang === 'zh') {
    return [
      `${productName} ${category} 测评`,
      `${category} 对比 推荐`,
      `${productName} 缺点`,
      `${category} 电商 评价`,
    ]
  }
  return [
    `${productName} ${category} review`,
    `best ${category} compared`,
    `${productName} pros and cons`,
    `${category} buy online reviews`,
  ]
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
          `2026 ${category} 인기 모델 정리`,
        ]
      : lang === 'ja'
        ? [
            `[ブランド] ${productName} ${category} レビュー`,
            `${category} おすすめ 比較`,
            `${productName} メリット デメリット`,
            `2026 ${category} 人気モデル`,
          ]
        : lang === 'zh'
          ? [`[品牌]${productName}${category}测评`, `${category}推荐对比`, `${productName}优缺点`, `2026${category}热门`]
          : [
              `[Brand] ${productName} ${category} review`,
              `Best ${category} picks compared`,
              `${productName} pros and cons (honest)`,
              `2026 ${category} popular picks`,
            ]

  const reviewThemes = reviewThemesForLang(lang)

  const gapNote =
    lang === 'ko'
      ? '실제 경쟁사 제목·리뷰 키워드는 쿠팡/스마트스토어/네이버 쇼핑 API 또는 내부 크롤 파이프라인을 연결하면 이 블록이 자동으로 채워집니다.'
      : lang === 'ja'
        ? '実際の競合タイトル・レビュー用語はマーケットAPIやクロールパイプラインと接続すると、このブロックを自動で埋められます。'
        : lang === 'zh'
          ? '接入电商平台 API 或内部爬虫后，可用真实竞品标题与评论词替换本模板。'
          : 'Wire competitor titles + review facets from marketplace APIs or your crawl pipeline to replace these templates with live data.'

  const hComp =
    lang === 'ko'
      ? '[경쟁 상품명 패턴]'
      : lang === 'ja'
        ? '[競合商品名パターン]'
        : lang === 'zh'
          ? '[竞品标题模式]'
          : '[Competitor title patterns]'
  const hKw =
    lang === 'ko'
      ? '[본문에서 잡힌 키워드 힌트]'
      : lang === 'ja'
        ? '[本文からのキーワードヒント]'
        : lang === 'zh'
          ? '[正文关键词提示]'
          : '[Keyword hints from draft]'
  const hRev =
    lang === 'ko'
      ? '[리뷰 불만 반영 질문]'
      : lang === 'ja'
        ? '[レビュー不満の反映ポイント]'
        : lang === 'zh'
          ? '[差评主题反思]'
          : '[Review themes to reflect]'
  const hGap =
    lang === 'ko'
      ? '[연동·자동화 메모]'
      : lang === 'ja'
        ? '[連携・自動化メモ]'
        : lang === 'zh'
          ? '[接入与自动化说明]'
          : '[Automation note]'
  const hSearch =
    lang === 'ko'
      ? '[검색 쿼리 샘플 — 복붙 후 검색]'
      : lang === 'ja'
        ? '[検索クエリ例 — コピーして検索]'
        : lang === 'zh'
          ? '[搜索词样例 — 复制后搜索]'
          : '[Sample search queries — paste into search]'

  const competitorsBlob = [hComp, ...competitorPatterns.map(s => `- ${s}`)].join('\n')
  const keywordsBlob = [hKw, categoryKeywords.join(' · ')].join('\n')
  const reviewBlob = [hRev, ...reviewThemes.map(s => `- ${s}`)].join('\n')
  const gapBlob = [hGap, gapNote].join('\n')

  const searchQueries = searchQueriesForLang(lang, productName, category)
  const searchBlob = [hSearch, ...searchQueries.map((q, i) => `${i + 1}. ${q}`)].join('\n')

  const titleLine =
    lang === 'ko'
      ? '━━ 시장·리뷰 인텔 패키지 ━━'
      : lang === 'ja'
        ? '━━ 市場・レビューリサーチパック ━━'
        : lang === 'zh'
          ? '━━ 市场·评论情报包 ━━'
          : '━━ Market & review intel pack ━━'

  const copyFullIntel = [titleLine, '', competitorsBlob, '', keywordsBlob, '', reviewBlob, '', gapBlob, '', searchBlob].join(
    '\n',
  )

  const checklistBlock = copyFullIntel

  return {
    competitorPatterns,
    categoryKeywords,
    reviewThemes,
    gapNote,
    checklistBlock,
    copyFullIntel,
    competitorsBlob,
    keywordsBlob,
    reviewBlob,
    gapBlob,
    searchQueries,
  }
}
