'use client'
import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'

const DEMO_SECTIONS_KO = [
  { id: 1, name: '후킹 헤드라인', title: '지금 피부가 보내는 SOS 신호, 무시하고 계신가요?', body: '매일 아침 거울을 볼 때마다 피부가 당기고 칙칙한 느낌이 드신가요? 수분크림을 아무리 발라도 2시간 후면 다시 건조해지는 분들을 위해 만들었습니다.', bg: '#FFFFFF', accent: '#000' },
  { id: 2, name: '제품 소개', title: '3중 히알루론산이 다른 이유 — 크기가 다르면 작용이 다릅니다', body: '고분자: 피부 표면 수분 필름 형성 · 중분자: 표피층 침투, 수분 저장 · 저분자: 진피층까지 침투, 속 건조 개선. 3가지 크기가 동시에 작용합니다.', bg: '#F8F9FA', accent: '#6366F1' },
  { id: 3, name: '핵심 특징', title: '비건 인증 × 피부과 테스트 완료 × 무향', body: '✓ 동물성 원료 0%  ✓ 알레르기 유발 향료 0%  ✓ 파라벤 미사용  ✓ 피부과 테스트 완료  ✓ 비건 소사이어티 공식 인증', bg: '#FFFFFF', accent: '#10B981' },
  { id: 4, name: '추천 대상', title: '이런 분께 꼭 맞습니다', body: '✓ 보습크림을 발라도 금방 건조해지는 분 ✓ 화장이 들뜨는 분 ✓ 민감성 피부로 새 제품이 걱정되는 분 ✓ 자극 없는 수분 앰플을 찾는 분', bg: '#F0F7FF', accent: '#3B82F6' },
  { id: 5, name: '고객 후기', title: '"민감한 피부인데 자극 없이 촉촉해졌어요"', body: '사용 2주 후: "민감한 피부라 새 제품 쓸 때마다 걱정했는데, 바르고 나서 당기거나 붉어지는 느낌이 전혀 없었어요. 피부 결이 확실히 달라졌습니다." — 이지윤, 32세', bg: '#FFFFFF', accent: '#F59E0B' },
  { id: 6, name: '구매 유도', title: '지금 바로 시작하세요 — 첫 구매 20% 할인', body: '지금 구매 시: 첫 구매 20% 할인 자동 적용 · 미니 사이즈 무료 증정 · 무료 배송 · 당일 출고. 오늘만 특가 — 재고 한정.', bg: '#FFF8E7', accent: '#F97316' },
]

const DEMO_SECTIONS_EN = [
  { id: 1, name: 'Hook', title: 'Is Your Skin Sending SOS Signals You Keep Ignoring?', body: 'Every morning, your skin feels tight, dull, and dry within hours of moisturizing. No matter how much cream you apply, the dryness returns. Sound familiar? This was made for you.', bg: '#FFFFFF', accent: '#000' },
  { id: 2, name: 'Product', title: 'Triple Hyaluronic Acid — 3 Sizes, 3 Layers of Hydration', body: 'High-molecular: Forms a moisture film on the skin surface · Mid-molecular: Penetrates the epidermis, stores hydration · Low-molecular: Reaches the dermis, fixes deep dryness. All 3 work simultaneously.', bg: '#F8F9FA', accent: '#6366F1' },
  { id: 3, name: 'Features', title: 'Vegan Certified × Dermatologist Tested × Fragrance-Free', body: '✓ 0% animal-derived ingredients  ✓ 0% allergenic fragrances  ✓ Paraben-free  ✓ Dermatologist tested  ✓ Officially certified by The Vegan Society', bg: '#FFFFFF', accent: '#10B981' },
  { id: 4, name: 'Who It\'s For', title: 'Perfect For You If...', body: '✓ Moisturizer wears off within hours ✓ Makeup looks flaky or uneven ✓ Sensitive skin makes new products a risk ✓ You want a serum that truly hydrates without irritation', bg: '#F0F7FF', accent: '#3B82F6' },
  { id: 5, name: 'Reviews', title: '"Finally a serum for sensitive skin that actually works"', body: 'After 2 weeks: "I\'ve always been nervous trying new products on my sensitive skin, but this caused zero redness or irritation. My skin texture has completely changed." — Emma L., 32', bg: '#FFFFFF', accent: '#F59E0B' },
  { id: 6, name: 'Buy Now', title: 'Start Today — 20% Off Your First Order', body: 'Order now: 20% first-order discount applied automatically · Free mini size gift · Free shipping · Same-day dispatch. Today only — limited stock.', bg: '#FFF8E7', accent: '#F97316' },
]

