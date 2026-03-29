'use client'
import { useEffect, useState } from 'react'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

type Sec = { name: string; title: string; color: string }

type Plat = { id: string; label: string; icon: string; bg: string; text: string }

type Copy = {
  name: string
  cat: string
  desc: string
  step: string
  labelName: string
  labelCat: string
  catPlaceholder: string
  labelDesc: string
  labelPhoto: string
  uploadIdle: string
  uploadOk: string
  btnGenerating: string
  btnDone: string
  btnStart: string
  statusGen: string
  statusDone: string
  previewIdle: string
  previewHint: string
  genLine1: string
  genLine2: string
  seoScore: string
  seoGood: string
  seoMid: string
  seoWait: string
  seoTags: string[]
  publishTitle: string
  publishReady: (label: string) => string
  footer: string
  sections: Sec[]
  platforms: Plat[]
  blogPublishTitle: string
  blogPublishLead: string
  blogFlow1: string
  blogFlow2: string
  blogFlow3: string
  blogCodeLabel: string
  blogRenderedLabel: string
  blogKeyPoint: string
  blogCopyHint: string
  /** 짧은 HTML 조각 — 타이핑 연출용 */
  blogHtmlSample: string
  blogMockBuy: string
  blogMockBtn: string
  blogDisclaimer: string
}

