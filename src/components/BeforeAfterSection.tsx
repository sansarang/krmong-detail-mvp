'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

type Block = { label: string; title: string; preview: string }

const UI: Record<Lang, {
  badge: string
  h2a: string
  h2b: string
  sub: string
  inputTitle: string
  product: string
  category: string
  categoryVal: string
  desc: string
  descVal: string
  timeNote: string
  outputTitle: string
  doneTitle: string
  doneSub: string
  cta: string
  samples: string
}> = {
  ko: {
    badge: '실제 결과물',
    h2a: '입력 30초,',
    h2b: '이렇게 나옵니다.',
    sub: '제품 설명 몇 줄만 입력하면 AI가 전환율 높은 상세페이지를 즉시 완성합니다.',
    inputTitle: 'INPUT — 셀러가 입력한 내용',
    product: '제품명',
    category: '카테고리',
    categoryVal: '뷰티/스킨케어',
    desc: '제품 설명',
    descVal: '3중 히알루론산, 비건 인증, 저자극 무향, 건성·민감성 피부 적합, 피부과 테스트 완료',
    timeNote: '총 입력 시간 약 30초',
    outputTitle: 'OUTPUT — AI 생성 결과',
    doneTitle: '✓ 6섹션 완성',
    doneSub: 'PDF 다운로드 가능',
    cta: '내 것도 만들기 →',
    samples: '다양한 카테고리 샘플 보기 →',
  },
  en: {
    badge: 'Real output',
    h2a: '30 seconds in,',
    h2b: 'this is what you get.',
    sub: 'A few lines of product copy — AI turns it into a conversion-focused page instantly.',
    inputTitle: 'INPUT — What you type',
    product: 'Product name',
    category: 'Category',
    categoryVal: 'Beauty / Skincare',
    desc: 'Description',
    descVal: 'Triple hyaluronic acid, vegan certified, fragrance-free, for dry & sensitive skin, dermatologist tested',
    timeNote: '~30 seconds total input',
    outputTitle: 'OUTPUT — AI-generated',
    doneTitle: '✓ 6 sections done',
    doneSub: 'PDF download ready',
    cta: 'Make mine →',
    samples: 'Browse sample categories →',
  },
  ja: {
    badge: '実際の成果物',
    h2a: '入力30秒で、',
    h2b: 'ここまで完成。',
    sub: '商品説明を数行入れるだけで、AIが転換率の高いページをすぐに作成します。',
    inputTitle: 'INPUT — 入力内容',
    product: '商品名',
    category: 'カテゴリ',
    categoryVal: 'ビューティ/スキンケア',
    desc: '商品説明',
    descVal: '3種ヒアルロン酸、ヴィーガン認定、無香料、乾燥・敏感肌向け、皮膚科テスト済み',
    timeNote: '合計入力時間 約30秒',
    outputTitle: 'OUTPUT — AI生成結果',
    doneTitle: '✓ 6セクション完成',
    doneSub: 'PDFダウンロード可',
    cta: '自分の分を作る →',
    samples: 'カテゴリサンプルを見る →',
  },
  zh: {
    badge: '真实产出',
    h2a: '输入30秒，',
    h2b: '立刻得到这些。',
    sub: '只需几行产品说明，AI立即生成高转化详情页。',
    inputTitle: 'INPUT — 您填写的内容',
    product: '产品名称',
    category: '分类',
    categoryVal: '美妆/护肤',
    desc: '产品描述',
    descVal: '三重玻尿酸、纯素认证、无香、适合干性敏感肌、皮肤科测试完成',
    timeNote: '总输入约30秒',
    outputTitle: 'OUTPUT — AI 生成结果',
    doneTitle: '✓ 6个板块完成',
    doneSub: '可下载 PDF',
    cta: '我也生成 →',
    samples: '查看各品类样例 →',
  },
}

