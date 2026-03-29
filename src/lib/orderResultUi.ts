import type { UiLang } from '@/lib/uiLocale'

export type PublishPlatform =
  | 'naver'
  | 'smartstore'
  | 'coupang'
  | 'tistory'
  | 'brunch'
  | 'instagram'
  | 'wordpress'
  | 'medium'
  | 'shopify'
  | 'linkedin'

export type PlatformRow = { id: PublishPlatform; label: string; icon: string; desc: string }

const KO: PlatformRow[] = [
  { id: 'naver', icon: 'N', label: '네이버 블로그', desc: 'HTML 편집 탭에 붙여넣기' },
  { id: 'smartstore', icon: '스', label: '스마트스토어', desc: '상품명·상세·SEO 필드에 붙여넣기' },
  { id: 'coupang', icon: 'C', label: '쿠팡 윙', desc: '등록 필드에 붙여넣기' },
  { id: 'tistory', icon: 'T', label: '티스토리', desc: 'HTML 모드에 붙여넣기' },
  { id: 'brunch', icon: 'B', label: '브런치', desc: '일반 텍스트 붙여넣기' },
  { id: 'wordpress', icon: 'W', label: 'WordPress', desc: 'HTML / 커스텀 HTML 블록에 붙여넣기' },
  { id: 'medium', icon: 'M', label: 'Medium', desc: '스토리 에디터에 HTML 붙여넣기' },
  { id: 'shopify', icon: 'S', label: 'Shopify', desc: '상품 설명(HTML)에 붙여넣기' },
  { id: 'linkedin', icon: 'in', label: 'LinkedIn', desc: '아티클 에디터에 붙여넣기' },
  { id: 'instagram', icon: '📸', label: '인스타그램', desc: '캡션에 붙여넣기' },
]

const EN: PlatformRow[] = [
  { id: 'smartstore', icon: 'S', label: 'Naver Smartstore', desc: 'Paste into listing & SEO fields' },
  { id: 'coupang', icon: 'C', label: 'Coupang Wing', desc: 'Paste into listing fields' },
  { id: 'wordpress', icon: 'W', label: 'WordPress', desc: 'Paste in HTML or Custom HTML block' },
  { id: 'medium', icon: 'M', label: 'Medium', desc: 'Paste HTML in the story editor' },
  { id: 'shopify', icon: 'S', label: 'Shopify', desc: 'Paste in product description (HTML)' },
  { id: 'linkedin', icon: 'in', label: 'LinkedIn', desc: 'Paste in article editor' },
  { id: 'tistory', icon: 'T', label: 'Tistory', desc: 'Paste in HTML mode' },
  { id: 'naver', icon: 'N', label: 'Naver Blog', desc: 'Paste in HTML edit tab' },
  { id: 'brunch', icon: 'B', label: 'Brunch', desc: 'Paste as plain text' },
  { id: 'instagram', icon: '📸', label: 'Instagram', desc: 'Paste as caption' },
]

const JA: PlatformRow[] = [
  { id: 'smartstore', icon: 'S', label: 'Smartstore', desc: '商品・詳細・SEO欄に貼り付け' },
  { id: 'coupang', icon: 'C', label: 'Coupang Wing', desc: '登録欄に貼り付け' },
  { id: 'wordpress', icon: 'W', label: 'WordPress', desc: 'HTML / カスタムHTMLブロックに貼り付け' },
  { id: 'medium', icon: 'M', label: 'Medium', desc: 'ストーリーエディタにHTML貼り付け' },
  { id: 'tistory', icon: 'T', label: 'Tistory', desc: 'HTMLモードに貼り付け' },
  { id: 'naver', icon: 'N', label: 'NAVERブログ', desc: 'HTML編集タブに貼り付け' },
  { id: 'brunch', icon: 'B', label: 'Brunch', desc: 'プレーンテキストで貼り付け' },
  { id: 'shopify', icon: 'S', label: 'Shopify', desc: '商品説明(HTML)に貼り付け' },
  { id: 'linkedin', icon: 'in', label: 'LinkedIn', desc: '記事エディタに貼り付け' },
  { id: 'instagram', icon: '📸', label: 'Instagram', desc: 'キャプションに貼り付け' },
]

const ZH: PlatformRow[] = [
  { id: 'smartstore', icon: '智', label: 'Smartstore', desc: '粘贴到商品与 SEO 字段' },
  { id: 'coupang', icon: '酷', label: 'Coupang Wing', desc: '粘贴到上架字段' },
  { id: 'wordpress', icon: 'W', label: 'WordPress', desc: '粘贴到 HTML / 自定义 HTML 区块' },
  { id: 'medium', icon: 'M', label: 'Medium', desc: '在故事编辑器粘贴 HTML' },
  { id: 'shopify', icon: 'S', label: 'Shopify', desc: '粘贴到商品描述（HTML）' },
  { id: 'linkedin', icon: 'in', label: '领英', desc: '粘贴到文章编辑器' },
  { id: 'tistory', icon: 'T', label: 'Tistory', desc: 'HTML 模式粘贴' },
  { id: 'naver', icon: 'N', label: 'Naver 博客', desc: 'HTML 编辑页粘贴' },
  { id: 'brunch', icon: 'B', label: 'Brunch', desc: '纯文本粘贴' },
  { id: 'instagram', icon: '📸', label: 'Instagram', desc: '粘贴为配文' },
]

export function platformsForLang(lang: UiLang): PlatformRow[] {
  if (lang === 'ko') return KO
  if (lang === 'en') return EN
  if (lang === 'ja') return JA
  return ZH
}

export function defaultPlatformForLang(lang: UiLang): PublishPlatform {
  return lang === 'ko' ? 'naver' : 'wordpress'
}

export type PublishStep = { step: string; label: string; desc: string }

