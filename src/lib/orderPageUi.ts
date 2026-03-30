import type { UiLang } from '@/lib/uiLocale'

export type SeoReportItem = { label: string; ok: boolean; tip: string }

export type LocalizedSeoReport = {
  score: number
  items: SeoReportItem[]
  tags: string[]
  metaTitle: string
  metaDesc: string
}

interface Section {
  id: number
  name: string
  title: string
  body: string
}

function computeMetrics(sections: Section[], productName: string, category: string) {
  const fullText = sections.map(s => s.title + ' ' + s.body).join(' ')
  const charCount = fullText.replace(/\s/g, '').length
  const titleLengths = sections.map(s => s.title.length)
  const avgTitleLen = titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length
  const numTitleCount = sections.filter(s => /\d/.test(s.title)).length
  const hasNumbers = numTitleCount >= 3
  const hasQuestion = sections.some(s =>
    /[?？]|인가요|나요|까요|세요|ですか|ますか|か？|吗|么\?|why |how |what |are you|is your/i.test(s.title)
  )
  const lastBody = sections[sections.length - 1]?.body ?? ''
  const ctaKo = /지금|바로|구매|시작|할인|무료/
  const ctaEn = /now|today|buy|order|shop|get started|free|save|discount|off\b|click/i
  const hasCta = ctaKo.test(lastBody) || ctaEn.test(lastBody)
  const ctaCountKo = lastBody.split(/지금|바로|구매|시작|할인|무료/).length - 1
  const ctaCountEn = (lastBody.match(/\b(now|today|buy|order|shop|free|save|discount|off)\b/gi) ?? []).length
  const ctaCount = Math.max(ctaCountKo, ctaCountEn)
  const keywordInTitles = sections.filter(s => {
    const tokens = productName.split(/[\s,·]+/).filter(t => t.length >= 2)
    return tokens.some(token => s.title.includes(token)) || s.title.includes(category)
  }).length
  const bodyLengths = sections.map(s => s.body.replace(/\s/g, '').length)
  const allBodySufficient = bodyLengths.length ? bodyLengths.every(l => l >= 100) : false
  const minBody = bodyLengths.length ? Math.min(...bodyLengths) : 0
  return {
    charCount,
    avgTitleLen,
    hasNumbers,
    numTitleCount,
    hasQuestion,
    hasCta,
    ctaCount,
    keywordInTitles,
    bodyLengths,
    allBodySufficient,
    minBody,
  }
}

export function buildSeoReport(
  sections: Section[],
  productName: string,
  category: string,
  lang: UiLang
): LocalizedSeoReport {
  const m = computeMetrics(sections, productName, category)
  const L = SEO_COPY[lang]

  const items: SeoReportItem[] = [
    {
      ok: m.keywordInTitles >= 3,
      label: L.kw.label,
      tip: L.kw.tip(m.keywordInTitles),
    },
    {
      ok: m.charCount >= 900,
      label: L.len.label,
      tip: L.len.tip(m.charCount),
    },
    {
      ok: m.avgTitleLen >= 15 && m.avgTitleLen <= 40,
      label: L.titleLen.label,
      tip: L.titleLen.tip(Math.round(m.avgTitleLen)),
    },
    {
      ok: m.hasNumbers,
      label: L.nums.label,
      tip: L.nums.tip(m.numTitleCount),
    },
    {
      ok: m.hasQuestion,
      label: L.q.label,
      tip: L.q.tip,
    },
    {
      ok: m.hasCta && m.ctaCount >= 2,
      label: L.cta.label,
      tip: L.cta.tip(m.ctaCount),
    },
    {
      ok: m.allBodySufficient,
      label: L.body.label,
      tip: L.body.tip(m.minBody),
    },
  ]

  const score = Math.round((items.filter(i => i.ok).length / items.length) * 100)
  const tagExtra = TAG_EXTRAS[lang]
  const tags = [
    productName.split(' ')[0],
    category,
    ...productName.split(' ').slice(1, 3),
    ...tagExtra,
  ].filter(Boolean).slice(0, 8)

  const metaTitle = L.metaTitle(productName, category)
  const metaDesc = (sections[0]?.body.slice(0, 80).replace(/\n/g, ' ') ?? '') + '...'

  return { score, items, tags, metaTitle, metaDesc }
}

