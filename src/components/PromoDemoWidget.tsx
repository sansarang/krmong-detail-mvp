'use client'
import { useEffect, useRef } from 'react'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

/* ─── Scoped CSS (pdw- prefix) ─── */
const PROMO_CSS = `
.pdw-anim *{box-sizing:border-box;margin:0;padding:0;}
.pdw-anim{font-family:inherit;width:100%;}
.pdw-scene{display:none;}
.pdw-scene.on{display:flex;flex-direction:column;gap:10px;animation:pdw-fi .4s ease;}
@keyframes pdw-fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.pdw-tag{display:inline-block;font-size:10px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:.02em;}
.pdw-tpurple{background:#EEEDFE;color:#3C3489;}
.pdw-tgreen{background:#E1F5EE;color:#085041;}
.pdw-tamber{background:#FAEEDA;color:#633806;}
.pdw-h1{font-size:18px;font-weight:700;color:#111;line-height:1.3;}
.pdw-h2{font-size:15px;font-weight:700;color:#111;line-height:1.35;}
.pdw-sub{font-size:12px;color:#666;line-height:1.6;}
.pdw-em{color:#534AB7;font-weight:600;}
.pdw-card{background:#fff;border:0.5px solid #e8e8e8;border-radius:10px;padding:.75rem 1rem;}
.pdw-surf{background:#f5f5f7;border-radius:10px;padding:.75rem 1rem;}
.pdw-field-lbl{font-size:11px;font-weight:600;color:#777;margin-bottom:3px;}
.pdw-finput{height:32px;border:0.5px solid #ddd;border-radius:7px;padding:0 10px;display:flex;align-items:center;font-size:12px;color:#111;background:#fff;white-space:nowrap;overflow:hidden;}
.pdw-fta{min-height:48px;border:0.5px solid #ddd;border-radius:7px;padding:7px 10px;font-size:11px;line-height:1.55;background:#fff;color:#111;}
.pdw-lrow{display:flex;gap:5px;flex-wrap:wrap;}
.pdw-lbtn{font-size:11px;padding:4px 11px;border-radius:20px;border:0.5px solid #ddd;color:#111;background:#fff;}
.pdw-lbtn.sel{background:#534AB7;color:#fff;border-color:#534AB7;}
.pdw-gbtn{width:100%;height:38px;border-radius:7px;background:#534AB7;color:#fff;font-size:13px;font-weight:600;border:none;display:flex;align-items:center;justify-content:center;gap:5px;}
.pdw-spin{width:24px;height:24px;border:2.5px solid #eee;border-top-color:#534AB7;border-radius:50%;animation:pdw-spin .8s linear infinite;flex-shrink:0;}
@keyframes pdw-spin{to{transform:rotate(360deg)}}
.pdw-srow{display:flex;align-items:center;gap:8px;font-size:11px;color:#666;}
.pdw-dot{width:7px;height:7px;border-radius:50%;background:#e5e7eb;flex-shrink:0;transition:background .3s;}
.pdw-dot.done{background:#1D9E75;}
.pdw-dot.act{background:#534AB7;animation:pdw-pu .8s ease-in-out infinite;}
@keyframes pdw-pu{0%,100%{opacity:1}50%{opacity:.3}}
.pdw-score-big{font-size:26px;font-weight:700;color:#1D9E75;}
.pdw-sec-lbl{font-size:10px;font-weight:600;color:#888;margin-bottom:5px;}
.pdw-copy-card{background:#f5f5f7;border-radius:7px;padding:7px 9px;display:flex;flex-direction:column;gap:2px;}
.pdw-copy-lbl{font-size:9px;font-weight:700;color:#534AB7;}
.pdw-copy-txt{font-size:11px;color:#111;line-height:1.45;}
.pdw-kit-row{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
.pdw-kit-item{background:#f5f5f7;border-radius:7px;padding:7px 9px;}
.pdw-kit-title{font-size:9px;color:#888;margin-bottom:2px;}
.pdw-kit-val{font-size:10px;color:#111;line-height:1.35;}
.pdw-chitem{display:flex;justify-content:space-between;align-items:center;padding:6px 9px;border-radius:7px;border:0.5px solid #ebebeb;background:#fff;}
.pdw-chname{font-size:11px;color:#111;}
.pdw-cursor{display:inline-block;width:2px;height:12px;background:#111;margin-left:1px;animation:pdw-blink .7s step-end infinite;vertical-align:middle;}
@keyframes pdw-blink{0%,100%{opacity:1}50%{opacity:0}}
.pdw-cta-wrap{background:#f5f5f7;border-radius:12px;padding:1.25rem 1rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;}
.pdw-stats-row{display:flex;gap:7px;width:100%;}
.pdw-stat{flex:1;background:#fff;border:0.5px solid #ebebeb;border-radius:7px;padding:8px 6px;text-align:center;}
.pdw-snum{font-size:15px;font-weight:700;color:#534AB7;}
.pdw-slbl{font-size:9px;color:#888;margin-top:1px;}
.pdw-pdots{display:flex;justify-content:center;gap:5px;margin-top:6px;}
.pdw-pd{width:5px;height:5px;border-radius:50%;background:#e5e7eb;transition:background .3s;}
.pdw-pd.on{background:#534AB7;}
.pdw-scnlbl{font-size:10px;color:#bbb;text-align:center;margin-bottom:3px;}
`