export type OrderResultUi = {
  loading: string
  toastCopied: (label: string) => string
  toastCopyFail: string
  blogModalTitle: string
  blogModalSub: string
  copyBtn: string
  copyBtnDone: string
  iframeTitle: string
  primaryPublishLabel: string
  copyHtmlShort: string
  /** 스마트스토어·쿠팡 등 필드 묶음 */
  copyListingBundleShort: string
  copyDoneCheck: string
  mobileBlogCopy: string
  mobileListingCopy: string
  mobileCopyDone: string
  bottomCopyLabel: string
  openBlogPreview: string
  naver: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  tistory: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  wordpress: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  instagram: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  smartstore: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  coupang: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  brunch: { line: string; desc: string; open: string }
  genericHtml: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  /** 발행 전 과장·효능 표현 휴리스틱 점검 (법률 자문 아님) */
  complianceTitle: string
  complianceSub: string
  complianceAllClear: string
  complianceDisclaimer: string
  complianceIssues: (n: number) => string
  complianceHigh: string
  complianceMedium: string
  complianceShow: string
  complianceHide: string
  /** 채널별 전략·전환·패키징 키트 (로드맵 P0) */
  channelKitTitle: string
  channelKitSub: string
  channelKitPlatformHint: string
  channelKitStrategy: string
  channelKitConversion: string
  channelKitPackaging: string
  channelKitHooks: string
  channelKitCopyHook: string
  channelKitToastHook: string
  channelKitShow: string
  channelKitHide: string
  channelKitSpecTitle: string
  channelKitSpecTitleLen: string
  channelKitSpecBullets: string
  channelKitSpecImages: string
  channelKitSpecFields: string
  channelKitCopyPasteBundle: string
  channelKitToastPasteBundle: string
  complianceIndustryBadge: (label: string) => string
  industryGeneral: string
  industryHealth: string
  industryBeauty: string
  industryFood: string
  industryFinance: string
  industryMedical: string
  complianceSuggestLabel: string
  complianceDisclosureTitle: string
  complianceCopyDisclosurePack: string
  complianceToastDisclosurePack: string
  abCopyTitle: string
  abCopySub: string
  abCopyTitles: string
  abCopyOpeners: string
  abCopyCopy: string
  abCopyToast: string
  abCopyApplyTitle: string
  abCopyApplyOpener: string
  abCopyToastApplyTitle: string
  abCopyToastApplyOpener: string
  abCopyShow: string
  abCopyHide: string
  abCopyCtas: string
  abCopyRecommend: string
  abCopyApplyCta: string
  abCopyToastApplyCta: string
  abCopyUtmHint: string
  abCopyRunnerUp: string
  abCopyApplyRecommended: string
  abCopyApplyRunnerUp: string
  abCopyToastApplyRecommended: string
  abCopyCopyUtm: string
  abCopyToastUtm: string
  abCopyCopyExperimentSheet: string
  abCopyToastExperimentSheet: string
  evidenceTitle: string
  evidenceSub: string
  evidenceCopyAll: string
  evidenceToast: string
  assetTitle: string
  assetSub: string
  assetThumbLabel: string
  assetRatioLabel: string
  assetSlotsLabel: string
  assetCopyAll: string
  intelTitle: string
  intelSub: string
  intelCompetitor: string
  intelKeywords: string
  intelReviewThemes: string
  intelGap: string
  intelCopyChecklist: string
  metaOgTitle: string
  metaOgSub: string
  metaOgCopyHtml: string
  metaOgCopyJson: string
  metaOgToastHtml: string
  metaOgToastJson: string
  metaOgNote: string
  metaOgShow: string
  metaOgHide: string
}