const TAG_EXTRAS: Record<UiLang, string[]> = {
  ko: ['스마트스토어', '쿠팡'],
  en: ['ecommerce', 'shopping'],
  ja: ['通販', 'おすすめ'],
  zh: ['电商', '好物'],
}

type SeoBlock = {
  label: string
  tip: ((n: number) => string) | string
}

type SeoLang = {
  kw: SeoBlock & { tip: (n: number) => string }
  len: SeoBlock & { tip: (n: number) => string }
  titleLen: SeoBlock & { tip: (n: number) => string }
  nums: SeoBlock & { tip: (n: number) => string }
  q: { label: string; tip: string }
  cta: SeoBlock & { tip: (n: number) => string }
  body: SeoBlock & { tip: (n: number) => string }
  metaTitle: (product: string, cat: string) => string
  levelHigh: string
  levelMid: string
  levelLow: string
}

const SEO_COPY: Record<UiLang, SeoLang> = {
  ko: {
    kw: {
      label: '키워드 제목 포함 (3개 이상)',
      tip: (n) => `제목에 제품명·카테고리 키워드가 ${n}개만 있어요. 최소 3개 이상 포함해야 검색 노출에 유리합니다.`,
    },
    len: {
      label: '충분한 본문량 (900자 이상)',
      tip: (n) => `현재 본문 총 ${n}자입니다. 900자 이상이어야 검색 엔진이 풍부한 콘텐츠로 평가합니다. "다시 생성"을 눌러보세요.`,
    },
    titleLen: {
      label: '제목 길이 최적화 (15~40자)',
      tip: (n) => `평균 제목 길이 ${n}자입니다. 15~40자가 검색 결과에서 가장 잘 표시됩니다.`,
    },
    nums: {
      label: '숫자 활용 제목 (3개 이상)',
      tip: (n) => `숫자가 포함된 제목이 ${n}개입니다. "3가지", "100%", "2주" 같은 수치가 클릭률을 높입니다.`,
    },
    q: {
      label: '의문형 제목 사용',
      tip: '"~하고 계신가요?" 형식의 제목은 공감도를 높이고 체류 시간을 늘립니다.',
    },
    cta: {
      label: 'CTA 문구 2개 이상 (마지막 섹션)',
      tip: (n) => `마지막 섹션에 행동 유도 키워드가 ${n}개입니다. 최소 2개 이상 포함하세요.`,
    },
    body: {
      label: '섹션별 본문 충분 (각 100자 이상)',
      tip: (n) => `본문이 짧은 섹션이 있습니다. 최소값: ${n}자. 각 섹션을 100자 이상으로 작성하세요.`,
    },
    metaTitle: (p, c) => `${p} | ${c} 전문 쇼핑몰`,
    levelHigh: '🟢 우수 — 블로그·검색 최적화 완료',
    levelMid: '🟡 보통 — 일부 개선이 필요합니다',
    levelLow: '🔴 미흡 — 수정 후 블로그에 발행하세요',
  },
  en: {
    kw: {
      label: 'Keywords in titles (3+)',
      tip: (n) => `Only ${n} titles include product/category keywords. Aim for 3+ for better SEO.`,
    },
    len: {
      label: 'Enough body copy (900+ chars)',
      tip: (n) => `Total body is ${n} characters. Target 900+ for richer search signals. Try Regenerate.`,
    },
    titleLen: {
      label: 'Title length (15–40 chars)',
      tip: (n) => `Average title length is ${n} chars. 15–40 tends to perform best in results.`,
    },
    nums: {
      label: 'Numbers in titles (3+)',
      tip: (n) => `${n} titles include numbers. Stats like "3 reasons" or "20%" lift CTR.`,
    },
    q: {
      label: 'Question-style titles',
      tip: 'Questions ("Why…?", "Are you…?") improve engagement and time on page.',
    },
    cta: {
      label: '2+ CTAs in last section',
      tip: (n) => `Found ${n} action cues in the last section. Add at least 2 (buy, shop, today, etc.).`,
    },
    body: {
      label: 'Each section 100+ chars',
      tip: (n) => `Some sections are short. Minimum seen: ${n} chars. Aim for 100+ per section.`,
    },
    metaTitle: (p, c) => `${p} | ${c}`,
    levelHigh: '🟢 Strong — ready for blog & search',
    levelMid: '🟡 OK — a few improvements help',
    levelLow: '🔴 Weak — edit before publishing',
  },
  ja: {
    kw: {
      label: 'タイトルにキーワード（3つ以上）',
      tip: (n) => `商品名・カテゴリが入ったタイトルは${n}個です。3つ以上を目安に。`,
    },
    len: {
      label: '本文の十分な量（900文字以上）',
      tip: (n) => `本文合計${n}文字です。900文字以上が望ましいです。「再生成」を試してください。`,
    },
    titleLen: {
      label: 'タイトル長（15〜40文字）',
      tip: (n) => `平均タイトル長${n}文字。15〜40文字が検索表示に向きます。`,
    },
    nums: {
      label: '数字入りタイトル（3つ以上）',
      tip: (n) => `数字を含むタイトルは${n}個です。「3つ」「100%」などがCTR向上に。`,
    },
    q: {
      label: '疑問形タイトル',
      tip: '「〜ですか？」形式は共感と滞在時間の向上に効きます。',
    },
    cta: {
      label: '最終セクションにCTA 2つ以上',
      tip: (n) => `最終セクションの行動を促す表現は${n}個。2つ以上を目安に。`,
    },
    body: {
      label: '各セクション100文字以上',
      tip: (n) => `短いセクションがあります。最小${n}文字。各100文字以上を目安に。`,
    },
    metaTitle: (p, c) => `${p} | ${c}`,
    levelHigh: '🟢 良好 — ブログ・検索向き',
    levelMid: '🟡 普通 — 改善の余地あり',
    levelLow: '🔴 要改善 — 公開前に調整を',
  },
  zh: {
    kw: {
      label: '标题含关键词（3 个以上）',
      tip: (n) => `含产品/类目关键词的标题有 ${n} 个，建议至少 3 个。`,
    },
    len: {
      label: '正文体量（900 字以上）',
      tip: (n) => `正文共约 ${n} 字，建议 900 字以上。可点「重新生成」。`,
    },
    titleLen: {
      label: '标题长度（15–40 字）',
      tip: (n) => `平均标题长度 ${n} 字，15–40 字在搜索结果中更易展示。`,
    },
    nums: {
      label: '含数字标题（3 个以上）',
      tip: (n) => `含数字的标题有 ${n} 个，如「3 个理由」「8 折」等有助于点击率。`,
    },
    q: {
      label: '使用疑问式标题',
      tip: '「为什么…」「你还在…吗？」类标题有助于停留时间。',
    },
    cta: {
      label: '末段 CTA 至少 2 处',
      tip: (n) => `最后一段行动号召类用语约 ${n} 处，建议至少 2 处。`,
    },
    body: {
      label: '每段正文 100 字以上',
      tip: (n) => `部分段落偏短，最短约 ${n} 字，建议每段 100 字以上。`,
    },
    metaTitle: (p, c) => `${p} | ${c}`,
    levelHigh: '🟢 优秀 — 适合博客与搜索',
    levelMid: '🟡 一般 — 还可优化',
    levelLow: '🔴 偏弱 — 发布前建议修改',
  },
}