type LangData = {
  aiTag: string
  headline: string
  subBefore: string; subEm: string; subAfter: string
  painLabel: string; pains: [string, string, string]
  step1Tag: string; step1Title: string
  labelName: string; labelCat: string; labelLang: string; labelDesc: string
  namePh: string; catPh: string; btnText: string
  step2Tag: string; step2Title: string
  genSteps: [string, string, string, string]
  genMsgs: [string, string, string, string]
  doneTag: string; doneTitle: string
  seoLabel: string; safeTag: string; abTag: string; checkTag: string
  tocLabel: string; toc: { color: string; name: string }[]
  abLabel: string; ab: [string, string, string]
  kitLabel: string; kit: { t: string; v: string }[]
  chanLabel: string; channels: string[]
  ctaTag: string; ctaH1: string; ctaSub: string
  stats: [string, string][]
  typedName: string; typedCat: string; typedDesc: string
  speedName: number; speedDesc: number
  /* left panel */
  leftBadge: string; leftH2: string; leftDesc: string
  leftStats: { num: string; lbl: string }[]
}

const L: Record<Lang, LangData> = {
  ko: {
    aiTag: 'AI 콘텐츠 자동화',
    headline: '돈 버는 글을\n만들어 드립니다',
    subBefore: '제품 정보만 입력하면\n', subEm: '팔리는 글', subAfter: '이 자동으로 완성됩니다',
    painLabel: '이런 고민, 있으셨죠?',
    pains: ['"상세페이지 쓰는 데 하루가 다 가요"', '"외국어 채널은 엄두가 안 나요"', '"금칙어 걸려서 글이 자꾸 내려가요"'],
    step1Tag: 'step 1 · 입력', step1Title: '제품 정보를 한 번만 입력',
    labelName: '제품/서비스명', labelCat: '카테고리', labelLang: '출력 언어', labelDesc: '제품 설명',
    namePh: '예: 제주 유기농 녹차 추출 세럼', catPh: '카테고리를 선택해주세요',
    btnText: '✦ AI 글 생성하기',
    step2Tag: 'step 2 · 생성 중', step2Title: 'AI가 글을 쓰고 있어요',
    genSteps: ['제품 정보 분석 및 타겟 파악', '후킹 헤드라인 · 본문 카피 생성', '금칙어 검사 · SEO 최적화', 'A/B 카피 · 채널 발행 키트 생성'],
    genMsgs: ['제품 정보 분석 중...', '헤드라인 카피 생성 중...', '금칙어 검사 중...', '채널 키트 조립 중...'],
    doneTag: '완성', doneTitle: '팔리는 글이 준비됐습니다',
    seoLabel: 'SEO 점수', safeTag: '금칙어 0개 · 안전', abTag: 'A/B 카피 3안', checkTag: '발행 전 점검 완료',
    tocLabel: '생성된 섹션 목차',
    toc: [{ color: '#E24B4A', name: '후킹 헤드라인' }, { color: '#534AB7', name: '고객 고민 공감' }, { color: '#534AB7', name: '서비스 소개' }, { color: '#534AB7', name: '작업/시공 과정' }, { color: '#1D9E75', name: '시공 사례/후기' }, { color: '#BA7517', name: '예약/상담 CTA' }],
    abLabel: '후킹 헤드라인 A/B/C안',
    ab: ['신차 아반떼 CN7, 일주일 만에 스크래치 생겼나요?', '시공 센터 견적 150만원, 부담스럽지 않으셨나요?', 'PPF 자가복원 필름 6개월 실사용 정리'],
    kitLabel: '채널 발행 키트',
    kit: [{ t: '네이버 블로그', v: '썸네일 문구 3안 + 금칙어 가이드' }, { t: '스마트스토어', v: '상품명 · 태그 · 첫 문장 3안' }, { t: '쿠팡 윙', v: '슬롯 플랜 + 초단문 3안' }, { t: 'B2B 레이어', v: '경영진 요약 + 각주 + 슬라이드' }],
    chanLabel: '언어별 발행 상태', channels: ['🇰🇷 한국어', '🇺🇸 English', '🇯🇵 日本語', '🇨🇳 中文'],
    ctaTag: 'AI 콘텐츠 자동화', ctaH1: '입력 한 번,\n돈 버는 글 완성', ctaSub: '글 작성 · 분석 · 채널 배포\n한 번에',
    stats: [['3분', '평균 생성 시간'], ['4개', '동시 언어'], ['86점', 'SEO 점수']],
    typedName: '현대 아반떼 CN7 전용 PPF 자가복원 보호필름',
    typedCat: '자동차 시공 (썬팅/랩핑/블박)',
    typedDesc: '신차 도장 보호용 8mil TPU PPF. 자가복원·황변방지 UV코팅·전용 도면 컷팅.',
    speedName: 45, speedDesc: 28,
    leftBadge: '실제 서비스 데모',
    leftH2: '입력하면\nAI가 알아서 씁니다',
    leftDesc: '제품명과 설명만 넣으면 AI가 후킹 헤드라인, SEO 최적화 카피, A/B 3안, 4개 언어 발행 키트까지 3분 만에 완성합니다.',
    leftStats: [{ num: '3분', lbl: '평균 완성' }, { num: '4개 언어', lbl: '동시 발행' }, { num: '86점', lbl: '평균 SEO' }],
  },
  en: {
    aiTag: 'AI Content Automation',
    headline: 'Copy that\nsells for you',
    subBefore: 'Enter your product info once and\n', subEm: 'high-converting content', subAfter: ' is ready instantly',
    painLabel: 'Sound familiar?',
    pains: ['"Writing a product page takes all day"', '"Going multilingual feels impossible"', '"Listings keep getting flagged or removed"'],
    step1Tag: 'step 1 · input', step1Title: 'Enter your product info once',
    labelName: 'Product / Service', labelCat: 'Category', labelLang: 'Output Language', labelDesc: 'Description',
    namePh: 'e.g. Vitamin C Brightening Face Serum', catPh: 'Select a category',
    btnText: '✦ Generate with AI',
    step2Tag: 'step 2 · generating', step2Title: 'AI is writing your content',
    genSteps: ['Analyzing product & target audience', 'Generating hook headlines & body copy', 'Checking restricted words · SEO tuning', 'Building A/B copy · channel publish kit'],
    genMsgs: ['Analyzing product info...', 'Generating headline copy...', 'Checking restricted words...', 'Assembling channel kit...'],
    doneTag: 'done', doneTitle: 'Your high-converting copy is ready',
    seoLabel: 'SEO Score', safeTag: '0 flagged words · safe', abTag: '3 A/B variants', checkTag: 'Pre-publish check done',
    tocLabel: 'Generated section outline',
    toc: [{ color: '#E24B4A', name: 'Hook Headline' }, { color: '#534AB7', name: 'Pain Point Empathy' }, { color: '#534AB7', name: 'Service Overview' }, { color: '#534AB7', name: 'How It Works' }, { color: '#1D9E75', name: 'Case Studies / Reviews' }, { color: '#BA7517', name: 'Booking / CTA' }],
    abLabel: 'Hook Headline A/B/C variants',
    ab: ['New car scratched within a week? Here\'s the fix.', 'Paint shop quote $1,200 — Is it really worth it?', 'PPF vs wrap: real-world comparison after 6 months'],
    kitLabel: 'Channel publish kit',
    kit: [{ t: 'Amazon / Shopify', v: '3 title variants + keyword guide' }, { t: 'Instagram', v: 'Caption hook + 5 hashtag sets' }, { t: 'WordPress', v: 'Full HTML export + SEO meta' }, { t: 'B2B Deck', v: 'Exec summary + footnotes + slides' }],
    chanLabel: 'Publish status by language', channels: ['🇰🇷 한국어', '🇺🇸 English', '🇯🇵 日本語', '🇨🇳 中文'],
    ctaTag: 'AI Content Automation', ctaH1: 'One input.\nHigh-converting copy done.', ctaSub: 'Writing · Analysis · Publishing\nall in one',
    stats: [['3 min', 'avg generation'], ['4 langs', 'simultaneous'], ['86 pts', 'avg SEO']],
    typedName: 'Hyundai Avante CN7 Custom PPF Self-Healing Film',
    typedCat: 'Auto Detailing (Tint / Wrap / PPF)',
    typedDesc: '8mil TPU self-healing PPF for new car paint. Anti-yellowing UV coating + precision-cut templates.',
    speedName: 40, speedDesc: 26,
    leftBadge: 'Live service demo',
    leftH2: 'Type it in,\nAI handles the rest.',
    leftDesc: 'Enter your product name and description. AI generates hook headlines, SEO-optimized copy, 3 A/B variants, and a 4-language publish kit — all in 3 minutes.',
    leftStats: [{ num: '3 min', lbl: 'avg completion' }, { num: '4 langs', lbl: 'simultaneous' }, { num: '86 pts', lbl: 'avg SEO score' }],
  },
  ja: {
    aiTag: 'AIコンテンツ自動化',
    headline: '売れる文章を\n自動で作ります',
    subBefore: '商品情報を入力するだけで\n', subEm: '成約につながる文章', subAfter: 'が自動で完成',
    painLabel: 'こんなお悩み、ありませんか？',
    pains: ['"商品ページ作成に丸一日かかる"', '"外国語対応なんて無理だと思ってた"', '"ガイドライン違反で出品が削除された"'],
    step1Tag: 'step 1 · 入力', step1Title: '商品情報を一度だけ入力',
    labelName: '商品名・サービス名', labelCat: 'カテゴリ', labelLang: '出力言語', labelDesc: '商品説明',
    namePh: '例: 済州島オーガニック緑茶美容液', catPh: 'カテゴリを選択',
    btnText: '✦ AIで文章を生成',
    step2Tag: 'step 2 · 生成中', step2Title: 'AIが文章を書いています',
    genSteps: ['商品情報の分析・ターゲット把握', 'フックヘッドライン・本文コピー生成', '禁止ワード確認・SEO最適化', 'A/Bコピー・チャネル発行キット生成'],
    genMsgs: ['商品情報を分析中...', 'ヘッドラインを生成中...', '禁止ワードを確認中...', 'チャネルキットを構築中...'],
    doneTag: '完成', doneTitle: '売れる文章が準備できました',
    seoLabel: 'SEOスコア', safeTag: '禁止ワード0件・安全', abTag: 'A/Bコピー3案', checkTag: '発行前チェック完了',
    tocLabel: '生成されたセクション',
    toc: [{ color: '#E24B4A', name: 'フックヘッドライン' }, { color: '#534AB7', name: 'お客様の悩みへの共感' }, { color: '#534AB7', name: 'サービス紹介' }, { color: '#534AB7', name: '施工プロセス' }, { color: '#1D9E75', name: '施工事例・口コミ' }, { color: '#BA7517', name: '予約・相談CTA' }],
    abLabel: 'ヘッドライン A/B/C案',
    ab: ['新車アベンテCN7、1週間でキズが入っていませんか？', '施工センター見積もり15万円、高すぎませんか？', 'PPFフィルム vs コーティング：6ヶ月実使用レポート'],
    kitLabel: 'チャネル発行キット',
    kit: [{ t: 'アメブロ / WordPress', v: 'サムネイル文3案 + 禁止ワード' }, { t: 'メルカリ / 楽天', v: '商品名 · タグ · 冒頭文3案' }, { t: 'Instagram', v: 'キャプション + ハッシュタグ5セット' }, { t: 'B2B資料', v: '経営陣要約 + 脚注 + スライド' }],
    chanLabel: '言語別発行状況', channels: ['🇰🇷 한국어', '🇺🇸 English', '🇯🇵 日本語', '🇨🇳 中文'],
    ctaTag: 'AIコンテンツ自動化', ctaH1: '入力1回で\n売れる文章が完成', ctaSub: '文章作成・分析・チャネル配信\n一括解決',
    stats: [['3分', '平均生成時間'], ['4言語', '同時対応'], ['86点', '平均SEO']],
    typedName: '現代アベンテCN7専用PPF自己修復フィルム',
    typedCat: '自動車施工（カーフィルム/ラッピング）',
    typedDesc: '新車塗装保護用8mil TPU PPF。自己修復・黄変防止UVコーティング・専用テンプレート。',
    speedName: 42, speedDesc: 28,
    leftBadge: 'サービスデモ',
    leftH2: '入力するだけで\nAIが書いてくれます',
    leftDesc: '商品名と説明を入れるだけ。AIがフックヘッドライン、SEO最適化コピー、A/B3案、4言語発行キットを3分で完成させます。',
    leftStats: [{ num: '3分', lbl: '平均完成' }, { num: '4言語', lbl: '同時発行' }, { num: '86点', lbl: '平均SEO' }],
  },
  zh: {
    aiTag: 'AI内容自动化',
    headline: '帮您写出\n卖货的文案',
    subBefore: '只需输入产品信息，\n', subEm: '高转化文案', subAfter: '自动生成',
    painLabel: '这些烦恼，您有吗？',
    pains: ['"写一篇商品详情页要花一整天"', '"想做多语言渠道，无从下手"', '"内容老被平台判定违规下架"'],
    step1Tag: 'step 1 · 输入', step1Title: '只需输入一次产品信息',
    labelName: '产品/服务名称', labelCat: '类目', labelLang: '输出语言', labelDesc: '产品描述',
    namePh: '例：济州岛有机绿茶提取精华液', catPh: '请选择类目',
    btnText: '✦ AI 生成文案',
    step2Tag: 'step 2 · 生成中', step2Title: 'AI 正在撰写您的文案',
    genSteps: ['分析产品信息与目标人群', '生成钩子标题与正文文案', '敏感词检查 · SEO优化', 'A/B文案 · 多渠道发布套件'],
    genMsgs: ['正在分析产品信息...', '正在生成标题文案...', '正在检查违禁词...', '正在组装渠道套件...'],
    doneTag: '完成', doneTitle: '您的高转化文案已准备好',
    seoLabel: 'SEO评分', safeTag: '0个违禁词 · 安全', abTag: '3套A/B文案', checkTag: '发布前检查完成',
    tocLabel: '生成的板块目录',
    toc: [{ color: '#E24B4A', name: '钩子标题' }, { color: '#534AB7', name: '痛点共鸣' }, { color: '#534AB7', name: '产品介绍' }, { color: '#534AB7', name: '使用流程' }, { color: '#1D9E75', name: '用户评价/案例' }, { color: '#BA7517', name: '立即购买 CTA' }],
    abLabel: '钩子标题 A/B/C方案',
    ab: ['新车买来不到一周，就有划痕了？', '4S店钣喷报价8000元，您心疼吗？', 'PPF贴膜 vs 镀晶：6个月真实对比报告'],
    kitLabel: '多渠道发布套件',
    kit: [{ t: '淘宝 / 京东', v: '3套标题 + 违禁词指南' }, { t: '小红书', v: '种草文案 + 5组话题标签' }, { t: '微信公众号', v: '完整图文排版 + SEO' }, { t: 'B2B方案', v: '高管摘要 + 数据注释 + PPT' }],
    chanLabel: '各语言发布状态', channels: ['🇰🇷 한국어', '🇺🇸 English', '🇯🇵 日本語', '🇨🇳 中文'],
    ctaTag: 'AI内容自动化', ctaH1: '一次输入，\n卖货文案搞定', ctaSub: '文案撰写 · 分析 · 多渠道发布\n一站式解决',
    stats: [['3分钟', '平均生成'], ['4语言', '同时支持'], ['86分', '平均SEO']],
    typedName: '现代伊兰特CN7专用PPF自修复保护膜',
    typedCat: '汽车改装（贴膜/车身改色）',
    typedDesc: '8mil TPU新车漆面专用PPF，自修复+防黄变UV涂层+专属模板精准裁切。',
    speedName: 38, speedDesc: 26,
    leftBadge: '服务实时演示',
    leftH2: '输入一次，\n文案自动搞定',
    leftDesc: '只需输入产品名和描述，AI就能在3分钟内生成钩子标题、SEO优化文案、3套A/B方案和4语言发布套件。',
    leftStats: [{ num: '3分钟', lbl: '平均完成' }, { num: '4语言', lbl: '同时发布' }, { num: '86分', lbl: '平均SEO' }],
  },
}