const DEMO_SECTIONS_JA = [
  { id: 1, name: 'フック', title: '肌が発するSOSシグナル、見逃していませんか？', body: '毎朝鏡を見るたびに、肌がつっぱり、くすんで感じませんか？保湿クリームを塗っても2時間後には乾燥が戻る方のために作りました。', bg: '#FFFFFF', accent: '#000' },
  { id: 2, name: '製品紹介', title: '3種類のヒアルロン酸 — サイズが違えば働きも違う', body: '高分子：肌表面に水分フィルムを形成 · 中分子：表皮層に浸透し水分を保持 · 低分子：真皮層まで浸透し深部乾燥を改善。3つのサイズが同時に働きます。', bg: '#F8F9FA', accent: '#6366F1' },
  { id: 3, name: '特徴', title: 'ヴィーガン認定 × 皮膚科テスト済み × 無香料', body: '✓ 動物由来原料0%  ✓ アレルギー誘発香料0%  ✓ パラベンフリー  ✓ 皮膚科テスト済み  ✓ ヴィーガンソサイエティ公式認定', bg: '#FFFFFF', accent: '#10B981' },
  { id: 4, name: 'こんな方に', title: 'こんな方にぴったりです', body: '✓ 保湿クリームを塗ってもすぐ乾燥する方 ✓ メイクが浮く方 ✓ 敏感肌で新しい製品が心配な方 ✓ 刺激のない水分アンプルを探している方', bg: '#F0F7FF', accent: '#3B82F6' },
  { id: 5, name: 'レビュー', title: '「敏感肌なのに刺激ゼロで潤いました」', body: '使用2週間後：「敏感肌なので新しい製品を使うたびに心配でしたが、塗った後のつっぱりや赤みが全くありませんでした。肌のキメが確実に変わりました。」— 山田花子, 32歳', bg: '#FFFFFF', accent: '#F59E0B' },
  { id: 6, name: '購入', title: '今すぐ始めましょう — 初回購入20%オフ', body: '今すぐ購入：初回20%割引自動適用 · ミニサイズ無料プレゼント · 送料無料 · 当日発送。本日限定特価 — 在庫限り。', bg: '#FFF8E7', accent: '#F97316' },
]

const DEMO_SECTIONS_ZH = [
  { id: 1, name: '吸引标题', title: '您的皮肤正在发出SOS信号，您还在忽视吗？', body: '每天早上照镜子，是否感到皮肤紧绷、暗沉？不管涂多少保湿霜，两小时后又开始干燥？这款产品就是为您而生的。', bg: '#FFFFFF', accent: '#000' },
  { id: 2, name: '产品介绍', title: '三重玻尿酸 — 分子大小不同，作用深度不同', body: '大分子：在皮肤表面形成保湿膜 · 中分子：渗透表皮层，锁住水分 · 小分子：深入真皮层，改善深层干燥。三种分子同时发挥作用。', bg: '#F8F9FA', accent: '#6366F1' },
  { id: 3, name: '核心特点', title: '纯素认证 × 皮肤科测试 × 无香料', body: '✓ 动物源性成分0%  ✓ 过敏性香料0%  ✓ 无防腐剂  ✓ 皮肤科测试完成  ✓ 素食协会官方认证', bg: '#FFFFFF', accent: '#10B981' },
  { id: 4, name: '适用人群', title: '特别适合以下人群', body: '✓ 涂了保湿霜还是很快干燥的人 ✓ 妆容浮粉的人 ✓ 敏感肌肤担心新产品的人 ✓ 寻找无刺激补水精华的人', bg: '#F0F7FF', accent: '#3B82F6' },
  { id: 5, name: '用户评价', title: '「敏感肌肤，用后无刺激，皮肤变水润了」', body: '使用2周后："我的皮肤很敏感，每次用新产品都很担心，但用了之后完全没有紧绷感或泛红。皮肤质感确实改变了。"— 李雅婷, 32岁', bg: '#FFFFFF', accent: '#F59E0B' },
  { id: 6, name: '立即购买', title: '立即开始 — 首次购买享8折优惠', body: '立即购买：首次自动享受8折优惠 · 赠送迷你装 · 免费配送 · 当天发货。仅限今天特惠 — 库存有限。', bg: '#FFF8E7', accent: '#F97316' },
]