export const ORDER_RESULT_UI: Record<UiLang, OrderResultUi> = {
  ko: {
    loading: 'AI가 만든 상세페이지를 불러오는 중...',
    toastCopied: (label) => `${label} 형식으로 복사됐습니다!`,
    toastCopyFail: '복사 실패. 다시 시도해주세요.',
    blogModalTitle: '블로그 발행 미리보기',
    blogModalSub: '플랫폼을 선택하면 실제 발행 후 모습으로 미리봅니다',
    copyBtn: '↗ 복사',
    copyBtnDone: '복사됨 ✓',
    iframeTitle: '블로그 미리보기',
    primaryPublishLabel: '네이버 블로그 발행',
    copyHtmlShort: '↗ HTML 복사',
    copyListingBundleShort: '↗ 필드 묶음 복사',
    copyDoneCheck: '✓ 복사됨',
    mobileBlogCopy: '블로그 복사',
    mobileListingCopy: '필드 묶음 복사',
    mobileCopyDone: '복사됨 ✓',
    bottomCopyLabel: '네이버 블로그 복사',
    openBlogPreview: '블로그 포스팅 미리보기',
    naver: {
      title: '🚀 네이버 블로그 발행 (3단계)',
      steps: [
        { step: '1', label: 'HTML 복사', desc: '아래 버튼' },
        { step: '2', label: 'HTML 편집 탭', desc: '블로그 글쓰기' },
        { step: '3', label: '붙여넣기 → 발행', desc: 'Ctrl+V' },
      ],
      cta: '1-click: HTML 복사 + 네이버 블로그 열기',
      ctaDone: 'HTML 복사됨 ✓ — 네이버 열렸어요',
    },
    tistory: {
      title: '🟠 티스토리 발행 (3단계)',
      steps: [
        { step: '1', label: 'HTML 복사', desc: '아래 버튼' },
        { step: '2', label: '새 글 쓰기', desc: '티스토리 열기' },
        { step: '3', label: 'HTML 모드 붙여넣기', desc: '<> 아이콘 클릭' },
      ],
      cta: '1-click: HTML 복사 + 티스토리 열기',
      ctaDone: 'HTML 복사됨 ✓ — 티스토리 열렸어요',
    },
    wordpress: {
      title: '🔵 워드프레스 발행 (3단계)',
      steps: [
        { step: '1', label: 'HTML 복사', desc: '아래 버튼' },
        { step: '2', label: '새 글 추가', desc: 'WP 관리자' },
        { step: '3', label: 'HTML 블록 붙여넣기', desc: '/html 입력' },
      ],
      cta: '1-click: HTML 복사 + 워드프레스 열기',
      ctaDone: 'HTML 복사됨 ✓ — 워드프레스 열렸어요',
    },
    instagram: {
      title: '📸 인스타그램 업로드 (3단계)',
      steps: [
        { step: '1', label: '캡션 복사', desc: '아래 버튼' },
        { step: '2', label: '새 게시물', desc: '인스타 앱 열기' },
        { step: '3', label: '캡션 붙여넣기', desc: '이미지 + 캡션' },
      ],
      cta: '1-click: 캡션 복사 + 인스타그램 열기',
      ctaDone: '캡션 복사됨 ✓ — 인스타그램 열렸어요',
    },
    smartstore: {
      title: '🛒 스마트스토어 등록 (3단계)',
      steps: [
        { step: '1', label: '필드 묶음 복사', desc: '아래 버튼' },
        { step: '2', label: '상품 등록', desc: '셀러센터' },
        { step: '3', label: '필드별 붙여넣기', desc: '이름·상세·SEO' },
      ],
      cta: '1-click: 묶음 복사 + 스마트스토어 열기',
      ctaDone: '복사됨 ✓ — 셀러센터를 열었어요',
    },
    coupang: {
      title: '🟠 쿠팡 윙 등록 (3단계)',
      steps: [
        { step: '1', label: '필드 묶음 복사', desc: '아래 버튼' },
        { step: '2', label: '상품 등록', desc: '윙 로그인' },
        { step: '3', label: '필드별 붙여넣기', desc: '노출·상세 규정 확인' },
      ],
      cta: '1-click: 묶음 복사 + 쿠팡 윙 열기',
      ctaDone: '복사됨 ✓ — 윙을 열었어요',
    },
    brunch: {
      line: '📋 브런치 붙여넣기:',
      desc: '일반 텍스트 형식으로 복사 후 브런치 편집기에 붙여넣기',
      open: '브런치 열기 →',
    },
    genericHtml: {
      title: '📋 HTML 발행 (3단계)',
      steps: [
        { step: '1', label: 'HTML 복사', desc: '아래 버튼' },
        { step: '2', label: '에디터 열기', desc: '해당 플랫폼' },
        { step: '3', label: 'HTML 붙여넣기', desc: '게시' },
      ],
      cta: '1-click: HTML 복사 + 에디터 열기',
      ctaDone: 'HTML 복사됨 ✓ — 에디터를 열었어요',
    },
    complianceTitle: '발행 전 안전 점검',
    complianceSub: '과장·효능 스캔 + 업종 고지 문구',
    complianceAllClear: '눈에 띄는 리스크 문구가 없습니다',
    complianceDisclaimer: '자동 키워드 검사이며 법률·심의 판단이 아닙니다. 최종 책임은 게시자에게 있습니다.',
    complianceIssues: (n) => `확인 권장 ${n}건`,
    complianceHigh: '높음',
    complianceMedium: '중간',
    complianceShow: '펼치기',
    complianceHide: '접기',
    channelKitTitle: '채널 발행 키트',
    channelKitSub: '어디서 · 어떻게 팔릴지',
    channelKitPlatformHint: '플랫폼',
    channelKitStrategy: '이 채널에서의 역할',
    channelKitConversion: '전환 팁',
    channelKitPackaging: '패키징 체크',
    channelKitHooks: '훅 문장',
    channelKitCopyHook: '복사',
    channelKitToastHook: '훅 문장을 복사했습니다',
    channelKitShow: '펼치기',
    channelKitHide: '접기',
    channelKitSpecTitle: '채널 규격',
    channelKitSpecTitleLen: '제목·길이',
    channelKitSpecBullets: '불릿·금칙어',
    channelKitSpecImages: '이미지·비율',
    channelKitSpecFields: '필드 안내',
    channelKitCopyPasteBundle: '붙여넣기용 초안 전체 복사',
    channelKitToastPasteBundle: '초안을 복사했습니다',
    complianceIndustryBadge: (label) => `업종 프로필: ${label} — 추가 규칙 적용`,
    industryGeneral: '일반',
    industryHealth: '건강·영양',
    industryBeauty: '뷰티·화장품',
    industryFood: '식품',
    industryFinance: '금융·투자',
    industryMedical: '의료·건강정보 톤',
    complianceSuggestLabel: '대체 문안 예시',
    complianceDisclosureTitle: '업종별 필수·권장 고지',
    complianceCopyDisclosurePack: '고지 문구 전체 복사',
    complianceToastDisclosurePack: '고지 문구를 복사했습니다',
    abCopyTitle: '전환 A/B 카피',
    abCopySub: '제목·첫문장 3안 + CTA 2안',
    abCopyTitles: '제목 안',
    abCopyOpeners: '첫 문장 안',
    abCopyCopy: '복사',
    abCopyToast: '복사했습니다',
    abCopyApplyTitle: '1번 섹션 제목에 적용',
    abCopyApplyOpener: '1번 섹션 본문 앞에 붙이기',
    abCopyToastApplyTitle: '첫 섹션 제목을 바꿨습니다',
    abCopyToastApplyOpener: '첫 섹션 본문 앞에 문장을 넣었습니다',
    abCopyShow: '펼치기',
    abCopyHide: '접기',
    abCopyCtas: 'CTA 2안',
    abCopyRecommend: '먼저 써볼 조합 (추천)',
    abCopyApplyCta: '마지막 섹션 끝에 CTA 붙이기',
    abCopyToastApplyCta: '마지막 섹션에 CTA를 추가했습니다',
    abCopyUtmHint: '랜딩 A/B 시 UTM에 variant=ab_title1 등으로 구분해 두면 나중에 전환을 묶어 볼 수 있어요.',
    abCopyRunnerUp: '2차로 시도할 조합 (전환 강화)',
    abCopyApplyRecommended: '추천 조합 한 번에 적용',
    abCopyApplyRunnerUp: '2차 조합 적용',
    abCopyToastApplyRecommended: '추천 제목·첫문장·CTA를 반영했습니다',
    abCopyCopyUtm: '추천 UTM 쿼리 복사',
    abCopyToastUtm: 'UTM 쿼리를 복사했습니다',
    abCopyCopyExperimentSheet: '실험 시트 전체 복사',
    abCopyToastExperimentSheet: '실험 시트를 복사했습니다',
    evidenceTitle: '근거·출처 레이어',
    evidenceSub: 'B2B·제안서용 (한 줄 근거 + 각주 힌트)',
    evidenceCopyAll: '근거 블록 전체 복사',
    evidenceToast: '근거 블록을 복사했습니다',
    assetTitle: '에셋·썸네일 키트',
    assetSub: '비율 가이드 + 짧은 카피 슬롯',
    assetThumbLabel: '썸네일 한 줄 (3안)',
    assetRatioLabel: '이미지 비율',
    assetSlotsLabel: '슬롯 체크리스트',
    assetCopyAll: '에셋 키트 전체 복사',
    intelTitle: '데이터 각도 메모',
    intelSub: '실제 리뷰·경쟁 데이터 API 연동 전 체크리스트',
    intelCompetitor: '경쟁 상품명 패턴',
    intelKeywords: '카테고리 키워드 힌트',
    intelReviewThemes: '리뷰 불만 반영 질문',
    intelGap: '연동 시 자동화: 리뷰 크롤·카테고리 통계·경쟁사 제목 수집',
    intelCopyChecklist: '전체 체크리스트 복사',
    metaOgTitle: '메타 · OG 패키지',
    metaOgSub: '검색·SNS 미리보기용',
    metaOgCopyHtml: 'HTML 메타 블록 복사',
    metaOgCopyJson: 'JSON(LD 스타일) 복사',
    metaOgToastHtml: 'HTML 메타를 복사했습니다',
    metaOgToastJson: 'JSON을 복사했습니다',
    metaOgNote: 'og:image는 대표 이미지 URL이 있으면 포함됩니다. 사이트 URL은 NEXT_PUBLIC_SITE_URL을 설정하면 반영됩니다.',
    metaOgShow: '펼치기',
    metaOgHide: '접기',
  },
  en: {
    loading: 'Loading your AI-generated page...',
    toastCopied: (label) => `Copied as ${label} format!`,
    toastCopyFail: 'Copy failed. Please try again.',
    blogModalTitle: 'Blog publish preview',
    blogModalSub: 'Pick a platform to preview how it will look after publishing',
    copyBtn: '↗ Copy',
    copyBtnDone: 'Copied ✓',
    iframeTitle: 'Blog preview',
    primaryPublishLabel: 'Publish to WordPress',
    copyHtmlShort: '↗ Copy HTML',
    copyListingBundleShort: '↗ Copy field bundle',
    copyDoneCheck: '✓ Copied',
    mobileBlogCopy: 'Copy for blog',
    mobileListingCopy: 'Copy listing bundle',
    mobileCopyDone: 'Copied ✓',
    bottomCopyLabel: 'Copy for WordPress',
    openBlogPreview: 'Open blog publish preview',
    naver: {
      title: '🚀 Naver Blog (3 steps)',
      steps: [
        { step: '1', label: 'Copy HTML', desc: 'Button below' },
        { step: '2', label: 'HTML tab', desc: 'Write post' },
        { step: '3', label: 'Paste → Publish', desc: 'Ctrl+V' },
      ],
      cta: '1-click: Copy HTML + Open Naver Blog',
      ctaDone: 'HTML copied ✓ — Naver opened',
    },
    tistory: {
      title: '🟠 Tistory (3 steps)',
      steps: [
        { step: '1', label: 'Copy HTML', desc: 'Button below' },
        { step: '2', label: 'New post', desc: 'Open Tistory' },
        { step: '3', label: 'HTML mode', desc: 'Tap <>' },
      ],
      cta: '1-click: Copy HTML + Open Tistory',
      ctaDone: 'HTML copied ✓ — Tistory opened',
    },
    wordpress: {
      title: '🔵 WordPress (3 steps)',
      steps: [
        { step: '1', label: 'Copy HTML', desc: 'Button below' },
        { step: '2', label: 'Add new post', desc: 'WP admin' },
        { step: '3', label: 'HTML block', desc: 'Type /html' },
      ],
      cta: '1-click: Copy HTML + Open WordPress',
      ctaDone: 'HTML copied ✓ — WordPress opened',
    },
    instagram: {
      title: '📸 Instagram (3 steps)',
      steps: [
        { step: '1', label: 'Copy caption', desc: 'Button below' },
        { step: '2', label: 'New post', desc: 'Open Instagram' },
        { step: '3', label: 'Paste caption', desc: 'Image + caption' },
      ],
      cta: '1-click: Copy caption + Open Instagram',
      ctaDone: 'Caption copied ✓ — Instagram opened',
    },
    smartstore: {
      title: '🛒 Naver Smartstore (3 steps)',
      steps: [
        { step: '1', label: 'Copy bundle', desc: 'Button below' },
        { step: '2', label: 'New product', desc: 'Seller Center' },
        { step: '3', label: 'Paste fields', desc: 'Name, detail, SEO' },
      ],
      cta: '1-click: Copy bundle + Open Smartstore',
      ctaDone: 'Copied ✓ — Seller Center opened',
    },
    coupang: {
      title: '🟠 Coupang Wing (3 steps)',
      steps: [
        { step: '1', label: 'Copy bundle', desc: 'Button below' },
        { step: '2', label: 'Register product', desc: 'Log in to Wing' },
        { step: '3', label: 'Paste fields', desc: 'Check listing rules' },
      ],
      cta: '1-click: Copy bundle + Open Wing',
      ctaDone: 'Copied ✓ — Wing opened',
    },
    brunch: {
      line: '📋 Brunch:',
      desc: 'Copy as plain text, then paste into the Brunch editor',
      open: 'Open Brunch →',
    },
    genericHtml: {
      title: '📋 Publish HTML (3 steps)',
      steps: [
        { step: '1', label: 'Copy HTML', desc: 'Button below' },
        { step: '2', label: 'Open editor', desc: 'Your platform' },
        { step: '3', label: 'Paste HTML', desc: 'Publish' },
      ],
      cta: '1-click: Copy HTML + Open editor',
      ctaDone: 'HTML copied ✓ — Editor opened',
    },
    complianceTitle: 'Pre-publish safety check',
    complianceSub: 'Risky-claim scan + industry disclosures',
    complianceAllClear: 'No obvious risk phrases detected',
    complianceDisclaimer: 'Automated keyword scan only — not legal or regulatory advice. You are responsible for published content.',
    complianceIssues: (n) => `${n} item${n === 1 ? '' : 's'} to review`,
    complianceHigh: 'High',
    complianceMedium: 'Medium',
    complianceShow: 'Show',
    complianceHide: 'Hide',
    channelKitTitle: 'Channel publish kit',
    channelKitSub: 'Where & how this post sells',
    channelKitPlatformHint: 'Platform',
    channelKitStrategy: 'Role on this channel',
    channelKitConversion: 'Conversion tips',
    channelKitPackaging: 'Packaging checklist',
    channelKitHooks: 'Hook lines',
    channelKitCopyHook: 'Copy',
    channelKitToastHook: 'Hook copied',
    channelKitShow: 'Show',
    channelKitHide: 'Hide',
    channelKitSpecTitle: 'Channel specs',
    channelKitSpecTitleLen: 'Title & length',
    channelKitSpecBullets: 'Bullets & banned words',
    channelKitSpecImages: 'Image ratios',
    channelKitSpecFields: 'Field guide',
    channelKitCopyPasteBundle: 'Copy full paste draft',
    channelKitToastPasteBundle: 'Draft copied',
    complianceIndustryBadge: (label) => `Industry profile: ${label} — extra rules on`,
    industryGeneral: 'General',
    industryHealth: 'Health & supplements',
    industryBeauty: 'Beauty & cosmetics',
    industryFood: 'Food & beverage',
    industryFinance: 'Finance & investing',
    industryMedical: 'Medical / health-info tone',
    complianceSuggestLabel: 'Safer rewrite (example)',
    complianceDisclosureTitle: 'Industry disclosures (paste-ready)',
    complianceCopyDisclosurePack: 'Copy all disclosure text',
    complianceToastDisclosurePack: 'Disclosure block copied',
    abCopyTitle: 'Conversion A/B copy',
    abCopySub: '3 titles & openers + 2 CTAs',
    abCopyTitles: 'Title variants',
    abCopyOpeners: 'Opening lines',
    abCopyCopy: 'Copy',
    abCopyToast: 'Copied',
    abCopyApplyTitle: 'Apply to section 1 title',
    abCopyApplyOpener: 'Prepend to section 1 body',
    abCopyToastApplyTitle: 'Updated first section title',
    abCopyToastApplyOpener: 'Prepended opening to first section',
    abCopyShow: 'Show',
    abCopyHide: 'Hide',
    abCopyCtas: 'CTA variants',
    abCopyRecommend: 'Suggested combo to try first',
    abCopyApplyCta: 'Append CTA to last section',
    abCopyToastApplyCta: 'CTA added to last section',
    abCopyUtmHint: 'For landing A/B, tag UTMs (e.g. variant=ab_title2) to compare later.',
    abCopyRunnerUp: 'Second combo (conversion push)',
    abCopyApplyRecommended: 'Apply recommended combo',
    abCopyApplyRunnerUp: 'Apply 2nd combo',
    abCopyToastApplyRecommended: 'Applied recommended title, opener & CTA',
    abCopyCopyUtm: 'Copy recommended UTM query',
    abCopyToastUtm: 'UTM query copied',
    abCopyCopyExperimentSheet: 'Copy full experiment sheet',
    abCopyToastExperimentSheet: 'Experiment sheet copied',
    evidenceTitle: 'Evidence & sources',
    evidenceSub: 'For B2B decks (one-line rationale + footnote hints)',
    evidenceCopyAll: 'Copy evidence block',
    evidenceToast: 'Evidence block copied',
    assetTitle: 'Asset & thumbnail kit',
    assetSub: 'Ratio guides + short copy slots',
    assetThumbLabel: 'Thumbnail one-liners (3)',
    assetRatioLabel: 'Image ratios',
    assetSlotsLabel: 'Slot checklist',
    assetCopyAll: 'Copy full asset kit',
    intelTitle: 'Data-angle notes',
    intelSub: 'Before you plug in reviews/competitor APIs',
    intelCompetitor: 'Competitor title patterns',
    intelKeywords: 'Category keyword hints',
    intelReviewThemes: 'Review pain themes to reflect',
    intelGap: 'Automate later: review feed, category stats, competitor titles',
    intelCopyChecklist: 'Copy full checklist',
    metaOgTitle: 'Meta & OG package',
    metaOgSub: 'Search & social previews',
    metaOgCopyHtml: 'Copy HTML meta block',
    metaOgCopyJson: 'Copy JSON',
    metaOgToastHtml: 'HTML meta copied',
    metaOgToastJson: 'JSON copied',
    metaOgNote: 'og:image uses your first product image when set. Set NEXT_PUBLIC_SITE_URL for canonical URLs.',
    metaOgShow: 'Show',
    metaOgHide: 'Hide',
  },
  ja: {
    loading: 'AIが作成したページを読み込み中...',
    toastCopied: (label) => `${label}形式でコピーしました`,
    toastCopyFail: 'コピーに失敗しました。もう一度お試しください。',
    blogModalTitle: 'ブログ公開プレビュー',
    blogModalSub: 'プラットフォームを選ぶと公開後の見え方を確認できます',
    copyBtn: '↗ コピー',
    copyBtnDone: 'コピー済み ✓',
    iframeTitle: 'ブログプレビュー',
    primaryPublishLabel: 'WordPressに公開',
    copyHtmlShort: '↗ HTMLをコピー',
    copyListingBundleShort: '↗ フィールド一式をコピー',
    copyDoneCheck: '✓ コピー済み',
    mobileBlogCopy: 'ブログ用コピー',
    mobileListingCopy: '出品フィールドをコピー',
    mobileCopyDone: 'コピー済み ✓',
    bottomCopyLabel: 'WordPress用にコピー',
    openBlogPreview: 'ブログ公開プレビューを開く',
    naver: {
      title: '🚀 NAVERブログ（3ステップ）',
      steps: [
        { step: '1', label: 'HTMLコピー', desc: '下のボタン' },
        { step: '2', label: 'HTMLタブ', desc: '記事作成' },
        { step: '3', label: '貼り付け→公開', desc: 'Ctrl+V' },
      ],
      cta: '1クリック: HTMLコピー + NAVERを開く',
      ctaDone: 'HTMLコピー済み ✓ — NAVERを開きました',
    },
    tistory: {
      title: '🟠 Tistory（3ステップ）',
      steps: [
        { step: '1', label: 'HTMLコピー', desc: '下のボタン' },
        { step: '2', label: '新規投稿', desc: 'Tistoryを開く' },
        { step: '3', label: 'HTMLモード', desc: '<> をタップ' },
      ],
      cta: '1クリック: HTMLコピー + Tistoryを開く',
      ctaDone: 'HTMLコピー済み ✓ — Tistoryを開きました',
    },
    wordpress: {
      title: '🔵 WordPress（3ステップ）',
      steps: [
        { step: '1', label: 'HTMLコピー', desc: '下のボタン' },
        { step: '2', label: '新規投稿', desc: 'WP管理画面' },
        { step: '3', label: 'HTMLブロック', desc: '/html と入力' },
      ],
      cta: '1クリック: HTMLコピー + WordPressを開く',
      ctaDone: 'HTMLコピー済み ✓ — WordPressを開きました',
    },
    instagram: {
      title: '📸 Instagram（3ステップ）',
      steps: [
        { step: '1', label: 'キャプションコピー', desc: '下のボタン' },
        { step: '2', label: '新規投稿', desc: 'アプリを開く' },
        { step: '3', label: 'キャプション貼付', desc: '画像+文' },
      ],
      cta: '1クリック: キャプションコピー + Instagramを開く',
      ctaDone: 'コピー済み ✓ — Instagramを開きました',
    },
    smartstore: {
      title: '🛒 Smartstore（3ステップ）',
      steps: [
        { step: '1', label: 'フィールド一式コピー', desc: '下のボタン' },
        { step: '2', label: '商品登録', desc: 'セラーセンター' },
        { step: '3', label: '各欄に貼付', desc: '名前・詳細・SEO' },
      ],
      cta: '1クリック: コピー + Smartstoreを開く',
      ctaDone: 'コピー済み ✓ — セラーセンターを開きました',
    },
    coupang: {
      title: '🟠 Coupang Wing（3ステップ）',
      steps: [
        { step: '1', label: 'フィールド一式コピー', desc: '下のボタン' },
        { step: '2', label: '商品登録', desc: 'Wingログイン' },
        { step: '3', label: '各欄に貼付', desc: '掲載ルールを確認' },
      ],
      cta: '1クリック: コピー + Wingを開く',
      ctaDone: 'コピー済み ✓ — Wingを開きました',
    },
    brunch: {
      line: '📋 Brunch 貼り付け:',
      desc: 'プレーンテキストでコピーし、Brunchエディタに貼り付け',
      open: 'Brunchを開く →',
    },
    genericHtml: {
      title: '📋 HTML公開（3ステップ）',
      steps: [
        { step: '1', label: 'HTMLコピー', desc: '下のボタン' },
        { step: '2', label: 'エディタを開く', desc: '各プラットフォーム' },
        { step: '3', label: 'HTML貼り付け', desc: '公開' },
      ],
      cta: '1クリック: HTMLコピー + エディタを開く',
      ctaDone: 'HTMLコピー済み ✓ — エディタを開きました',
    },
    complianceTitle: '公開前チェック',
    complianceSub: '誇大・効能チェック＋業種別注意文',
    complianceAllClear: '特に注意すべき表現は見つかりませんでした',
    complianceDisclaimer: '自動キーワード検査であり法的助言ではありません。最終責任は投稿者にあります。',
    complianceIssues: (n) => `確認推奨 ${n}件`,
    complianceHigh: '高',
    complianceMedium: '中',
    complianceShow: '開く',
    complianceHide: '閉じる',
    channelKitTitle: 'チャネル公開キット',
    channelKitSub: 'どこで · どう売れるか',
    channelKitPlatformHint: 'プラットフォーム',
    channelKitStrategy: 'このチャネルでの役割',
    channelKitConversion: 'コンバージョンのコツ',
    channelKitPackaging: 'パッケージングチェック',
    channelKitHooks: 'フック文',
    channelKitCopyHook: 'コピー',
    channelKitToastHook: 'フックをコピーしました',
    channelKitShow: '開く',
    channelKitHide: '閉じる',
    channelKitSpecTitle: 'チャネル規格',
    channelKitSpecTitleLen: 'タイトル・文字数',
    channelKitSpecBullets: '箇条書き・禁止表現',
    channelKitSpecImages: '画像・比率',
    channelKitSpecFields: 'フィールド案内',
    channelKitCopyPasteBundle: '貼り付け用ドラフトをすべてコピー',
    channelKitToastPasteBundle: 'ドラフトをコピーしました',
    complianceIndustryBadge: (label) => `業種プロフィール: ${label} — 追加ルール適用`,
    industryGeneral: '一般',
    industryHealth: '健康・サプリ',
    industryBeauty: '美容・化粧品',
    industryFood: '食品',
    industryFinance: '金融・投資',
    industryMedical: '医療・健康情報のトーン',
    complianceSuggestLabel: '言い換え例',
    complianceDisclosureTitle: '業種別の注意・表示文',
    complianceCopyDisclosurePack: '注意文をすべてコピー',
    complianceToastDisclosurePack: '注意文をコピーしました',
    abCopyTitle: 'コンバージョン A/B コピー',
    abCopySub: 'タイトル・冒頭3案 + CTA 2案',
    abCopyTitles: 'タイトル案',
    abCopyOpeners: '冒頭文',
    abCopyCopy: 'コピー',
    abCopyToast: 'コピーしました',
    abCopyApplyTitle: 'セクション1の見出しに適用',
    abCopyApplyOpener: 'セクション1本文の先頭に追加',
    abCopyToastApplyTitle: '先頭セクションの見出しを更新しました',
    abCopyToastApplyOpener: '先頭に文を追加しました',
    abCopyShow: '開く',
    abCopyHide: '閉じる',
    abCopyCtas: 'CTA 2案',
    abCopyRecommend: 'まず試す組み合わせ',
    abCopyApplyCta: '最終セクション末尾にCTAを追加',
    abCopyToastApplyCta: '最終セクションにCTAを追加しました',
    abCopyUtmHint: 'ランディングA/BではUTMに variant=ab_title1 などを付けると後から集計しやすいです。',
    abCopyRunnerUp: '第2の組み合わせ（CV強化）',
    abCopyApplyRecommended: '推奨セットを一括適用',
    abCopyApplyRunnerUp: '第2セットを適用',
    abCopyToastApplyRecommended: '推奨のタイトル・冒頭・CTAを反映しました',
    abCopyCopyUtm: '推奨UTMクエリをコピー',
    abCopyToastUtm: 'UTMクエリをコピーしました',
    abCopyCopyExperimentSheet: '実験シート全体をコピー',
    abCopyToastExperimentSheet: '実験シートをコピーしました',
    evidenceTitle: '根拠・出典レイヤー',
    evidenceSub: 'B2B・提案用（1行の根拠＋脚注ヒント）',
    evidenceCopyAll: '根拠ブロックをすべてコピー',
    evidenceToast: '根拠ブロックをコピーしました',
    assetTitle: 'アセット・サムネキット',
    assetSub: '比率ガイド＋短文スロット',
    assetThumbLabel: 'サムネ一行（3案）',
    assetRatioLabel: '画像比率',
    assetSlotsLabel: 'スロットチェック',
    assetCopyAll: 'アセットキットをすべてコピー',
    intelTitle: 'データ視点メモ',
    intelSub: 'レビュー・競合API連携前のチェックリスト',
    intelCompetitor: '競合商品名のパターン',
    intelKeywords: 'カテゴリキーワードのヒント',
    intelReviewThemes: 'レビュー不満の反映ポイント',
    intelGap: '連携後の自動化例: レビュー取得・カテゴリ統計・競合タイトル収集',
    intelCopyChecklist: 'チェックリストをすべてコピー',
    metaOgTitle: 'メタ・OGパッケージ',
    metaOgSub: '検索・SNSプレビュー用',
    metaOgCopyHtml: 'HTMLメタをコピー',
    metaOgCopyJson: 'JSONをコピー',
    metaOgToastHtml: 'HTMLメタをコピーしました',
    metaOgToastJson: 'JSONをコピーしました',
    metaOgNote: 'og:imageは代表画像URLがある場合に含まれます。NEXT_PUBLIC_SITE_URLで正規URLを設定できます。',
    metaOgShow: '開く',
    metaOgHide: '閉じる',
  },
  zh: {
    loading: '正在加载 AI 生成的详情页...',
    toastCopied: (label) => `已按 ${label} 格式复制`,
    toastCopyFail: '复制失败，请重试。',
    blogModalTitle: '博客发布预览',
    blogModalSub: '选择平台即可预览发布后的效果',
    copyBtn: '↗ 复制',
    copyBtnDone: '已复制 ✓',
    iframeTitle: '博客预览',
    primaryPublishLabel: '发布到 WordPress',
    copyHtmlShort: '↗ 复制 HTML',
    copyListingBundleShort: '↗ 复制字段包',
    copyDoneCheck: '✓ 已复制',
    mobileBlogCopy: '复制博客内容',
    mobileListingCopy: '复制上架字段包',
    mobileCopyDone: '已复制 ✓',
    bottomCopyLabel: '复制 WordPress 版',
    openBlogPreview: '打开博客发布预览',
    naver: {
      title: '🚀 Naver 博客（3 步）',
      steps: [
        { step: '1', label: '复制 HTML', desc: '下方按钮' },
        { step: '2', label: 'HTML 编辑', desc: '写文章' },
        { step: '3', label: '粘贴并发布', desc: 'Ctrl+V' },
      ],
      cta: '一键：复制 HTML + 打开 Naver 博客',
      ctaDone: '已复制 HTML ✓ — 已打开 Naver',
    },
    tistory: {
      title: '🟠 Tistory（3 步）',
      steps: [
        { step: '1', label: '复制 HTML', desc: '下方按钮' },
        { step: '2', label: '新建文章', desc: '打开 Tistory' },
        { step: '3', label: 'HTML 模式', desc: '点击 <>' },
      ],
      cta: '一键：复制 HTML + 打开 Tistory',
      ctaDone: '已复制 HTML ✓ — 已打开 Tistory',
    },
    wordpress: {
      title: '🔵 WordPress（3 步）',
      steps: [
        { step: '1', label: '复制 HTML', desc: '下方按钮' },
        { step: '2', label: '新建文章', desc: 'WP 后台' },
        { step: '3', label: 'HTML 区块', desc: '输入 /html' },
      ],
      cta: '一键：复制 HTML + 打开 WordPress',
      ctaDone: '已复制 HTML ✓ — 已打开 WordPress',
    },
    instagram: {
      title: '📸 Instagram（3 步）',
      steps: [
        { step: '1', label: '复制配文', desc: '下方按钮' },
        { step: '2', label: '新帖子', desc: '打开 App' },
        { step: '3', label: '粘贴配文', desc: '图片+文字' },
      ],
      cta: '一键：复制配文 + 打开 Instagram',
      ctaDone: '已复制 ✓ — 已打开 Instagram',
    },
    smartstore: {
      title: '🛒 Smartstore（3 步）',
      steps: [
        { step: '1', label: '复制字段包', desc: '下方按钮' },
        { step: '2', label: '新建商品', desc: '卖家中心' },
        { step: '3', label: '分栏粘贴', desc: '名称·详情·SEO' },
      ],
      cta: '一键：复制 + 打开 Smartstore',
      ctaDone: '已复制 ✓ — 已打开卖家中心',
    },
    coupang: {
      title: '🟠 Coupang Wing（3 步）',
      steps: [
        { step: '1', label: '复制字段包', desc: '下方按钮' },
        { step: '2', label: '商品登记', desc: '登录 Wing' },
        { step: '3', label: '分栏粘贴', desc: '核对上架规则' },
      ],
      cta: '一键：复制 + 打开 Wing',
      ctaDone: '已复制 ✓ — 已打开 Wing',
    },
    brunch: {
      line: '📋 Brunch 粘贴：',
      desc: '以纯文本复制后粘贴到 Brunch 编辑器',
      open: '打开 Brunch →',
    },
    genericHtml: {
      title: '📋 发布 HTML（3 步）',
      steps: [
        { step: '1', label: '复制 HTML', desc: '下方按钮' },
        { step: '2', label: '打开编辑器', desc: '对应平台' },
        { step: '3', label: '粘贴 HTML', desc: '发布' },
      ],
      cta: '一键：复制 HTML + 打开编辑器',
      ctaDone: '已复制 HTML ✓ — 已打开编辑器',
    },
    complianceTitle: '发布前安全检查',
    complianceSub: '夸大与功效扫描 + 行业声明',
    complianceAllClear: '未发现明显风险用语',
    complianceDisclaimer: '仅为自动关键词扫描，不构成法律或审核意见。发布内容由您自行负责。',
    complianceIssues: (n) => `建议复核 ${n} 处`,
    complianceHigh: '高',
    complianceMedium: '中',
    complianceShow: '展开',
    complianceHide: '收起',
    channelKitTitle: '渠道发布套件',
    channelKitSub: '在哪卖 · 怎么卖',
    channelKitPlatformHint: '平台',
    channelKitStrategy: '在该渠道的角色',
    channelKitConversion: '转化提示',
    channelKitPackaging: '打包检查',
    channelKitHooks: '钩子句式',
    channelKitCopyHook: '复制',
    channelKitToastHook: '已复制钩子文案',
    channelKitShow: '展开',
    channelKitHide: '收起',
    channelKitSpecTitle: '渠道规格',
    channelKitSpecTitleLen: '标题与长度',
    channelKitSpecBullets: '要点与禁用词',
    channelKitSpecImages: '图片与比例',
    channelKitSpecFields: '字段说明',
    channelKitCopyPasteBundle: '复制完整粘贴草稿',
    channelKitToastPasteBundle: '已复制草稿',
    complianceIndustryBadge: (label) => `行业档案：${label} — 已启用额外规则`,
    industryGeneral: '通用',
    industryHealth: '健康营养',
    industryBeauty: '美妆个护',
    industryFood: '食品',
    industryFinance: '金融投资',
    industryMedical: '医疗/健康信息语气',
    complianceSuggestLabel: '替代表述示例',
    complianceDisclosureTitle: '行业必备/建议声明',
    complianceCopyDisclosurePack: '复制全部声明',
    complianceToastDisclosurePack: '已复制声明',
    abCopyTitle: '转化 A/B 文案',
    abCopySub: '标题与开头 3 套 + CTA 2 套',
    abCopyTitles: '标题方案',
    abCopyOpeners: '开头句',
    abCopyCopy: '复制',
    abCopyToast: '已复制',
    abCopyApplyTitle: '应用到第 1 节标题',
    abCopyApplyOpener: '插入到第 1 节正文开头',
    abCopyToastApplyTitle: '已更新首节标题',
    abCopyToastApplyOpener: '已在首节正文前插入',
    abCopyShow: '展开',
    abCopyHide: '收起',
    abCopyCtas: 'CTA 两套',
    abCopyRecommend: '建议先试的组合',
    abCopyApplyCta: '在最后一节末尾追加 CTA',
    abCopyToastApplyCta: '已在最后一节追加 CTA',
    abCopyUtmHint: '落地页 A/B 时可在 UTM 中加 variant=ab_title1 等，便于后续归因。',
    abCopyRunnerUp: '第二轮组合（偏转化）',
    abCopyApplyRecommended: '一键应用推荐组合',
    abCopyApplyRunnerUp: '应用第二轮组合',
    abCopyToastApplyRecommended: '已应用推荐标题、开头与 CTA',
    abCopyCopyUtm: '复制推荐 UTM 参数',
    abCopyToastUtm: '已复制 UTM',
    abCopyCopyExperimentSheet: '复制完整实验表',
    abCopyToastExperimentSheet: '已复制实验表',
    evidenceTitle: '依据与出处',
    evidenceSub: 'B2B/投标用（一句依据 + 脚注提示）',
    evidenceCopyAll: '复制依据全文',
    evidenceToast: '已复制依据块',
    assetTitle: '素材与缩略图套件',
    assetSub: '比例指南 + 短文案位',
    assetThumbLabel: '缩略图一行（3 套）',
    assetRatioLabel: '图片比例',
    assetSlotsLabel: '槽位清单',
    assetCopyAll: '复制完整素材套件',
    intelTitle: '数据角度备忘',
    intelSub: '接入评论/竞品 API 前的清单',
    intelCompetitor: '竞品标题模式',
    intelKeywords: '类目关键词提示',
    intelReviewThemes: '差评主题反思',
    intelGap: '可自动化：评论抓取、类目统计、竞品标题',
    intelCopyChecklist: '复制完整清单',
    metaOgTitle: 'Meta · OG 打包',
    metaOgSub: '搜索与社交预览',
    metaOgCopyHtml: '复制 HTML meta 块',
    metaOgCopyJson: '复制 JSON',
    metaOgToastHtml: '已复制 HTML meta',
    metaOgToastJson: '已复制 JSON',
    metaOgNote: '若有首张商品图则写入 og:image。设置 NEXT_PUBLIC_SITE_URL 可生成规范链接。',
    metaOgShow: '展开',
    metaOgHide: '收起',
  },
}

