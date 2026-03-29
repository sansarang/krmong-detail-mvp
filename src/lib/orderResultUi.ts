import type { UiLang } from '@/lib/uiLocale'

export type PublishPlatform =
  | 'naver'
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
  { id: 'tistory', icon: 'T', label: '티스토리', desc: 'HTML 모드에 붙여넣기' },
  { id: 'brunch', icon: 'B', label: '브런치', desc: '일반 텍스트 붙여넣기' },
  { id: 'wordpress', icon: 'W', label: 'WordPress', desc: 'HTML / 커스텀 HTML 블록에 붙여넣기' },
  { id: 'medium', icon: 'M', label: 'Medium', desc: '스토리 에디터에 HTML 붙여넣기' },
  { id: 'shopify', icon: 'S', label: 'Shopify', desc: '상품 설명(HTML)에 붙여넣기' },
  { id: 'linkedin', icon: 'in', label: 'LinkedIn', desc: '아티클 에디터에 붙여넣기' },
  { id: 'instagram', icon: '📸', label: '인스타그램', desc: '캡션에 붙여넣기' },
]

const EN: PlatformRow[] = [
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
  copyDoneCheck: string
  mobileBlogCopy: string
  mobileCopyDone: string
  bottomCopyLabel: string
  openBlogPreview: string
  naver: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  tistory: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  wordpress: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
  instagram: { title: string; steps: PublishStep[]; cta: string; ctaDone: string }
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
    copyDoneCheck: '✓ 복사됨',
    mobileBlogCopy: '블로그 복사',
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
    complianceSub: '과장·효능 표현 휴리스틱',
    complianceAllClear: '눈에 띄는 리스크 문구가 없습니다',
    complianceDisclaimer: '자동 키워드 검사이며 법률·심의 판단이 아닙니다. 최종 책임은 게시자에게 있습니다.',
    complianceIssues: (n) => `확인 권장 ${n}건`,
    complianceHigh: '높음',
    complianceMedium: '중간',
    complianceShow: '펼치기',
    complianceHide: '접기',
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
    copyDoneCheck: '✓ Copied',
    mobileBlogCopy: 'Copy for blog',
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
    complianceSub: 'Heuristic scan for risky claims',
    complianceAllClear: 'No obvious risk phrases detected',
    complianceDisclaimer: 'Automated keyword scan only — not legal or regulatory advice. You are responsible for published content.',
    complianceIssues: (n) => `${n} item${n === 1 ? '' : 's'} to review`,
    complianceHigh: 'High',
    complianceMedium: 'Medium',
    complianceShow: 'Show',
    complianceHide: 'Hide',
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
    copyDoneCheck: '✓ コピー済み',
    mobileBlogCopy: 'ブログ用コピー',
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
    complianceSub: '誇大・効能表現のヒューリスティック',
    complianceAllClear: '特に注意すべき表現は見つかりませんでした',
    complianceDisclaimer: '自動キーワード検査であり法的助言ではありません。最終責任は投稿者にあります。',
    complianceIssues: (n) => `確認推奨 ${n}件`,
    complianceHigh: '高',
    complianceMedium: '中',
    complianceShow: '開く',
    complianceHide: '閉じる',
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
    copyDoneCheck: '✓ 已复制',
    mobileBlogCopy: '复制博客内容',
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
    complianceSub: '夸大与功效表述启发式扫描',
    complianceAllClear: '未发现明显风险用语',
    complianceDisclaimer: '仅为自动关键词扫描，不构成法律或审核意见。发布内容由您自行负责。',
    complianceIssues: (n) => `建议复核 ${n} 处`,
    complianceHigh: '高',
    complianceMedium: '中',
    complianceShow: '展开',
    complianceHide: '收起',
  },
}

export function editorOpenUrl(p: PublishPlatform): string {
  switch (p) {
    case 'naver':
      return 'https://blog.naver.com/write.naver'
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
  return { bg: 'bg-black', hover: 'hover:bg-gray-800', border: 'border-gray-800', text: 'text-gray-800' }
}