const SECTIONS: Record<Lang, Block[]> = {
  ko: [
    { label: '섹션 1', title: '지금 피부가 보내는 SOS 신호, 무시하고 계신가요?', preview: '매일 아침 거울을 볼 때마다 피부가 당기거나 칙칙한 느낌이 드신가요? 수분크림을 아무리 발라도 2시간 후면 다시 건조해지는...' },
    { label: '섹션 2', title: '히알루론산, 크기가 다르면 작용이 다릅니다', preview: '고분자: 피부 표면 수분 필름 형성\n중분자: 표피층 침투, 수분 저장\n저분자: 진피층까지 침투, 속 건조 개선' },
    { label: '섹션 3', title: '비건 인증 × 피부과 테스트 완료', preview: '동물성 원료 0% · 알레르기 유발 향료 0% · 파라벤 미사용 · 피부과 테스트 완료 · 비건 소사이어티 공식 인증' },
    { label: '섹션 4', title: '이런 분들께 추천드립니다', preview: '✓ 보습크림을 발라도 금방 건조해지는 분\n✓ 화장이 들뜨는 분\n✓ 민감성 피부로 새 제품 사용이 걱정되는 분' },
    { label: '섹션 5', title: '2주 후기', preview: '"민감한 피부라 새 제품 쓸 때마다 걱정했는데 바르고 나서 당기거나 붉어지는 느낌 전혀 없었어요. 2주 정도 쓰니까 피부 결이 확실히..."' },
    { label: '섹션 6', title: '지금 구매 특가', preview: '첫 구매 20% 할인 자동 적용 · 미니 사이즈 무료 증정 · 무료 배송 · 당일 출고' },
  ],
  en: [
    { label: 'Section 1', title: 'Is your skin sending SOS signals you keep ignoring?', preview: 'Every morning your skin feels tight and dull. You moisturize, but dryness comes back within hours...' },
    { label: 'Section 2', title: 'Hyaluronic acid — size matters for how it works', preview: 'High MW: surface film · Mid MW: epidermis hydration · Low MW: deeper layers — all three together.' },
    { label: 'Section 3', title: 'Vegan certified × dermatologist tested', preview: '0% animal-derived · 0% allergenic fragrance · paraben-free · clinic-tested · Vegan Society certified.' },
    { label: 'Section 4', title: 'Perfect for you if…', preview: '✓ Moisture fades within hours\n✓ Makeup looks uneven\n✓ Sensitive skin, nervous about new products' },
    { label: 'Section 5', title: 'After 2 weeks', preview: '"I\'m sensitive to everything new — zero tightness or redness. Texture really changed after two weeks."' },
    { label: 'Section 6', title: 'Limited offer', preview: '20% off first order · free mini · free shipping · ships today.' },
  ],
  ja: [
    { label: 'セクション1', title: '肌のSOSサイン、見ていませんか？', preview: '毎朝つっぱりやくすみを感じますか？保湿しても数時間で乾きが戻る...' },
    { label: 'セクション2', title: 'ヒアルロン酸は分子サイズで役割が違う', preview: '高分子：表面の膜 · 中分子：表皮の水分 · 低分子：深部まで浸透' },
    { label: 'セクション3', title: 'ヴィーガン認定 × 皮膚科テスト済み', preview: '動物性原料0% · アレルゲン香料0% · パラベンフリー · 皮膚科テスト · 認定取得' },
    { label: 'セクション4', title: 'こんな方におすすめ', preview: '✓ 保湿がすぐ乾く ✓ メイクが浮く ✓ 敏感肌で新製品が不安' },
    { label: 'セクション5', title: '2週間後の声', preview: '「敏感肌ですがつっぱりや赤みがなくなり、2週間で肌のキメが変わりました」' },
    { label: 'セクション6', title: '今だけ特典', preview: '初回20%OFF · ミニ贈呈 · 送料無料 · 当日発送' },
  ],
  zh: [
    { label: '板块1', title: '皮肤在发SOS，您还在忽视吗？', preview: '每天早上紧绷暗沉，涂了保湿几小时后又干...' },
    { label: '板块2', title: '玻尿酸分子大小决定作用层次', preview: '大分子成膜锁水 · 中分子表皮保湿 · 小分子深入修护' },
    { label: '板块3', title: '纯素认证 × 皮肤科测试', preview: '无动物成分 · 无致敏香精 · 无防腐剂 · 临床测试 · 官方认证' },
    { label: '板块4', title: '适合这样的您', preview: '✓ 保湿不持久 ✓ 妆容不服帖 ✓ 敏感肌不敢尝新' },
    { label: '板块5', title: '两周反馈', preview: '「敏感肌试用无泛红紧绷，两周后肤质明显改善。」' },
    { label: '板块6', title: '限时优惠', preview: '首单8折 · 赠小样 · 包邮 · 当日发' },
  ],
}

export default function BeforeAfterSection({ lang = 'ko' }: { lang?: Lang }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [revealed, setRevealed] = useState(0)
  const L = UI[lang] ?? UI.ko
  const blocks = SECTIONS[lang] ?? SECTIONS.ko
  const productName =
    lang === 'en' ? 'Vegan Hyaluronic Acid Serum 50ml'
      : lang === 'ja' ? 'ヴィーガンヒアルロン酸セラム 50ml'
        : lang === 'zh' ? '纯素玻尿酸精华 50ml'
          : '비건 히알루론산 앰플 50ml'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const timers: ReturnType<typeof setTimeout>[] = []
    blocks.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealed(i + 1), 400 + i * 350))
    })
    return () => timers.forEach(clearTimeout)
  }, [visible, blocks.length])

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-full">{L.badge}</span>
          <h2 className="text-4xl md:text-5xl font-black text-black mt-6 mb-4 tracking-tight">
            {L.h2a}<br />{L.h2b}
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">{L.sub}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs font-bold text-gray-400">{L.inputTitle}</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">{L.product}</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">{productName}</div>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">{L.category}</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">{L.categoryVal}</div>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">{L.desc}</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 leading-relaxed">{L.descVal}</div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-black">✓</span>
              {L.timeNote}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-4 ml-2">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{L.outputTitle}</span>
            </div>
            <div className="space-y-3">
              {blocks.map((section, i) => (
                <div
                  key={i}
                  className={`bg-white border rounded-2xl p-4 shadow-sm transition-all duration-500 ${
                    revealed > i ? 'opacity-100 translate-y-0 border-gray-200' : 'opacity-0 translate-y-4 border-transparent'
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-xs font-black mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-black text-black leading-snug mb-1">{section.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line line-clamp-2">{section.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {revealed >= blocks.length && (
              <div className="mt-4 flex items-center justify-between bg-black rounded-2xl p-4 animate-fade-up">
                <div>
                  <p className="text-white font-black text-sm">{L.doneTitle}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{L.doneSub}</p>
                </div>
                <Link href="/login" className="bg-white text-black text-xs font-black px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                  {L.cta}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/samples"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors border border-gray-200 bg-white px-6 py-3 rounded-xl hover:border-gray-400"
          >
            {L.samples}
          </Link>
        </div>
      </div>
    </section>
  )
}