export default function PromoDemoWidget({ lang = 'ko' }: { lang?: Lang }) {
  const animRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const styleId = 'pdw-styles'
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style')
      s.id = styleId
      s.textContent = PROMO_CSS
      document.head.appendChild(s)
    }
  }, [])

  useEffect(() => {
    const anim = animRef.current
    if (!anim) return
    const d = L[lang]
    const timers: ReturnType<typeof setTimeout>[] = []
    const intervals: ReturnType<typeof setInterval>[] = []

    function q<T extends Element = Element>(sel: string) { return anim!.querySelector<T>(sel) }

    function showScene(n: number) {
      anim!.querySelectorAll('.pdw-scene').forEach((s, i) => s.classList.toggle('on', i === n))
      const sl = q('#pdw-SL'); if (sl) sl.textContent = `${n + 1} / 5`
      anim!.querySelectorAll('.pdw-pd').forEach((pd, i) => pd.classList.toggle('on', i === n))
    }

    function typeInto(el: Element, text: string, speed: number, cb?: () => void) {
      el.innerHTML = ''
      let i = 0
      const cur = document.createElement('span'); cur.className = 'pdw-cursor'; el.appendChild(cur)
      const t = setInterval(() => {
        el.insertBefore(document.createTextNode(text[i]), cur); i++
        if (i >= text.length) { clearInterval(t); cur.remove(); cb?.() }
      }, speed)
      intervals.push(t)
    }

    function runS1() {
      showScene(1)
      const f1 = q('#pdw-fi1'), f2 = q('#pdw-fi2'), f3 = q('#pdw-fi3')
      if (!f1 || !f2 || !f3) return
      f1.innerHTML = `<span style="color:#aaa">${d.namePh}</span>`
      f2.textContent = d.catPh; (f2 as HTMLElement).style.color = '#aaa'
      f3.textContent = ''
      anim!.querySelectorAll('#pdw-langrow .pdw-lbtn').forEach(l => l.classList.remove('sel'))
      timers.push(setTimeout(() => {
        typeInto(f1, d.typedName, d.speedName, () => {
          timers.push(setTimeout(() => {
            f2.textContent = d.typedCat; (f2 as HTMLElement).style.color = '#111'
            timers.push(setTimeout(() => {
              const btns = anim!.querySelectorAll('#pdw-langrow .pdw-lbtn')
              btns.forEach((btn, idx) => timers.push(setTimeout(() => btn.classList.add('sel'), idx * 180)))
              timers.push(setTimeout(() => {
                typeInto(f3, d.typedDesc, d.speedDesc, () => timers.push(setTimeout(runS2, 900)))
              }, btns.length * 180 + 200))
            }, 350))
          }, 280))
        })
      }, 450))
    }

    function runS2() {
      showScene(2)
      const dots = [0, 1, 2, 3].map(i => q(`#pdw-d${i}`))
      const msgEl = q('#pdw-genMsg')
      dots.forEach(dot => { if (dot) dot.className = 'pdw-dot' })
      let step = 0
      if (dots[0]) dots[0]!.className = 'pdw-dot act'
      if (msgEl) msgEl.textContent = d.genMsgs[0]
      const t = setInterval(() => {
        if (dots[step]) dots[step]!.className = 'pdw-dot done'; step++
        if (step < 4) { if (dots[step]) dots[step]!.className = 'pdw-dot act'; if (msgEl) msgEl.textContent = d.genMsgs[step] }
        else { clearInterval(t); timers.push(setTimeout(runS3, 450)) }
      }, 700)
      intervals.push(t)
    }

    function runS3() {
      showScene(3)
      const chrow = q('#pdw-chrow'); if (!chrow) return
      chrow.innerHTML = ''
      d.channels.forEach((ch, i) => {
        const item = document.createElement('div'); item.className = 'pdw-chitem'
        item.innerHTML = `<span class="pdw-chname">${ch}</span><div style="width:6px;height:6px;border-radius:50%;background:#e5e7eb;" id="pdw-cd${i}"></div>`
        chrow.appendChild(item)
        timers.push(setTimeout(() => { const dot = anim!.querySelector(`#pdw-cd${i}`); if (dot) (dot as HTMLElement).style.background = '#1D9E75' }, 250 + i * 350))
      })
      timers.push(setTimeout(runS4, 3800))
    }

    function runS4() { showScene(4); timers.push(setTimeout(runS1, 3200)) }

    showScene(0); timers.push(setTimeout(runS1, 2800))
    return () => { timers.forEach(t => clearTimeout(t)); intervals.forEach(t => clearInterval(t)) }
  }, [lang])

  const d = L[lang]

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-5 md:px-6">

        {/* heading */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">{d.leftBadge}</p>
          <h2
            className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3"
            style={{ whiteSpace: 'pre-line' }}
          >
            {d.leftH2}
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">
            {d.leftDesc}
          </p>
        </div>

        {/* stats row */}
        <div className="flex justify-center gap-6 md:gap-10 mb-10 md:mb-14">
          {d.leftStats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-indigo-600">{s.num}</div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* phone mockup */}
        <div className="flex justify-center">
          <div
            className="relative"
            style={{
              width: 'min(360px, 100%)',
              background: '#1a1a1a',
              borderRadius: 40,
              padding: '14px 10px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* phone notch */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{ width: 90, height: 26, background: '#111', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2a2a2a' }} />
                <div style={{ width: 28, height: 8, borderRadius: 4, background: '#2a2a2a' }} />
              </div>
            </div>

            {/* screen */}
            <div
              style={{
                background: '#fff',
                borderRadius: 26,
                overflow: 'hidden',
                minHeight: 520,
              }}
            >
              {/* status bar */}
              <div style={{ background: '#fff', padding: '8px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>9:41</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ width: 14, height: 8, border: '1.5px solid #333', borderRadius: 2, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: '70%', background: '#333', borderRadius: 1 }} />
                    <div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 2, height: 4, background: '#333', borderRadius: 1 }} />
                  </div>
                </div>
              </div>

              {/* app content */}
              <div ref={animRef} className="pdw-anim" style={{ padding: '6px 12px 12px' }}>
                <div className="pdw-scnlbl" id="pdw-SL">1 / 5</div>

                {/* S0 */}
                <div className="pdw-scene on" id="pdw-s0">
                  <div style={{ padding: '.8rem 0 .3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div className="pdw-tag pdw-tpurple">{d.aiTag}</div>
                    <div className="pdw-h1" style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{d.headline}</div>
                    <div className="pdw-sub" style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{d.subBefore}<span className="pdw-em">{d.subEm}</span>{d.subAfter}</div>
                  </div>
                  <div className="pdw-surf" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#777' }}>{d.painLabel}</div>
                    {d.pains.map((p, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#666', padding: '7px 10px', background: '#fff', borderRadius: 7, border: '0.5px solid #ebebeb' }}>{p}</div>
                    ))}
                  </div>
                </div>

                {/* S1 */}
                <div className="pdw-scene" id="pdw-s1">
                  <div className="pdw-tag pdw-tpurple">{d.step1Tag}</div>
                  <div className="pdw-h2">{d.step1Title}</div>
                  <div className="pdw-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div><div className="pdw-field-lbl">{d.labelName}</div><div className="pdw-finput" id="pdw-fi1"><span style={{ color: '#aaa' }}>{d.namePh}</span></div></div>
                    <div><div className="pdw-field-lbl">{d.labelCat}</div><div className="pdw-finput" id="pdw-fi2" style={{ color: '#aaa' }}>{d.catPh}</div></div>
                    <div>
                      <div className="pdw-field-lbl">{d.labelLang}</div>
                      <div className="pdw-lrow" id="pdw-langrow">
                        {['🇰🇷', '🇺🇸', '🇯🇵', '🇨🇳'].map((f, i) => <div key={i} className="pdw-lbtn">{f}</div>)}
                      </div>
                    </div>
                    <div><div className="pdw-field-lbl">{d.labelDesc}</div><div className="pdw-fta" id="pdw-fi3" /></div>
                    <div className="pdw-gbtn">{d.btnText}</div>
                  </div>
                </div>

                {/* S2 */}
                <div className="pdw-scene" id="pdw-s2">
                  <div className="pdw-tag pdw-tpurple">{d.step2Tag}</div>
                  <div className="pdw-h2">{d.step2Title}</div>
                  <div className="pdw-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="pdw-spin" />
                      <div style={{ fontSize: 12, color: '#666' }} id="pdw-genMsg">{d.genMsgs[0]}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {d.genSteps.map((step, i) => (
                        <div key={i} className="pdw-srow"><div className="pdw-dot" id={`pdw-d${i}`} /><span>{step}</span></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* S3 */}
                <div className="pdw-scene" id="pdw-s3">
                  <div className="pdw-tag pdw-tgreen">{d.doneTag}</div>
                  <div className="pdw-h2">{d.doneTitle}</div>
                  <div className="pdw-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#888', marginBottom: 1 }}>{d.seoLabel}</div>
                        <div className="pdw-score-big">86</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                        <div className="pdw-tag pdw-tgreen">{d.safeTag}</div>
                        <div className="pdw-tag pdw-tpurple">{d.abTag}</div>
                        <div className="pdw-tag pdw-tamber">{d.checkTag}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: '0.5px solid #ebebeb', paddingTop: 8 }}>
                      <div className="pdw-sec-lbl">{d.tocLabel}</div>
                      {d.toc.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#111', marginBottom: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />{item.name}
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '0.5px solid #ebebeb', paddingTop: 8 }}>
                      <div className="pdw-sec-lbl">{d.abLabel}</div>
                      {(['A', 'B', 'C'] as const).map((lbl, i) => (
                        <div key={lbl} className="pdw-copy-card" style={{ marginBottom: 4 }}>
                          <div className="pdw-copy-lbl">{lbl}</div>
                          <div className="pdw-copy-txt">{d.ab[i]}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '0.5px solid #ebebeb', paddingTop: 8 }}>
                      <div className="pdw-sec-lbl">{d.chanLabel}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }} id="pdw-chrow" />
                    </div>
                  </div>
                </div>

                {/* S4 */}
                <div className="pdw-scene" id="pdw-s4">
                  <div className="pdw-cta-wrap">
                    <div className="pdw-tag pdw-tpurple">{d.ctaTag}</div>
                    <div className="pdw-h1" style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{d.ctaH1}</div>
                    <div className="pdw-sub" style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{d.ctaSub}</div>
                    <div className="pdw-stats-row">
                      {d.stats.map(([num, lbl], i) => (
                        <div key={i} className="pdw-stat"><div className="pdw-snum">{num}</div><div className="pdw-slbl">{lbl}</div></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pdw-pdots">
                  {[0, 1, 2, 3, 4].map(i => <div key={i} className={`pdw-pd${i === 0 ? ' on' : ''}`} />)}
                </div>
              </div>
            </div>

            {/* home indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
              <div style={{ width: 100, height: 4, background: '#444', borderRadius: 2 }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