export type OrderPageUi = {
  brand: string
  badgeDone: string
  headerHint: string
  /** 결과 페이지 헤더 언어 전환 */
  headerUiLangTitle: string
  regen: string
  regenLoading: string
  chatOpen: string
  pdf: string
  pdfLoading: string
  pdfGen: string
  toc: string
  seoScore: string
  seoSeeMore: string
  previewBar: string
  seoPts: (n: number) => string
  liveEdit: string
  prodImages: string
  replace: string
  addImg: string
  addImgTitle: string
  imageHint: string
  editing: string
  footerAi: string
  newOrder: string
  regenBottom: string
  pdfBottom: string
  bottomHint: string
  seoModalTitle: string
  scoreOf: string
  recoTags: string
  blogRec: string
  metaTitleLbl: string
  metaDescLbl: string
  chatAssistant: string
  quickReq: string
  quickChips: string[]
  chatEmptyTitle: string
  chatEmptyL1: string
  chatEmptyL2: string
  chatEmptyL3: string
  chatEmptyNote: string
  applySections: (n: number) => string
  chatPh: string
  chatEnterHint: string
  errOrder: string
  noResult: string
  dashboard: string
  toastRegenOk: string
  toastRegenFail: string
  toastPdfOk: string
  toastPdfFail: string
  toastSections: (n: number) => string
  toastImgOk: string
  toastChatErr: string
  toastUploadFail: string
  pdfFilename: (name: string) => string
  imgAlt: (i: number) => string
  /** P3 v0: 팀 읽기 전용 공유 링크 */
  shareLinkBtn: string
  shareLinkToast: string
  shareLinkFail: string
  shareLinkNeedLogin: string
  shareLinkNotConfigured: string
  shareLinkNoResult: string
  txtDownload: string
  toastTxtOk: string
  txtFilename: (name: string) => string
}