export function editorOpenUrl(p: PublishPlatform): string {
  switch (p) {
    case 'naver':
      return 'https://blog.naver.com/write.naver'
    case 'smartstore':
      return 'https://sell.smartstore.naver.com/'
    case 'coupang':
      return 'https://wing.coupang.com/'
    case 'tistory':
      return 'https://www.tistory.com/manage/newpost/'
    case 'wordpress':
      return 'https://wordpress.com/post'
    case 'medium':
      return 'https://medium.com/new-story'
    case 'shopify':
      return 'https://admin.shopify.com'
    case 'linkedin':
      return 'https://www.linkedin.com/article/new/'
    case 'instagram':
      return 'https://www.instagram.com'
    case 'brunch':
      return 'https://brunch.co.kr/write'
    default:
      return 'https://wordpress.com/post'
  }
}

export function previewFakeHost(p: PublishPlatform): string {
  switch (p) {
    case 'naver':
      return 'blog.naver.com'
    case 'smartstore':
      return 'smartstore.naver.com'
    case 'coupang':
      return 'coupang.com'
    case 'tistory':
      return 'yourblog.tistory.com'
    case 'wordpress':
      return 'yoursite.wordpress.com'
    case 'medium':
      return 'medium.com'
    case 'shopify':
      return 'your-store.myshopify.com'
    case 'linkedin':
      return 'linkedin.com'
    default:
      return 'blog.example.com'
  }
}

/** Sidebar / primary CTA colors */
export function primaryPublishStyle(p: PublishPlatform): { bg: string; hover: string; border: string; text: string } {
  if (p === 'naver') {
    return {
      bg: 'bg-[#03C75A]',
      hover: 'hover:bg-[#02b050]',
      border: 'border-[#03C75A]',
      text: 'text-[#03C75A]',
    }
  }
  if (p === 'wordpress') {
    return { bg: 'bg-[#21759B]', hover: 'hover:bg-[#1c6385]', border: 'border-[#21759B]', text: 'text-[#21759B]' }
  }
  if (p === 'smartstore') {
    return { bg: 'bg-[#03C75A]', hover: 'hover:bg-[#02b050]', border: 'border-[#03C75A]', text: 'text-[#03C75A]' }
  }
  if (p === 'coupang') {
    return { bg: 'bg-[#E65F2E]', hover: 'hover:bg-[#cf5528]', border: 'border-[#E65F2E]', text: 'text-[#c44d1f]' }
  }
  return { bg: 'bg-black', hover: 'hover:bg-gray-800', border: 'border-gray-800', text: 'text-gray-800' }
}