const COPY: Record<Lang, Copy> = {
  ko: {
    name: '제주 유기농 녹차 추출 세럼',
    cat: '뷰티/화장품',
    desc: '피부 진정과 보습에 탁월한 제주산 녹차 성분...',
    step: 'STEP 1 · 입력',
    labelName: '제품명',
    labelCat: '카테고리',
    catPlaceholder: '카테고리 선택...',
    labelDesc: '제품 설명',
    labelPhoto: '제품 사진',
    uploadIdle: '사진 업로드',
    uploadOk: '✓ 업로드 완료',
    btnGenerating: 'AI가 생성 중...',
    btnDone: '생성 완료',
    btnStart: 'AI 상세페이지 생성 →',
    statusGen: 'Claude AI 분석 중...',
    statusDone: '생성 완료 · 45초 소요',
    previewIdle: 'AI 미리보기',
    previewHint: '제품 정보를 입력하면\nAI가 자동 생성합니다',
    genLine1: 'Claude AI 분석 중',
    genLine2: '6개 섹션 카피라이팅 생성 중...',
    seoScore: 'SEO 점수',
    seoGood: '최상위 수준 🟢',
    seoMid: '우수 🟡',
    seoWait: '분석 중...',
    seoTags: ['키워드', '제목', '본문', 'CTA'],
    publishTitle: '📤 1-click 발행',
    publishReady: (l) => `${l}에 발행 준비 완료 ✓`,
    footer: '실제 서비스 작동 방식 시뮬레이션 · 자동 반복',
    sections: [
      { name: '후킹 헤드라인', title: '피부가 보내는 SOS 신호, 무시하고 계신가요?', color: '#FF5C35' },
      { name: '제품 소개', title: '3중 녹차 성분이 다른 이유', color: '#6366F1' },
      { name: '핵심 특징', title: '비건 인증 × 피부과 테스트 완료', color: '#10B981' },
      { name: '추천 대상', title: '이런 분께 꼭 맞습니다', color: '#3B82F6' },
      { name: '고객 후기', title: '"자극 없이 촉촉해졌어요"', color: '#F59E0B' },
      { name: '구매 유도', title: '지금 바로 — 첫 구매 20% 할인', color: '#8B5CF6' },
    ],
    platforms: [
      { id: 'naver', label: '네이버 블로그', icon: 'N', bg: '#03C75A', text: '#fff' },
      { id: 'tistory', label: '티스토리', icon: 'T', bg: '#F26522', text: '#fff' },
      { id: 'instagram', label: '인스타그램', icon: '📸', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', text: '#fff' },
      { id: 'wordpress', label: '워드프레스', icon: 'W', bg: '#21759B', text: '#fff' },
    ],
    blogPublishTitle: 'HTML로 붙여넣으면, AI가 쓴 글이 그대로 보입니다',
    blogPublishLead: '네이버는 글쓰기 화면에서 「HTML」 탭에 코드를 붙입니다. 임시저장함에 초안이 쌓이고, 붙여넣은 뒤에는 코드가 아니라 완성된 글이 보입니다.',
    blogFlow1: '① PageAI에서 생성된 HTML 전체 복사',
    blogFlow2: '② 네이버 블로그 글쓰기 → HTML 편집 탭',
    blogFlow3: '③ Ctrl+V 붙여넣기 → 임시저장 후 발행',
    blogCodeLabel: 'HTML 편집 탭에 붙는 코드',
    blogRenderedLabel: '붙여넣은 직후 화면에 보이는 글',
    blogKeyPoint: '핵심: <div>, <p> 같은 태그 대신 AI가 작성한 제목·본문·레이아웃이 그대로 렌더링됩니다.',
    blogCopyHint: 'HTML 복사',
    blogHtmlSample: '<div class="post">\n  <h1>제주 유기농 녹차 세럼</h1>\n  <p>피부 진정과 보습...</p>\n  <div class="cta">지금 구매하기 →</div>\n</div>',
    blogMockBuy: '지금 바로 구매하러 가기 →',
    blogMockBtn: '구매 링크 바로가기',
    blogDisclaimer: '본 포스팅은 페이지AI로 자동 생성된 콘텐츠입니다',
  },
  en: {
    name: 'Jeju Organic Green Tea Serum',
    cat: 'Beauty / Cosmetics',
    desc: 'Jeju green tea soothes and hydrates sensitive skin...',
    step: 'STEP 1 · Input',
    labelName: 'Product name',
    labelCat: 'Category',
    catPlaceholder: 'Select category...',
    labelDesc: 'Description',
    labelPhoto: 'Photos',
    uploadIdle: 'Upload photo',
    uploadOk: '✓ Uploaded',
    btnGenerating: 'AI generating...',
    btnDone: 'Done',
    btnStart: 'Generate with AI →',
    statusGen: 'Claude AI analyzing...',
    statusDone: 'Done · 45s',
    previewIdle: 'AI preview',
    previewHint: 'Enter your product info\nand AI builds the page',
    genLine1: 'Claude AI working',
    genLine2: 'Writing 6 sections...',
    seoScore: 'SEO score',
    seoGood: 'Top tier 🟢',
    seoMid: 'Strong 🟡',
    seoWait: 'Analyzing...',
    seoTags: ['Keywords', 'Title', 'Body', 'CTA'],
    publishTitle: '📤 1-click publish',
    publishReady: (l) => `Ready for ${l} ✓`,
    footer: 'Live demo simulation · loops automatically',
    sections: [
      { name: 'Hook', title: 'Is your skin sending SOS signals?', color: '#FF5C35' },
      { name: 'Product', title: 'Why our triple green tea blend works', color: '#6366F1' },
      { name: 'Features', title: 'Vegan × dermatologist tested', color: '#10B981' },
      { name: 'Who it\'s for', title: 'Perfect if this sounds like you', color: '#3B82F6' },
      { name: 'Reviews', title: '"Zero irritation, so hydrating"', color: '#F59E0B' },
      { name: 'CTA', title: 'Today only — 20% off first order', color: '#8B5CF6' },
    ],
    platforms: [
      { id: 'wordpress', label: 'WordPress', icon: 'W', bg: '#21759B', text: '#fff' },
      { id: 'shopify', label: 'Shopify', icon: 'S', bg: '#96BF48', text: '#fff' },
      { id: 'medium', label: 'Medium', icon: 'M', bg: '#000000', text: '#fff' },
      { id: 'instagram', label: 'Instagram', icon: '📸', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', text: '#fff' },
    ],
    blogPublishTitle: 'Paste HTML — your AI draft becomes a real post',
    blogPublishLead: 'In WordPress, use a Custom HTML block (or the code editor). You paste markup once; what readers see is the formatted story, not raw tags.',
    blogFlow1: '① Copy the full HTML from PageAI',
    blogFlow2: '② Open your blog editor → HTML / code view',
    blogFlow3: '③ Paste (Ctrl+V) → preview shows the styled content → publish',
    blogCodeLabel: 'What you paste (code)',
    blogRenderedLabel: 'What readers see after paste',
    blogKeyPoint: 'The point: tags turn into headings, paragraphs, and CTAs — the AI-written layout, not source code.',
    blogCopyHint: 'Copy HTML',
    blogHtmlSample: '<article>\n  <h1>Jeju Organic Green Tea Serum</h1>\n  <p>Soothes sensitive skin...</p>\n  <a class="btn">Shop now →</a>\n</article>',
    blogMockBuy: 'Shop now →',
    blogMockBtn: 'Go to purchase link',
    blogDisclaimer: 'This post was auto-generated with PageAI',
  },
  ja: {
    name: '済州オーガニック緑茶セラム',
    cat: 'ビューティ/化粧品',
    desc: '済州緑茶成分で肌を落ち着かせ保湿...',
    step: 'STEP 1 · 入力',
    labelName: '商品名',
    labelCat: 'カテゴリ',
    catPlaceholder: 'カテゴリを選択...',
    labelDesc: '商品説明',
    labelPhoto: '商品写真',
    uploadIdle: '写真をアップロード',
    uploadOk: '✓ アップロード済み',
    btnGenerating: 'AIが生成中...',
    btnDone: '完了',
    btnStart: 'AIで生成 →',
    statusGen: 'Claude AI 分析中...',
    statusDone: '完了 · 45秒',
    previewIdle: 'AIプレビュー',
    previewHint: '商品情報を入力すると\nAIが自動生成します',
    genLine1: 'Claude AI 分析中',
    genLine2: '6セクションを生成中...',
    seoScore: 'SEOスコア',
    seoGood: '最高レベル 🟢',
    seoMid: '良好 🟡',
    seoWait: '分析中...',
    seoTags: ['キーワード', 'タイトル', '本文', 'CTA'],
    publishTitle: '📤 1クリック投稿',
    publishReady: (l) => `${l} 投稿準備完了 ✓`,
    footer: '実際のサービス動作シミュレーション · 自動ループ',
    sections: [
      { name: 'フック', title: '肌のSOS、見ていますか？', color: '#FF5C35' },
      { name: '製品', title: '3種の緑茶成分の理由', color: '#6366F1' },
      { name: '特徴', title: 'ヴィーガン × 皮膚科テスト', color: '#10B981' },
      { name: '対象', title: 'こんな方におすすめ', color: '#3B82F6' },
      { name: 'レビュー', title: '「刺激なく潤いました」', color: '#F59E0B' },
      { name: 'CTA', title: '初回20%オフ — 本日限定', color: '#8B5CF6' },
    ],
    platforms: [
      { id: 'ameblo', label: 'アメブロ', icon: 'A', bg: '#FF6B00', text: '#fff' },
      { id: 'note', label: 'note', icon: 'n', bg: '#000000', text: '#fff' },
      { id: 'wordpress', label: 'WordPress', icon: 'W', bg: '#21759B', text: '#fff' },
      { id: 'instagram', label: 'Instagram', icon: '📸', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', text: '#fff' },
    ],
    blogPublishTitle: 'HTMLを貼ると、AIが書いた記事がそのまま表示されます',
    blogPublishLead: 'ブログは「HTMLモード」に貼り付けます。コードの羅列ではなく、見出し・本文・ボタンが整形された状態で表示されるのがポイントです。',
    blogFlow1: '① PageAIで生成したHTMLをすべてコピー',
    blogFlow2: '② 記事作成 → HTML編集（またはコードビュー）',
    blogFlow3: '③ 貼り付け → 下書き保存のあと公開',
    blogCodeLabel: '貼り付けるコード',
    blogRenderedLabel: '貼り付け後に見える表示',
    blogKeyPoint: 'ポイント: タグではなく、AIが作った見出し・本文・レイアウトがレンダリングされます。',
    blogCopyHint: 'HTMLコピー',
    blogHtmlSample: '<div>\n  <h1>済州オーガニック緑茶セラム</h1>\n  <p>肌を落ち着かせ...</p>\n  <div class="cta">今すぐ購入</div>\n</div>',
    blogMockBuy: '今すぐ購入へ →',
    blogMockBtn: '購入リンクへ',
    blogDisclaimer: '本投稿はPageAIで自動生成されたコンテンツです',
  },
  zh: {
    name: '济州有机绿茶精华',
    cat: '美妆/护肤',
    desc: '济州绿茶舒缓保湿，适合敏感肌...',
    step: 'STEP 1 · 输入',
    labelName: '产品名称',
    labelCat: '分类',
    catPlaceholder: '请选择分类...',
    labelDesc: '产品描述',
    labelPhoto: '产品图',
    uploadIdle: '上传图片',
    uploadOk: '✓ 已上传',
    btnGenerating: 'AI 生成中...',
    btnDone: '完成',
    btnStart: 'AI 一键生成 →',
    statusGen: 'Claude AI 分析中...',
    statusDone: '完成 · 45秒',
    previewIdle: 'AI 预览',
    previewHint: '填写产品信息\nAI 自动生成',
    genLine1: 'Claude AI 分析中',
    genLine2: '正在生成 6 个板块...',
    seoScore: 'SEO 分数',
    seoGood: '顶尖水平 🟢',
    seoMid: '优秀 🟡',
    seoWait: '分析中...',
    seoTags: ['关键词', '标题', '正文', 'CTA'],
    publishTitle: '📤 一键发布',
    publishReady: (l) => `${l} 发布就绪 ✓`,
    footer: '真实服务流程演示 · 自动循环',
    sections: [
      { name: '吸引', title: '皮肤在发SOS，您注意到了吗？', color: '#FF5C35' },
      { name: '产品', title: '三重绿茶配方为何有效', color: '#6366F1' },
      { name: '特点', title: '纯素 × 皮肤科测试', color: '#10B981' },
      { name: '人群', title: '特别适合您，如果…', color: '#3B82F6' },
      { name: '评价', title: '「无刺激，很水润」', color: '#F59E0B' },
      { name: '行动', title: '今日限定 — 首单8折', color: '#8B5CF6' },
    ],
    platforms: [
      { id: 'wechat', label: '微信公众号', icon: '微', bg: '#07C160', text: '#fff' },
      { id: 'xiaohongshu', label: '小红书', icon: '红', bg: '#FF2442', text: '#fff' },
      { id: 'wordpress', label: 'WordPress', icon: 'W', bg: '#21759B', text: '#fff' },
      { id: 'instagram', label: 'Instagram', icon: '📸', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', text: '#fff' },
    ],
    blogPublishTitle: '粘贴 HTML 后，看到的是 AI 生成的正文而不是代码',
    blogPublishLead: '在编辑器里打开「HTML / 代码」视图，整段粘贴。保存草稿后，预览里会是排版好的标题、段落和按钮。',
    blogFlow1: '① 在 PageAI 复制完整 HTML',
    blogFlow2: '② 进入发文页 → 切换到 HTML 或代码模式',
    blogFlow3: '③ 粘贴 → 存草稿 → 正式发布',
    blogCodeLabel: '粘贴区（源码）',
    blogRenderedLabel: '粘贴后渲染出的效果',
    blogKeyPoint: '重点：浏览器会把标签解析成 AI 写好的版式与文案，而不是显示一堆尖括号。',
    blogCopyHint: '复制 HTML',
    blogHtmlSample: '<section>\n  <h1>济州有机绿茶精华</h1>\n  <p>舒缓保湿...</p>\n  <button>立即购买</button>\n</section>',
    blogMockBuy: '立即去购买 →',
    blogMockBtn: '购买链接',
    blogDisclaimer: '本文由 PageAI 自动生成',
  },
}

export default function DemoAnimation({ lang = 'ko' }: { lang?: Lang }) {
  const C = COPY[lang] ?? COPY.ko
  const SECTIONS = C.sections
  const PLATFORMS = C.platforms
  const NAME_TEXT = C.name
  const CAT_TEXT = C.cat
  const DESC_TEXT = C.desc

  const [loop, setLoop]               = useState(0)
  const [nameVal, setNameVal]         = useState('')
  const [catVal, setCatVal]           = useState('')
  const [descVal, setDescVal]         = useState('')
  const [photoAdded, setPhotoAdded]   = useState(false)
  const [generating, setGenerating]   = useState(false)
  const [sections, setSections]       = useState(0)
  const [seoScore, setSeoScore]       = useState(0)
  const [seoVisible, setSeoVisible]   = useState(false)
  const [publishStep, setPublishStep] = useState(0)
  const [activePlatform, setActivePlatform] = useState(-1)
  const [blogScene, setBlogScene] = useState(false)
  const [blogFlowHi, setBlogFlowHi] = useState(0)
  const [blogCodeText, setBlogCodeText] = useState('')
  const [blogShowRendered, setBlogShowRendered] = useState(false)
  const [blogCopyFlash, setBlogCopyFlash] = useState(false)

  useEffect(() => {
    setNameVal(''); setCatVal(''); setDescVal('')
    setPhotoAdded(false); setGenerating(false)
    setSections(0); setSeoScore(0); setSeoVisible(false)
    setPublishStep(0); setActivePlatform(-1)
    setBlogScene(false); setBlogFlowHi(0); setBlogCodeText('')
    setBlogShowRendered(false); setBlogCopyFlash(false)

    const T: ReturnType<typeof setTimeout>[] = []
    const add = (fn: () => void, ms: number) => T.push(setTimeout(fn, ms))

    let cursor = 300
    const type = (text: string, setter: React.Dispatch<React.SetStateAction<string>>, gap = 55) => {
      ;[...text].forEach((ch, i) => {
        const t = cursor + i * gap
        T.push(setTimeout(() => setter((prev: string) => prev + ch), t))
      })
      cursor += text.length * gap + 500
    }

    type(NAME_TEXT, setNameVal)
    type(CAT_TEXT, setCatVal, 65)
    type(DESC_TEXT, setDescVal, 50)

    add(() => setPhotoAdded(true), cursor)
    cursor += 800

    add(() => setGenerating(true), cursor)
    cursor += 2000

    add(() => setGenerating(false), cursor)
    SECTIONS.forEach((_, i) => add(() => setSections(i + 1), cursor + i * 280))
    cursor += SECTIONS.length * 280 + 400

    add(() => setSeoVisible(true), cursor)
    for (let v = 0; v <= 95; v += 5) {
      add(() => setSeoScore(v), cursor + v * 12)
    }
    cursor += 1400

    PLATFORMS.forEach((_, i) => add(() => setPublishStep(i + 1), cursor + i * 300))
    cursor += PLATFORMS.length * 300 + 600

    PLATFORMS.forEach((_, i) => add(() => setActivePlatform(i), cursor + i * 500))
    cursor += PLATFORMS.length * 500

    const blogSample = (COPY[lang] ?? COPY.ko).blogHtmlSample

    add(() => setBlogScene(true), cursor + 350)
    cursor += 450
    add(() => setBlogFlowHi(1), cursor)
    add(() => setBlogFlowHi(2), cursor + 450)
    add(() => setBlogFlowHi(3), cursor + 900)
    cursor += 1400
    add(() => setBlogCopyFlash(true), cursor)
    add(() => setBlogCopyFlash(false), cursor + 550)
    cursor += 700
    ;[...blogSample].forEach((ch, i) => {
      add(() => setBlogCodeText(prev => prev + ch), cursor + i * 28)
    })
    cursor += blogSample.length * 28 + 900
    add(() => setBlogShowRendered(true), cursor)
    cursor += 4200
    add(() => {
      setBlogScene(false)
      setBlogCodeText('')
      setBlogShowRendered(false)
      setBlogFlowHi(0)
    }, cursor)
    cursor += 450
    add(() => setLoop(l => l + 1), cursor + 200)

    return () => T.forEach(clearTimeout)
  }, [loop, lang])

  const showResult = sections > 0 && !generating

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-[8px] font-black">AI</span>
            </div>
            <span className="text-sm font-black tracking-tight">PageAI</span>
            <span className="ml-auto text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">{C.step}</span>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{C.labelName}</label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium min-h-[40px] bg-gray-50 flex items-center">
              {nameVal}
              <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 ${nameVal.length > 0 && nameVal.length < NAME_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{C.labelCat}</label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 min-h-[40px] bg-gray-50 flex items-center">
              {catVal || <span className="text-gray-300 text-xs">{C.catPlaceholder}</span>}
              <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 ${catVal.length > 0 && catVal.length < CAT_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{C.labelDesc}</label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 min-h-[64px] bg-gray-50 leading-relaxed">
              {descVal}
              <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${descVal.length > 0 && descVal.length < DESC_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{C.labelPhoto}</label>
            <div className={`border-2 border-dashed rounded-xl px-3 py-3 flex items-center gap-3 transition-all duration-500 ${photoAdded ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              {photoAdded ? (
                <>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-base">🖼️</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-700">photo_serum.jpg</p>
                    <p className="text-[10px] text-green-500">{C.uploadOk}</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">1/3</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-300 w-full justify-center py-1">
                  <span className="text-xl">📷</span>
                  <span className="text-xs">{C.uploadIdle}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`w-full py-3.5 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 ${
              generating ? 'bg-gray-700 text-white' : photoAdded ? 'bg-black text-white shadow-lg shadow-black/20 scale-[1.02]' : 'bg-black text-white'
            }`}
          >
            {generating ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{C.btnGenerating}</>
            ) : showResult ? (
              <><span>✓</span>{C.btnDone}</>
            ) : (
              <><span>✦</span>{C.btnStart}</>
            )}
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all ${generating ? 'bg-yellow-400 animate-pulse' : showResult ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold text-gray-500">
                  {generating ? C.statusGen : showResult ? C.statusDone : C.previewIdle}
                </span>
              </div>
              {showResult && sections >= SECTIONS.length && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  ✓ {SECTIONS.length}{lang === 'en' ? ' sections' : lang === 'ja' ? 'セクション' : lang === 'zh' ? ' 个板块' : '개 섹션'}
                </span>
              )}
            </div>

            <div className="min-h-[200px]">
              {!generating && !showResult && (
                <div className="flex items-center justify-center h-48 text-center">
                  <div>
                    <div className="text-3xl mb-2">✦</div>
                    <p className="text-gray-300 text-xs font-medium whitespace-pre-line">{C.previewHint}</p>
                  </div>
                </div>
              )}

              {generating && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-black rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-gray-800 mb-0.5">{C.genLine1}</p>
                    <p className="text-[10px] text-gray-400">{C.genLine2}</p>
                  </div>
                </div>
              )}

              {showResult && (
                <div className="divide-y divide-gray-50">
                  {SECTIONS.map((sec, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-center gap-3"
                      style={{
                        opacity:   sections > i ? 1 : 0,
                        transform: sections > i ? 'translateX(0)' : 'translateX(-12px)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                      }}
                    >
                      <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: sec.color, minHeight: 28 }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest block mb-0.5" style={{ color: sec.color }}>{sec.name}</span>
                        <p className="text-[11px] font-black text-gray-800 leading-snug truncate">{sec.title}</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg,${sec.color}25,${sec.color}08)` }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-md px-4 py-3 flex items-center gap-4 transition-all duration-500"
            style={{ opacity: seoVisible ? 1 : 0, transform: seoVisible ? 'translateY(0)' : 'translateY(16px)' }}
          >
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#F3F4F6" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="#10B981" strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - seoScore / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.15s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-black">{seoScore}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{C.seoScore}</p>
              <p className="text-sm font-black text-black">
                {seoScore >= 90 ? C.seoGood : seoScore >= 70 ? C.seoMid : C.seoWait}
              </p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {C.seoTags.map((t, i) => (
                  <span
                    key={t}
                    className="text-[9px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded-full font-bold transition-all duration-300"
                    style={{ opacity: seoScore > i * 25 ? 1 : 0 }}
                  >✓ {t}</span>
                ))}
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-md px-4 py-3 transition-all duration-500"
            style={{ opacity: publishStep > 0 ? 1 : 0, transform: publishStep > 0 ? 'translateY(0)' : 'translateY(16px)' }}
          >
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">{C.publishTitle}</p>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p, i) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-1 transition-all duration-300"
                  style={{
                    opacity:   publishStep > i ? 1 : 0,
                    transform: publishStep > i ? 'scale(1)' : 'scale(0.7)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-200 shadow-md"
                    style={{
                      background: p.bg,
                      color: p.text,
                      transform: activePlatform === i ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: activePlatform === i ? `0 4px 16px ${p.id === 'naver' ? '#03C75A' : p.id === 'tistory' ? '#F26522' : p.id === 'instagram' ? '#fd1d1d' : '#21759B'}50` : undefined,
                    }}
                  >
                    {p.icon}
                  </div>
                  <span className="text-[8px] text-gray-500 font-bold text-center leading-tight whitespace-pre-line">{p.label.replace(' ', '\n')}</span>
                </div>
              ))}
            </div>
            {activePlatform >= 0 && (
              <div
                className="mt-2.5 text-[10px] font-bold text-center transition-all duration-300"
                style={{ color: activePlatform === 0 ? '#03C75A' : activePlatform === 1 ? '#F26522' : activePlatform === 2 ? '#fd1d1d' : '#21759B' }}
              >
                {C.publishReady(PLATFORMS[activePlatform]?.label ?? '')}
              </div>
            )}
          </div>
        </div>

        {blogScene && (
          <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden transition-all duration-500">
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100">
              <div className="min-w-0">
                <p className="text-xs font-black text-gray-900 leading-snug">{C.blogPublishTitle}</p>
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">{C.blogPublishLead}</p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  blogCopyFlash ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {C.blogCopyHint} ↗
              </span>
            </div>

            <div className="px-4 py-2.5 space-y-1 border-b border-gray-100 bg-gray-50/80">
              <p className={`text-[10px] leading-snug transition-colors duration-300 ${blogFlowHi >= 1 ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                {C.blogFlow1}
              </p>
              <p className={`text-[10px] leading-snug transition-colors duration-300 ${blogFlowHi >= 2 ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                {C.blogFlow2}
              </p>
              <p className={`text-[10px] leading-snug transition-colors duration-300 ${blogFlowHi >= 3 ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                {C.blogFlow3}
              </p>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`rounded-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-700 ease-out ${
                  blogShowRendered ? 'opacity-45 md:scale-[0.98]' : 'opacity-100'
                }`}
              >
                <div className="text-[9px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5 border-b border-gray-200">
                  {C.blogCodeLabel}
                </div>
                <pre className="bg-[#1a1d21] text-[8px] leading-relaxed text-emerald-300/95 font-mono p-3 min-h-[150px] whitespace-pre-wrap break-all flex-1">
                  {blogCodeText}
                  {!blogShowRendered && blogCodeText.length > 0 && blogCodeText.length < C.blogHtmlSample.length && (
                    <span className="inline-block w-1 h-3 bg-emerald-400/80 ml-0.5 animate-pulse align-middle" />
                  )}
                </pre>
              </div>

              <div
                className={`rounded-xl border overflow-hidden flex flex-col transition-all duration-700 ease-out ${
                  blogShowRendered
                    ? `opacity-100 ring-2 shadow-lg ${lang === 'ko' ? 'ring-[#03C75A]' : 'ring-[#21759B]'}`
                    : 'opacity-35 border-gray-200'
                }`}
                style={{
                  borderColor: blogShowRendered ? (lang === 'ko' ? 'rgba(3,199,90,0.45)' : 'rgba(33,117,155,0.45)') : undefined,
                  boxShadow: blogShowRendered && lang === 'ko' ? '0 8px 30px -8px rgba(3,199,90,0.25)' : blogShowRendered ? '0 8px 30px -8px rgba(33,117,155,0.2)' : undefined,
                }}
              >
                <div
                  className="text-[9px] font-black uppercase tracking-wider text-white px-3 py-1.5"
                  style={{ backgroundColor: lang === 'ko' ? '#03C75A' : '#21759B' }}
                >
                  {C.blogRenderedLabel}
                </div>
                <div className="p-3 bg-white flex-1 flex flex-col">
                  <div className="h-16 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100 mb-2 flex items-center justify-center text-lg shrink-0">
                    🖼️
                  </div>
                  <h3 className="text-[11px] font-black text-gray-900 leading-tight">{SECTIONS[0]?.title}</h3>
                  <p className="text-[9px] text-gray-600 mt-1.5 leading-relaxed line-clamp-3">{SECTIONS[1]?.title}</p>
                  <div className="mt-auto pt-3">
                    <div className="bg-black text-white rounded-lg px-3 py-2 text-center">
                      <p className="text-[9px] font-black">{C.blogMockBuy}</p>
                      <span className="inline-block mt-1.5 bg-white text-black text-[8px] font-black px-2.5 py-0.5 rounded-full">
                        {C.blogMockBtn}
                      </span>
                    </div>
                    <p className="text-[7px] text-gray-400 text-center mt-2">{C.blogDisclaimer}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mx-4 mb-4 text-[9px] text-indigo-900 leading-relaxed bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
              {C.blogKeyPoint}
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-300 mt-5 font-medium">{C.footer}</p>
    </div>
  )
}