const DEMO_LABELS: Record<string, { product: string; category: string; flag: string; edit: string; regen: string; inputLabel: string; timeLabel: string }> = {
  ko: { product: '비건 히알루론산 앰플 50ml', category: '뷰티/화장품', flag: '🇰🇷 한국어', edit: '편집', regen: 'AI 재생성', inputLabel: '입력', timeLabel: '30초 입력 → 45초 생성' },
  en: { product: 'Vegan Hyaluronic Acid Serum 50ml', category: 'Beauty/Skincare', flag: '🇺🇸 English', edit: 'Edit', regen: 'AI Regenerate', inputLabel: 'Input', timeLabel: '30s input → 45s output' },
  ja: { product: 'ヴィーガンヒアルロン酸アンプル 50ml', category: 'ビューティ/スキンケア', flag: '🇯🇵 日本語', edit: '編集', regen: 'AI再生成', inputLabel: '入力', timeLabel: '30秒入力 → 45秒生成' },
  zh: { product: '纯素玻尿酸精华 50ml', category: '美妆/护肤', flag: '🇨🇳 中文', edit: '编辑', regen: 'AI重新生成', inputLabel: '输入', timeLabel: '30秒输入 → 45秒生成' },
}

const SHOWCASE_UI: Record<string, {
  kicker: string; h2a: string; h2b: string; sub: string; urlBar: string; statusReady: string; clickHint: string
  seoHead: string; seoLevel: string; seoLine1: string; seoLine2: string; seoPass: string; seoPct: string
  seoFoot: string; seoBullets: string[]
  blogPlat: string
  blogSide: { name: string; icon: string; active: boolean; url: string }[]
}> = {
  ko: {
    kicker: '실제 결과물', h2a: '30초 입력하면', h2b: '이렇게 나옵니다.', sub: '실제 서비스 화면 · 직접 편집 가능',
    urlBar: 'pageai.kr/order/abc123', statusReady: '생성 완료', clickHint: '클릭해서 편집 가능',
    seoHead: 'SEO 종합 점수', seoLevel: '최상위 수준', seoLine1: '검색 상위 노출 최적화 완료', seoLine2: '7개 항목 모두 통과 ✅',
    seoPass: '7/7 통과', seoPct: '100%',
    seoFoot: '✓ AI가 자동으로 최적화한 항목',
    seoBullets: ['숫자 포함 제목 4개', '"히알루론산" 키워드 6회', 'CTA 문구 3개 삽입', '의문형 헤드라인 포함', '섹션당 평균 160자', '제목 평균 22자 최적'],
    blogPlat: '플랫폼',
    blogSide: [
      { name: '네이버 블로그', icon: '🟢', active: true, url: 'blog.naver.com' },
      { name: '티스토리', icon: '🟠', active: false, url: 'tistory.com' },
      { name: '워드프레스', icon: '🔵', active: false, url: 'wordpress.com' },
      { name: '브런치', icon: '⚫', active: false, url: 'brunch.co.kr' },
      { name: '인스타캡션', icon: '🟣', active: false, url: 'instagram.com' },
      { name: 'PDF', icon: '🔴', active: false, url: 'export.pdf' },
    ],
  },
  en: {
    kicker: 'Real output', h2a: '30 seconds in,', h2b: 'this is what you get.', sub: 'Actual UI · edit any section',
    urlBar: 'pageai.com/order/abc123', statusReady: 'Ready', clickHint: 'Click to edit',
    seoHead: 'SEO score', seoLevel: 'Top tier', seoLine1: 'Optimized for search visibility', seoLine2: 'All 7 checks passed ✅',
    seoPass: '7/7 passed', seoPct: '100%',
    seoFoot: '✓ Auto-optimized by AI',
    seoBullets: ['4 titles with numbers', '"Hyaluronic" ×6', '3 CTAs placed', 'Question-style hook', '~160 chars/section', '~22-char titles'],
    blogPlat: 'Platform',
    blogSide: [
      { name: 'WordPress', icon: '🔵', active: true, url: 'wordpress.com' },
      { name: 'Shopify', icon: '🛍', active: false, url: 'shopify.com' },
      { name: 'Medium', icon: 'M', active: false, url: 'medium.com' },
      { name: 'Instagram', icon: '🟣', active: false, url: 'instagram.com' },
      { name: 'LinkedIn', icon: 'in', active: false, url: 'linkedin.com' },
      { name: 'PDF', icon: '🔴', active: false, url: 'export.pdf' },
    ],
  },
  ja: {
    kicker: '実際の成果', h2a: '30秒入力で、', h2b: 'こうなります。', sub: '実サービス画面 · その場で編集',
    urlBar: 'pageai.jp/order/abc123', statusReady: '生成完了', clickHint: 'クリックで編集',
    seoHead: 'SEO総合スコア', seoLevel: '最高水準', seoLine1: '検索最適化完了', seoLine2: '7項目すべて合格 ✅',
    seoPass: '7/7 合格', seoPct: '100%',
    seoFoot: '✓ AIが自動最適化',
    seoBullets: ['数字入りタイトル4件', '「ヒアルロン酸」6回', 'CTA 3箇所', '疑問形見出し', 'セクション平均160字', 'タイトル平均22字'],
    blogPlat: 'プラットフォーム',
    blogSide: [
      { name: 'アメブロ', icon: '🟢', active: true, url: 'ameblo.jp' },
      { name: 'note', icon: '📝', active: false, url: 'note.com' },
      { name: 'WordPress', icon: '🔵', active: false, url: 'wordpress.com' },
      { name: 'Instagram', icon: '🟣', active: false, url: 'instagram.com' },
      { name: 'X (Twitter)', icon: '𝕏', active: false, url: 'x.com' },
      { name: 'PDF', icon: '🔴', active: false, url: 'export.pdf' },
    ],
  },
  zh: {
    kicker: '真实效果', h2a: '输入30秒，', h2b: '立刻得到这些。', sub: '真实界面 · 可点选编辑',
    urlBar: 'pageai.com/order/abc123', statusReady: '生成完成', clickHint: '点击即可编辑',
    seoHead: 'SEO 综合分', seoLevel: '顶尖水平', seoLine1: '搜索优化已完成', seoLine2: '7 项全部通过 ✅',
    seoPass: '7/7 通过', seoPct: '100%',
    seoFoot: '✓ AI 已自动优化',
    seoBullets: ['含数字标题4个', '「玻尿酸」出现6次', '插入3处CTA', '疑问型标题', '每段约160字', '标题约22字'],
    blogPlat: '平台',
    blogSide: [
      { name: '微信公众号', icon: '💬', active: true, url: 'mp.weixin.qq.com' },
      { name: '小红书', icon: '📕', active: false, url: 'xiaohongshu.com' },
      { name: '知乎', icon: '知', active: false, url: 'zhihu.com' },
      { name: 'WordPress', icon: '🔵', active: false, url: 'wordpress.com' },
      { name: '微博', icon: '微', active: false, url: 'weibo.com' },
      { name: 'PDF', icon: '🔴', active: false, url: 'export.pdf' },
    ],
  },
}

