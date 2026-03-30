import type { UiLang } from '@/lib/uiLocale'

type Section = { title: string; body: string }

/**
 * 생성 API 프롬프트에 주입할 "데이터 각도" 컨텍스트 블록을 반환합니다.
 * 실제 크롤 데이터가 없는 지금은 제품명·카테고리·사용자 설명에서
 * 추출한 키워드 + 카테고리별 리뷰 패턴을 사용합니다.
 */
export function buildDataContextBlock(
  lang: UiLang,
  productName: string,
  category: string,
  description: string,
): string {
  // ── 키워드 추출 ──────────────────────────────────────────────
  const words = tokenize(`${category} ${productName} ${description}`)
  const freq = new Map<string, number>()
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1)
  const topKeywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w)
  const keywords = [...new Set([productName, category, ...topKeywords])].slice(0, 10)

  // ── 카테고리별 구매 결정 키워드 ──────────────────────────────
  const decisionKeywords = categoryDecisionKeywords(category, lang)

  // ── 리뷰 불만 패턴 → 선제 해소 지침 ────────────────────────
  const reviewGuides = reviewGuidelinesForPrompt(category, lang)

  // ── 경쟁 제목에서 공통으로 쓰이는 어필 패턴 ─────────────────
  const competitorAngles = competitorAppealAngles(category, productName, lang)

  if (lang === 'ko') {
    return `
━━ 데이터 기반 카피 가이드 (아래 내용을 카피에 반영할 것) ━━

[카테고리 핵심 키워드 — 제목·본문에 자연스럽게 녹일 것]
${keywords.join(', ')}

[구매 결정을 유발하는 표현 — 최소 2개 이상 실제 문장에 포함]
${decisionKeywords.map(k => `· ${k}`).join('\n')}

[경쟁 상품이 공통으로 어필하는 포인트 — 차별화하거나 더 강하게 써라]
${competitorAngles.map(a => `· ${a}`).join('\n')}

[리뷰에서 자주 나온 불만 → 카피에서 선제적으로 해소할 것]
${reviewGuides.map(r => `· ${r}`).join('\n')}
━━ 가이드 끝. 위 내용이 카피 전체에 자연스럽게 녹아들도록 작성하세요. ━━`
  }

  if (lang === 'ja') {
    return `
━━ データ駆動コピーガイド（以下の内容をコピーに反映すること） ━━

[カテゴリキーワード — タイトル・本文に自然に組み込む]
${keywords.join('、')}

[購買決定を促す表現 — 最低2つを実際の文章に含める]
${decisionKeywords.map(k => `· ${k}`).join('\n')}

[競合が共通でアピールするポイント — 差別化するか強く書く]
${competitorAngles.map(a => `· ${a}`).join('\n')}

[レビューに多い不満 → コピーで先取り解消する]
${reviewGuides.map(r => `· ${r}`).join('\n')}
━━ ガイド終わり。上記の内容がコピー全体に自然に溶け込むよう執筆してください。 ━━`
  }

  if (lang === 'zh') {
    return `
━━ 数据驱动文案指南（将以下内容融入文案） ━━

[类目核心关键词 — 自然融入标题与正文]
${keywords.join('、')}

[促进购买决策的表达 — 至少用2个在实际句子中]
${decisionKeywords.map(k => `· ${k}`).join('\n')}

[竞品普遍主打的卖点 — 差异化或写得更有力]
${competitorAngles.map(a => `· ${a}`).join('\n')}

[评论常见痛点 → 在文案中提前化解]
${reviewGuides.map(r => `· ${r}`).join('\n')}
━━ 指南结束。请确保以上内容自然融入整体文案。 ━━`
  }

  // en (default)
  return `
━━ Data-informed copy guide (reflect all of the below in the copy) ━━

[Category keywords — weave naturally into titles and body text]
${keywords.join(', ')}

[Purchase-decision triggers — include at least 2 in actual sentences]
${decisionKeywords.map(k => `· ${k}`).join('\n')}

[Common competitor appeal angles — differentiate or write stronger]
${competitorAngles.map(a => `· ${a}`).join('\n')}

[Common review pain points → proactively address in copy]
${reviewGuides.map(r => `· ${r}`).join('\n')}
━━ End of guide. Ensure the above is naturally woven throughout the copy. ━━`
}

// ── 헬퍼: 카테고리별 구매 결정 키워드 ──────────────────────────────