export const ORDER_PAGE_UI: Record<UiLang, OrderPageUi> = {
  ko: {
    brand: '페이지AI',
    badgeDone: '완료',
    headerHint: '섹션을 클릭해서 바로 편집하세요',
    headerUiLangTitle: '화면',
    regen: '↺ 다시 생성',
    regenLoading: '재생성 중...',
    chatOpen: '✦ AI 수정 요청',
    pdf: '↓ PDF 다운로드',
    pdfLoading: '생성 중...',
    pdfGen: 'PDF 생성 중...',
    toc: '섹션 목차',
    seoScore: 'SEO 점수',
    seoSeeMore: '자세히 보기 →',
    previewBar: '모바일 미리보기 (390px) · 클릭해서 직접 수정 가능',
    seoPts: (n) => `SEO ${n}점`,
    liveEdit: '실시간 편집',
    prodImages: '제품 이미지 · 최대 3장',
    replace: '교체',
    addImg: '+',
    addImgTitle: '이미지 추가',
    imageHint: 'AI 채팅은 글만 수정합니다. 사진은 여기서 교체하거나 추가하세요.',
    editing: '편집 중',
    footerAi: 'AI 자동 생성 상세페이지',
    newOrder: '+ 새 주문',
    regenBottom: '다시 생성',
    pdfBottom: 'PDF 다운로드',
    bottomHint: '섹션을 클릭해서 제목과 본문을 자유롭게 수정하세요',
    seoModalTitle: 'SEO 분석 리포트',
    scoreOf: '/ 100',
    recoTags: '추천 검색 태그',
    blogRec: '블로그 포스팅 추천 설정',
    metaTitleLbl: '제목',
    metaDescLbl: '설명 (메타 디스크립션)',
    chatAssistant: 'AI 수정 어시스턴트',
    quickReq: '빠른 요청',
    quickChips: [
      '첫 번째 섹션 더 강렬하게',
      '첫 번째 제품 사진을 더 밝고 고급스럽게 바꿔줘',
      'CTA 더 설득력 있게',
      '전체적으로 더 친근하게',
      '숫자와 수치 더 추가해줘',
      '제목들 더 짧고 임팩트 있게',
    ],
    chatEmptyTitle: 'AI에게 수정을 요청하세요',
    chatEmptyL1: '"1번 섹션 더 강하게 바꿔줘"',
    chatEmptyL2: '"첫 번째 사진을 화이트 배경 제품컷으로 바꿔줘"',
    chatEmptyL3: '"https://… 이미지로 두 번째 사진 교체해줘" (URL 붙여넣기)',
    chatEmptyNote:
      '글은 제안 후 「섹션 적용하기」를 눌러 반영하세요. 사진은 말로 요청하면 AI가 이미지를 생성·저장합니다(최대 3장). 정확한 사진은 URL을 붙이거나 위「제품 이미지」에서 직접 올리는 편이 더 안전합니다.',
    applySections: (n) => `✓ ${n}개 섹션 적용하기`,
    chatPh: '수정 요청을 입력하세요...',
    chatEnterHint: 'Enter로 전송 · 수정 후 섹션에 바로 적용됩니다',
    errOrder: '주문을 찾을 수 없습니다',
    noResult: '생성된 결과가 없습니다',
    dashboard: '대시보드로',
    toastRegenOk: '다시 생성됐습니다!',
    toastRegenFail: '재생성 중 오류',
    toastPdfOk: 'PDF 다운로드 완료!',
    toastPdfFail: 'PDF 생성 오류',
    toastSections: (n) => `${n}개 섹션이 수정됐습니다!`,
    toastImgOk: '이미지가 반영됐습니다',
    toastChatErr: '오류가 발생했습니다. 다시 시도해주세요.',
    toastUploadFail: '업로드 실패',
    pdfFilename: (name) => `상품상세페이지_${name}.pdf`,
    imgAlt: (i) => `제품 ${i + 1}`,
    shareLinkBtn: '팀 공유 링크 복사',
    shareLinkToast: '읽기 전용 공유 링크를 복사했습니다',
    shareLinkFail: '공유 링크를 만들지 못했습니다',
    shareLinkNeedLogin: '로그인 후 이용할 수 있습니다',
    shareLinkNotConfigured: '공유 링크 기능이 아직 설정되지 않았습니다 (ORDER_SHARE_SECRET)',
    shareLinkNoResult: '생성된 본문이 있을 때만 공유할 수 있습니다',
    txtDownload: '↓ TXT 다운로드',
    toastTxtOk: 'TXT 파일 다운로드 완료!',
    txtFilename: (name) => `작성결과_${name}.txt`,
  },
  en: {
    brand: 'PageAI',
    badgeDone: 'Done',
    headerHint: 'Click a section to edit inline',
    headerUiLangTitle: 'UI',
    regen: '↺ Regenerate',
    regenLoading: 'Regenerating...',
    chatOpen: '✦ AI edit request',
    pdf: '↓ Download PDF',
    pdfLoading: 'Working...',
    pdfGen: 'Building PDF...',
    toc: 'Sections',
    seoScore: 'SEO score',
    seoSeeMore: 'Details →',
    previewBar: 'Mobile preview (390px) · tap to edit',
    seoPts: (n) => `SEO ${n}`,
    liveEdit: 'Live editing',
    prodImages: 'Product images · up to 3',
    replace: 'Replace',
    addImg: '+',
    addImgTitle: 'Add image',
    imageHint: 'AI chat edits text only. Replace or add photos here.',
    editing: 'Editing',
    footerAi: 'AI-generated landing page',
    newOrder: '+ New order',
    regenBottom: 'Regenerate',
    pdfBottom: 'Download PDF',
    bottomHint: 'Tap any section to edit title and body',
    seoModalTitle: 'SEO report',
    scoreOf: '/ 100',
    recoTags: 'Suggested tags',
    blogRec: 'Suggested blog settings',
    metaTitleLbl: 'Title',
    metaDescLbl: 'Meta description',
    chatAssistant: 'AI editing assistant',
    quickReq: 'Quick prompts',
    quickChips: [
      'Make the first section punchier',
      'Brighten the first product photo, premium look',
      'Stronger CTAs',
      'Friendlier tone overall',
      'Add more numbers and stats',
      'Shorter, bolder headlines',
    ],
    chatEmptyTitle: 'Ask the AI to revise your page',
    chatEmptyL1: '"Make section 1 more compelling"',
    chatEmptyL2: '"Turn the first image into a clean white-background shot"',
    chatEmptyL3: '"Replace the second image with this URL: https://…"',
    chatEmptyNote:
      'Apply text changes with “Apply sections”. For images, the AI can generate up to 3 slots; for exact assets, paste a URL or upload under Product images.',
    applySections: (n) => `✓ Apply ${n} section${n === 1 ? '' : 's'}`,
    chatPh: 'Describe what to change...',
    chatEnterHint: 'Enter to send · apply suggestions to sections',
    errOrder: 'Order not found',
    noResult: 'No generated result yet',
    dashboard: 'Go to dashboard',
    toastRegenOk: 'Regenerated successfully',
    toastRegenFail: 'Regeneration failed',
    toastPdfOk: 'PDF downloaded',
    toastPdfFail: 'Could not create PDF',
    toastSections: (n) => `Updated ${n} section${n === 1 ? '' : 's'}`,
    toastImgOk: 'Images updated',
    toastChatErr: 'Something went wrong. Try again.',
    toastUploadFail: 'Upload failed',
    pdfFilename: (name) => `landing_${name.replace(/\s+/g, '_')}.pdf`,
    imgAlt: (i) => `Product ${i + 1}`,
    shareLinkBtn: 'Copy team share link',
    shareLinkToast: 'Read-only share link copied',
    shareLinkFail: 'Could not create share link',
    shareLinkNeedLogin: 'Sign in to use this',
    shareLinkNotConfigured: 'Share links are not configured (ORDER_SHARE_SECRET)',
    shareLinkNoResult: 'Share is available after the page is generated',
    txtDownload: '↓ Download TXT',
    toastTxtOk: 'TXT file downloaded!',
    txtFilename: (name) => `result_${name.replace(/\s+/g, '_')}.txt`,
  },
  ja: {
    brand: 'PageAI',
    badgeDone: '完了',
    headerHint: 'セクションをタップしてその場で編集',
    headerUiLangTitle: '表示',
    regen: '↺ 再生成',
    regenLoading: '再生成中...',
    chatOpen: '✦ AIに修正依頼',
    pdf: '↓ PDFダウンロード',
    pdfLoading: '作成中...',
    pdfGen: 'PDF作成中...',
    toc: 'セクション一覧',
    seoScore: 'SEOスコア',
    seoSeeMore: '詳しく見る →',
    previewBar: 'モバイルプレビュー (390px) · タップで編集',
    seoPts: (n) => `SEO ${n}点`,
    liveEdit: 'リアルタイム編集',
    prodImages: '商品画像 · 最大3枚',
    replace: '差し替え',
    addImg: '+',
    addImgTitle: '画像を追加',
    imageHint: 'AIチャットは文章のみ変更します。写真はここで差し替え・追加してください。',
    editing: '編集中',
    footerAi: 'AI自動生成のランディングページ',
    newOrder: '+ 新規注文',
    regenBottom: '再生成',
    pdfBottom: 'PDFダウンロード',
    bottomHint: 'セクションをタップしてタイトルと本文を編集',
    seoModalTitle: 'SEOレポート',
    scoreOf: '/ 100',
    recoTags: 'おすすめタグ',
    blogRec: 'ブログ投稿の推奨設定',
    metaTitleLbl: 'タイトル',
    metaDescLbl: 'メタディスクリプション',
    chatAssistant: 'AI編集アシスタント',
    quickReq: 'クイックリクエスト',
    quickChips: [
      '1つ目のセクションをもっと強く',
      '1枚目の商品写真を明るく高級感に',
      'CTAをもっと説得力あるように',
      '全体をフレンドリーに',
      '数字やデータを増やして',
      '見出しを短くインパクト重視で',
    ],
    chatEmptyTitle: 'AIに修正してもらいましょう',
    chatEmptyL1: '「1番目のセクションを強めに」',
    chatEmptyL2: '「1枚目を白背景の商品カットに」',
    chatEmptyL3: '「このURLの画像で2枚目を差し替えて」',
    chatEmptyNote:
      '文章は提案後「セクションを適用」で反映。画像は最大3枚までAI生成可能。正確な画像はURL指定か上の商品画像からアップロードが確実です。',
    applySections: (n) => `✓ ${n}セクションを適用`,
    chatPh: '修正内容を入力...',
    chatEnterHint: 'Enterで送信 · 適用でセクションに反映',
    errOrder: '注文が見つかりません',
    noResult: '生成結果がありません',
    dashboard: 'ダッシュボードへ',
    toastRegenOk: '再生成しました',
    toastRegenFail: '再生成に失敗しました',
    toastPdfOk: 'PDFをダウンロードしました',
    toastPdfFail: 'PDFの作成に失敗しました',
    toastSections: (n) => `${n}セクションを更新しました`,
    toastImgOk: '画像を反映しました',
    toastChatErr: 'エラーが発生しました。もう一度お試しください。',
    toastUploadFail: 'アップロードに失敗しました',
    pdfFilename: (name) => `landing_${name.replace(/\s+/g, '_')}.pdf`,
    imgAlt: (i) => `商品 ${i + 1}`,
    shareLinkBtn: '共有リンクをコピー',
    shareLinkToast: '読み取り専用の共有リンクをコピーしました',
    shareLinkFail: '共有リンクを作成できませんでした',
    shareLinkNeedLogin: 'ログインが必要です',
    shareLinkNotConfigured: '共有リンクが未設定です（ORDER_SHARE_SECRET）',
    shareLinkNoResult: '生成結果があるときのみ共有可能です',
    txtDownload: '↓ TXTダウンロード',
    toastTxtOk: 'TXTファイルをダウンロードしました！',
    txtFilename: (name) => `結果_${name}.txt`,
  },
  zh: {
    brand: 'PageAI',
    badgeDone: '已完成',
    headerHint: '点击区块即可就地编辑',
    headerUiLangTitle: '界面',
    regen: '↺ 重新生成',
    regenLoading: '重新生成中...',
    chatOpen: '✦ AI 修改',
    pdf: '↓ 下载 PDF',
    pdfLoading: '生成中...',
    pdfGen: 'PDF 生成中...',
    toc: '内容目录',
    seoScore: 'SEO 分数',
    seoSeeMore: '查看详情 →',
    previewBar: '手机预览 (390px) · 点击即可编辑',
    seoPts: (n) => `SEO ${n} 分`,
    liveEdit: '实时编辑',
    prodImages: '商品图 · 最多 3 张',
    replace: '替换',
    addImg: '+',
    addImgTitle: '添加图片',
    imageHint: 'AI 对话只改文字。图片请在此替换或添加。',
    editing: '编辑中',
    footerAi: 'AI 自动生成的详情页',
    newOrder: '+ 新订单',
    regenBottom: '重新生成',
    pdfBottom: '下载 PDF',
    bottomHint: '点击任意区块编辑标题与正文',
    seoModalTitle: 'SEO 报告',
    scoreOf: '/ 100',
    recoTags: '推荐标签',
    blogRec: '博客发布建议',
    metaTitleLbl: '标题',
    metaDescLbl: '描述（Meta）',
    chatAssistant: 'AI 编辑助手',
    quickReq: '快捷请求',
    quickChips: [
      '第一段更有冲击力',
      '第一张产品图更亮、更高级',
      'CTA 更有说服力',
      '整体语气更亲切',
      '多加点数字和数据',
      '标题更短更有力',
    ],
    chatEmptyTitle: '告诉 AI 要改什么',
    chatEmptyL1: '「把第 1 段写得更狠一点」',
    chatEmptyL2: '「第一张换成白底产品图」',
    chatEmptyL3: '「用 https://… 这张图替换第二张」',
    chatEmptyNote:
      '文字修改后点「应用区块」。图片可由 AI 生成（最多 3 张）；要精准素材请贴 URL 或在上方商品图处上传。',
    applySections: (n) => `✓ 应用 ${n} 个区块`,
    chatPh: '输入修改需求...',
    chatEnterHint: 'Enter 发送 · 应用后写入对应区块',
    errOrder: '找不到订单',
    noResult: '尚无生成结果',
    dashboard: '返回控制台',
    toastRegenOk: '已重新生成',
    toastRegenFail: '重新生成失败',
    toastPdfOk: 'PDF 已下载',
    toastPdfFail: 'PDF 生成失败',
    toastSections: (n) => `已更新 ${n} 个区块`,
    toastImgOk: '图片已更新',
    toastChatErr: '出错了，请重试。',
    toastUploadFail: '上传失败',
    pdfFilename: (name) => `landing_${name.replace(/\s+/g, '_')}.pdf`,
    imgAlt: (i) => `产品 ${i + 1}`,
    shareLinkBtn: '复制团队分享链接',
    shareLinkToast: '已复制只读分享链接',
    shareLinkFail: '无法生成分享链接',
    shareLinkNeedLogin: '请先登录',
    shareLinkNotConfigured: '未配置分享链接（ORDER_SHARE_SECRET）',
    shareLinkNoResult: '请先生成详情页后再分享',
    txtDownload: '↓ 下载 TXT',
    toastTxtOk: 'TXT 文件已下载！',
    txtFilename: (name) => `结果_${name}.txt`,
  },
}

export function seoLevelMessage(lang: UiLang, score: number): string {
  const L = SEO_COPY[lang]
  if (score >= 80) return L.levelHigh
  if (score >= 60) return L.levelMid
  return L.levelLow
}