const DEMO_BY_LANG: Record<string, typeof DEMO_SECTIONS_KO> = {
  ko: DEMO_SECTIONS_KO,
  en: DEMO_SECTIONS_EN,
  ja: DEMO_SECTIONS_JA,
  zh: DEMO_SECTIONS_ZH,
}

const SEO_SCORE = 95
const SEO_ITEMS_BY_LANG: Record<string, { label: string; score: number; ok: boolean; color: string }[]> = {
  ko: [
    { label: '키워드 밀도', score: 97, ok: true, color: '#10B981' },
    { label: '제목 최적화', score: 93, ok: true, color: '#6366F1' },
    { label: '본문 길이', score: 95, ok: true, color: '#3B82F6' },
    { label: 'CTA 강도', score: 98, ok: true, color: '#F59E0B' },
    { label: '숫자 포함', score: 92, ok: true, color: '#8B5CF6' },
    { label: '의문형 제목', score: 100, ok: true, color: '#EC4899' },
    { label: '섹션별 분량', score: 96, ok: true, color: '#06B6D4' },
  ],
  en: [
    { label: 'Keyword density', score: 97, ok: true, color: '#10B981' },
    { label: 'Title tuning', score: 93, ok: true, color: '#6366F1' },
    { label: 'Body length', score: 95, ok: true, color: '#3B82F6' },
    { label: 'CTA strength', score: 98, ok: true, color: '#F59E0B' },
    { label: 'Numbers in titles', score: 92, ok: true, color: '#8B5CF6' },
    { label: 'Question hooks', score: 100, ok: true, color: '#EC4899' },
    { label: 'Section depth', score: 96, ok: true, color: '#06B6D4' },
  ],
  ja: [
    { label: 'キーワード密度', score: 97, ok: true, color: '#10B981' },
    { label: 'タイトル最適化', score: 93, ok: true, color: '#6366F1' },
    { label: '本文の長さ', score: 95, ok: true, color: '#3B82F6' },
    { label: 'CTA強度', score: 98, ok: true, color: '#F59E0B' },
    { label: '数字入りタイトル', score: 92, ok: true, color: '#8B5CF6' },
    { label: '疑問形見出し', score: 100, ok: true, color: '#EC4899' },
    { label: 'セクション分量', score: 96, ok: true, color: '#06B6D4' },
  ],
  zh: [
    { label: '关键词密度', score: 97, ok: true, color: '#10B981' },
    { label: '标题优化', score: 93, ok: true, color: '#6366F1' },
    { label: '正文长度', score: 95, ok: true, color: '#3B82F6' },
    { label: 'CTA强度', score: 98, ok: true, color: '#F59E0B' },
    { label: '标题含数字', score: 92, ok: true, color: '#8B5CF6' },
    { label: '疑问型标题', score: 100, ok: true, color: '#EC4899' },
    { label: '分段篇幅', score: 96, ok: true, color: '#06B6D4' },
  ],
}