function categoryDecisionKeywords(category: string, lang: UiLang): string[] {
  const cat = category.toLowerCase()

  if (lang === 'ko') {
    if (/뷰티|스킨케어|화장품|cosmetic|beauty|skin/.test(cat))
      return ['피부 트러블 없는', '임상 테스트 완료', '성분표 공개', '지속력', '자연 유래']
    if (/건강|영양|supplement|health|비타민|프로바이오틱/.test(cat))
      return ['임상 논문 기반', '국내 제조', '무첨가', '흡수율', 'HACCP 인증']
    if (/식품|음식|food|간식|snack/.test(cat))
      return ['원산지 공개', '무방부제', '실제 맛 후기', '소분 포장', '유통기한 여유']
    if (/패션|의류|옷|fashion|clothes/.test(cat))
      return ['실측 사이즈', '소재 상세', '세탁 방법', '체형별 추천', '코디 예시']
    if (/전자|가전|tech|electronic|IT/.test(cat))
      return ['A/S 기간', '호환 기기', '실사용 배터리', '발열 수준', '수리 이력 공개']
    if (/가구|인테리어|furniture|interior/.test(cat))
      return ['실물 색감', '조립 난이도', '무게 하중', '배송·조립 포함 여부', '사이즈 실측']
    return ['실사용 후기 반영', '수치로 증명', '구매 후 A/S', '즉시 활용 가능', '가격 대비 효과']
  }
  if (lang === 'ja') {
    return ['使用感レビュー反映', '数値で証明', '購入後サポート', 'すぐ使える', 'コスパ']
  }
  if (lang === 'zh') {
    return ['实测反馈', '数据证明', '售后保障', '即买即用', '性价比高']
  }
  return ['proven by reviews', 'backed by numbers', 'post-purchase support', 'ready to use', 'value for money']
}

// ── 헬퍼: 경쟁 상품 공통 어필 포인트 ────────────────────────────────

function competitorAppealAngles(productName: string, category: string, lang: UiLang): string[] {
  const cat = (category + ' ' + productName).toLowerCase()

  if (lang === 'ko') {
    if (/뷰티|스킨|화장품/.test(cat))
      return ['성분 강조 (ex. 히알루론산 X% 함유)', '피부 타입별 맞춤', '전후 사진']
    if (/건강|영양|비타민/.test(cat))
      return ['임상 수치 강조', '복용 편의성 (크기·맛)', '국내/해외 인증 배지']
    if (/전자|가전|IT/.test(cat))
      return ['스펙 수치 비교표', '사용 시간·충전 시간', '타 제품 대비 가격']
    return ['가격 대비 기능 수 강조', '인기 순위·판매량 언급', '무료 배송·증정품']
  }
  if (lang === 'ja') {
    return ['スペック比較', '使用期間・耐久性', '他製品との価格差']
  }
  if (lang === 'zh') {
    return ['规格对比', '使用时长/耐用性', '与同类产品的价格差']
  }
  return ['spec comparison', 'usage duration / durability', 'price vs competitors']
}

// ── 헬퍼: 리뷰 불만 → 카피 지침 ─────────────────────────────────────

function reviewGuidelinesForPrompt(category: string, lang: UiLang): string[] {
  const cat = category.toLowerCase()

  if (lang === 'ko') {
    if (/뷰티|스킨|화장품/.test(cat))
      return [
        '향 민감 고객: 무향/저자극 여부를 본문 초반에 명시',
        '발림성·흡수 불만: "가벼운 텍스처" 또는 "빠른 흡수"를 수치와 함께 언급',
        '지속력 불만: 몇 시간 지속되는지 구체적 숫자로 기재',
      ]
    if (/건강|영양|비타민/.test(cat))
      return [
        '크기·냄새 불만: 캡슐 크기(mm)·무취/무향 여부 명시',
        '효과 체감 불만: "X주 이상 꾸준히 복용 시" 식으로 기대치 정렬',
        '성분 의심: 원료 출처·제조국·검사 성적서 언급',
      ]
    if (/배송|포장|택배/.test(cat))
      return [
        '파손 불만: 포장 방식(에어캡 이중 포장 등) 본문에 명시',
        '배송 지연: 평균 배송일 기재',
      ]
    return [
      '포장·배송 불만: 안전 포장 방식 본문에 포함',
      '내구성 의심: 사용 기간·보증 기간 명시',
      '가격 대비 의심: 타 제품 대비 핵심 차별점 1개 이상 수치로 제시',
    ]
  }
  if (lang === 'ja') {
    return [
      '梱包・配送不満: 梱包方法を本文に明記',
      '耐久性への疑い: 使用期間・保証期間を明示',
      'コスパへの疑い: 他製品との差別点を数値で提示',
    ]
  }
  if (lang === 'zh') {
    return [
      '包装/物流差评：在正文中说明包装方式',
      '耐用性疑虑：写明使用寿命与保修期',
      '性价比疑虑：用数值展示与同类产品的差异点',
    ]
  }
  return [
    'Packaging/shipping complaints: describe packaging method in copy',
    'Durability doubts: state usage lifespan and warranty clearly',
    'Value doubts: include at least one numeric differentiator vs alternatives',
  ]
}

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