export default function ProductShowcase({ lang = 'ko' }: { lang?: string }) {
  const DEMO_SECTIONS = DEMO_BY_LANG[lang] ?? DEMO_SECTIONS_KO
  const LABELS = DEMO_LABELS[lang] ?? DEMO_LABELS.ko
  const SU = SHOWCASE_UI[lang] ?? SHOWCASE_UI.ko
  const SEO_ITEMS = SEO_ITEMS_BY_LANG[lang] ?? SEO_ITEMS_BY_LANG.ko
  const [activeSection, setActiveSection] = useState(0)
  const [tab, setTab] = useState<'result' | 'seo' | 'blog'>('result')
  const [seoVisible, setSeoVisible] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSection(i => (i + 1) % DEMO_SECTIONS.length)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (tab === 'seo') {
      setTimeout(() => setSeoVisible(true), 200)
    } else {
      setSeoVisible(false)
    }
  }, [tab])

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-6 py-12 md:py-20">
      {/* 섹션 헤더 */}
      <div className="text-center mb-10 md:mb-14">
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">{SU.kicker}</p>
        <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
          {SU.h2a}<br />
          <span className="text-gray-300">{SU.h2b}</span>
        </h2>
        <p className="text-gray-400 text-sm">{SU.sub}</p>
      </div>

      {/* 브라우저 목업 */}
      <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/60">

        {/* 브라우저 크롬 */}
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-lg px-4 py-1.5 flex items-center gap-2 max-w-md mx-auto">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-gray-400 font-mono">{SU.urlBar}</span>
          </div>
        </div>

        {/* 앱 헤더 */}
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size={26} />
            <div className="min-w-0">
              <p className="text-xs font-black text-black truncate">{LABELS.product}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">{LABELS.category}</span>
                <span className="flex items-center gap-1 text-[9px] text-green-600 font-bold">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />{SU.statusReady}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {(['result', 'seo', 'blog'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  tab === t ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                }`}
              >
                {t === 'result' ? '📄 ' + (lang === 'en' ? 'Result' : lang === 'ja' ? '結果' : lang === 'zh' ? '结果' : '결과물') : t === 'seo' ? '📊 SEO' : '📝 ' + (lang === 'en' ? 'Blog' : lang === 'ja' ? 'ブログ' : lang === 'zh' ? '博客' : '블로그')}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="bg-gray-50" style={{ height: '480px', overflow: 'hidden' }}>

          {/* 결과물 탭 */}
          {tab === 'result' && (
            <div className="flex h-full">
              {/* 섹션 목록 사이드바 */}
              <div className="w-36 md:w-44 bg-white border-r border-gray-100 py-3 shrink-0 overflow-y-auto">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2">{lang === 'en' ? 'Sections' : lang === 'ja' ? 'セクション' : lang === 'zh' ? '章节' : '섹션 목록'}</p>
                {DEMO_SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(i)}
                    className={`w-full text-left px-3 py-2.5 text-xs transition-all border-l-2 ${
                      activeSection === i
                        ? 'border-black bg-gray-50 font-black text-black'
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <span className="block text-[9px] text-gray-300 mb-0.5">{lang === 'en' ? 'Section' : lang === 'ja' ? 'セクション' : lang === 'zh' ? '章节' : '섹션'} {s.id}</span>
                    {s.name}
                  </button>
                ))}
              </div>

              {/* 섹션 프리뷰 */}
              <div className="flex-1 overflow-hidden relative">
                {DEMO_SECTIONS.map((s, i) => (
                  <div
                    key={s.id}
                    className="absolute inset-0 p-6 md:p-8 transition-all duration-500 flex flex-col justify-between"
                    style={{
                      backgroundColor: s.bg,
                      opacity: activeSection === i ? 1 : 0,
                      transform: activeSection === i ? 'translateY(0)' : 'translateY(20px)',
                      pointerEvents: activeSection === i ? 'auto' : 'none',
                    }}
                  >
                    <div>
                      {/* 섹션 배지 */}
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: s.accent }}
                        >
                          {s.name}
                        </span>
                        <span className="text-[10px] text-gray-300 font-medium">{SU.clickHint}</span>
                      </div>

                      {/* 제목 */}
                      <h3 className="text-lg md:text-2xl font-black text-black leading-tight mb-4 tracking-tight">
                        {s.title}
                      </h3>

                      {/* 본문 */}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {s.body}
                      </p>
                    </div>

                    {/* 하단 툴바 */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
                      <button className="text-[10px] bg-black text-white px-3 py-1.5 rounded-lg font-bold">{LABELS.edit}</button>
                      <button className="text-[10px] text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg">{LABELS.regen}</button>
                      <div className="ml-auto flex items-center gap-1">
                        {DEMO_SECTIONS.map((_, j) => (
                          <div
                            key={j}
                            className="w-1.5 h-1.5 rounded-full transition-all"
                            style={{ backgroundColor: j === activeSection ? '#000' : '#E5E7EB' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO 분석 탭 */}
          {tab === 'seo' && (
            <div className="p-5 h-full overflow-y-auto bg-white">
              <div className="flex items-center gap-5 mb-5">
                {/* 점수 원 */}
                <div className="shrink-0 relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#F3F4F6" strokeWidth="7" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke="#10B981" strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={seoVisible ? `${2 * Math.PI * 32 * (1 - SEO_SCORE / 100)}` : `${2 * Math.PI * 32}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1.4s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-black">{seoVisible ? SEO_SCORE : 0}</span>
                    <span className="text-[8px] text-gray-400 font-bold">/ 100</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{SU.seoHead}</p>
                  <p className="text-xl font-black text-black">{SU.seoLevel}</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">
                    {SU.seoLine1}<br />
                    {SU.seoLine2}
                  </p>
                </div>
                <div className="ml-auto shrink-0 flex flex-col items-center bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span className="text-[9px] text-green-600 font-black">{SU.seoPass}</span>
                  <span className="text-lg font-black text-green-600">{SU.seoPct}</span>
                </div>
              </div>

              {/* 항목별 점수 */}
              <div className="space-y-2">
                {SEO_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-500 text-[10px] shrink-0">✓</span>
                    <span className="text-[10px] font-bold text-gray-700 w-20 shrink-0">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000"
                        style={{
                          width: seoVisible ? `${item.score}%` : '0%',
                          backgroundColor: item.color,
                          transitionDelay: `${i * 100}ms`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-black w-7 text-right shrink-0" style={{ color: item.color }}>{item.score}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-[9px] font-black text-green-700 mb-1.5">{SU.seoFoot}</p>
                <div className="grid grid-cols-2 gap-1">
                  {SU.seoBullets.map((t, i) => (
                    <p key={i} className="text-[9px] text-green-600 flex items-center gap-1">
                      <span>·</span> {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 블로그 탭 */}
          {tab === 'blog' && (
            <div className="flex h-full">
              {/* 플랫폼 선택 */}
              <div className="w-28 md:w-36 bg-white border-r border-gray-100 py-3 shrink-0">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2">{SU.blogPlat}</p>
                {SU.blogSide.map((p, i) => (
                  <button key={i} className={`w-full text-left px-3 py-2 text-[10px] transition-all border-l-2 ${
                    p.active ? 'border-black bg-gray-50 font-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}>
                    <span className="mr-1">{p.icon}</span>{p.name}
                  </button>
                ))}
              </div>
              {/* 미리보기 */}
              <div className="flex-1 overflow-y-auto bg-white p-4">
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-[#03C75A] px-4 py-2 flex items-center gap-2">
                    <span className="text-white font-black text-xs">N</span>
                    <span className="text-white text-[10px]">blog.naver.com/mystore</span>
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    <h3 className="text-sm font-black text-black leading-snug">{DEMO_SECTIONS[0].title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      {lang === 'en'
                        ? ['#hyaluronicacid', '#veganbeauty', '#skincareserum'].map((t, i) => <span key={i} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)
                        : lang === 'ja'
                        ? ['#ヒアルロン酸', '#ビーガンコスメ', '#美容液'].map((t, i) => <span key={i} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)
                        : lang === 'zh'
                        ? ['#玻尿酸', '#纯素护肤', '#补水精华'].map((t, i) => <span key={i} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)
                        : ['#히알루론산앰플', '#비건화장품', '#수분앰플추천'].map((t, i) => <span key={i} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)
                      }
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-gray-100 rounded w-full" />
                      <div className="h-2.5 bg-gray-100 rounded w-5/6" />
                      <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                    </div>
                    <div className="bg-gray-50 rounded-xl h-20 flex items-center justify-center">
                      <span className="text-[9px] text-gray-300">📷 {lang === 'en' ? 'Product image auto-inserted' : lang === 'ja' ? '製品画像自動挿入' : lang === 'zh' ? '产品图片自动插入' : '제품 이미지 자동 삽입'}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-700">{DEMO_SECTIONS[1].title}</p>
                      <div className="h-2 bg-gray-100 rounded w-full" />
                      <div className="h-2 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                </div>
                <button className="mt-3 w-full bg-[#03C75A] text-white py-2.5 rounded-xl text-xs font-black hover:opacity-90 transition-all">
                  ↗ {lang === 'en' ? 'Copy HTML and paste to blog' : lang === 'ja' ? 'HTMLをコピーしてブログに貼付' : lang === 'zh' ? '复制HTML并粘贴到博客' : 'HTML 복사해서 블로그에 붙여넣기'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 상태 바 */}
        <div className="bg-white border-t border-gray-100 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-[10px] text-gray-400 font-medium">{lang === 'en' ? 'Generated · 45s' : lang === 'ja' ? '生成完了 · 45秒' : lang === 'zh' ? '生成完成 · 45秒' : '생성 완료 · 45초 소요'}</span>
            </div>
            <span className="text-[10px] text-gray-200">|</span>
            <span className="text-[10px] text-gray-400">{lang === 'en' ? '6 sections · 1,240 chars' : lang === 'ja' ? '6セクション · 1,240文字' : lang === 'zh' ? '6个章节 · 1,240字' : '6개 섹션 · 총 1,240자'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[10px] text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg font-medium hover:border-gray-400 transition-all">{lang === 'en' ? 'PDF' : 'PDF 다운'}</button>
            <button className="text-[10px] bg-black text-white px-3 py-1.5 rounded-lg font-black">✦ {lang === 'en' ? 'AI Edit' : lang === 'ja' ? 'AI修正' : lang === 'zh' ? 'AI修改' : 'AI 수정 요청'}</button>
          </div>
        </div>
      </div>

      {/* 입력 정보 표시 */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase">{LABELS.inputLabel}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium text-gray-700">{LABELS.product}</span>
              <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium text-gray-500">{LABELS.category}</span>
              <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium text-gray-500">{LABELS.flag}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
          <span className="text-green-500 font-bold">✓</span>
          <span>{LABELS.timeLabel}</span>
        </div>
      </div>
    </section>
  )
}
