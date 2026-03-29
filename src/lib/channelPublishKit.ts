import type { UiLang } from '@/lib/uiLocale'
import type { PublishPlatform } from '@/lib/orderResultUi'

export type ChannelKitFamily = 'naver' | 'tistory' | 'wordpress' | 'instagram' | 'brunch'

export type ChannelPublishKitContent = {
  strategy: string
  conversionBullets: string[]
  packagingBullets: string[]
  hooks: [string, string]
}

type Ctx = { productName: string; category: string; hook: string }

type KitTemplate = {
  strategy: string
  conversionBullets: string[]
  packagingBullets: string[]
  hook1: string
  hook2: string
}

function fill(s: string, c: Ctx): string {
  return s
    .replace(/\{productName\}/g, c.productName)
    .replace(/\{category\}/g, c.category)
    .replace(/\{hook\}/g, c.hook)
}

function applyKit(tpl: KitTemplate, c: Ctx): ChannelPublishKitContent {
  return {
    strategy: fill(tpl.strategy, c),
    conversionBullets: tpl.conversionBullets.map(line => fill(line, c)),
    packagingBullets: tpl.packagingBullets.map(line => fill(line, c)),
    hooks: [fill(tpl.hook1, c), fill(tpl.hook2, c)],
  }
}

const KO: Record<ChannelKitFamily, KitTemplate> = {
  naver: {
    strategy:
      '네이버 블로그는 검색·정보 탐색 유입에 강합니다. 상단에서 {hook}(으)로 관심을 잡고, 하단에서는 “구매/링크” 행동 한 가지만 짧게 제시하세요.',
    conversionBullets: [
      '첫 스크롤 안에 “누구에게 맞는지”를 한 줄로 박아 두기.',
      '가격·혜택은 링크 바로 위에 두고, 효능·치료 단정은 피하기.',
      '본문 앞부분에 {category}·상품명을 자연스럽게 한 번 이상 넣어 검색 맥락을 잡기.',
    ],
    packagingBullets: [
      '대표 이미지 1장은 썸네일과 본문 상단에 같은 구도로 쓰면 이탈이 줄어듭니다.',
      '아래 “블로그 미리보기”에서 포맷을 고른 뒤 HTML을 복사해 붙여넣으면 됩니다.',
      '“발행 전 안전 점검”에서 과장·효능 표현을 한 번 더 확인하세요.',
    ],
    hook1: '{hook} — 솔직 사용 후기',
    hook2: '{category} 고민 중이면: {productName}만 정리했어요',
  },
  tistory: {
    strategy:
      '티스토리는 구독자·외부 유입이 섞입니다. 글 제목과 첫 문단에 {hook}을 노출해 클릭 이유를 분명히 하세요.',
    conversionBullets: [
      'HTML 모드 붙여넣기 후, 모바일 미리보기로 줄바꿈·이미지 깨짐을 확인.',
      '관련 글·시리즈 링크를 넣어 체류 시간을 늘리면 전환에 유리합니다.',
      'CTA는 한 번만 강하게, 나머지는 정보 밀도로 신뢰를 쌓기.',
    ],
    packagingBullets: [
      '대표 컷·스크린샷 2~3장을 본문 중간에 균등 배치.',
      '발행 전 메타 설명(검색 스니펫)에 {productName}을 넣을지 티스토리 설정에서 확인.',
      '안전 점검 카드에서 리스크 문구를 먼저 정리한 뒤 발행.',
    ],
    hook1: '{hook} | {productName} 써본 결과',
    hook2: '{category} 살 때 놓치기 쉬운 포인트',
  },
  wordpress: {
    strategy:
      '워드프레스·자사몰·Medium·Shopify·LinkedIn 등 HTML 긴 포맷은 **SEO·전환 페이지** 역할에 가깝습니다. {hook}을 H2 근처에 두고 스캔 읽기에 맞춰 소제목을 촘촘히.',
    conversionBullets: [
      '첫 화면에 “읽으면 얻는 것”을 불릿으로 3줄 이내.',
      '버튼/링크 색은 한 가지 액션 컬러로 통일.',
      '모바일에서 CTA 버튼이 엄지 영역에 오는지 확인.',
    ],
    packagingBullets: [
      'OG 이미지·메타 설명은 플러그인 또는 테마에서 {productName} 기준으로 설정.',
      'HTML 블록 붙여넣기 후 블록 에디터가 태그를 바꾸지 않았는지 확인.',
      '영문/다국어 페이지면 hreflang·URL 구조를 한 번 점검.',
    ],
    hook1: '{hook}: {productName} 가이드',
    hook2: '{category} 구매 전에 보면 좋은 체크리스트',
  },
  instagram: {
    strategy:
      '인스타그램은 **첫 줄 캡션·커버 이미지**가 전부입니다. {hook}을 첫 줄에 두고, 본문 링크는 프로필/스토리 링크와 문구를 맞추세요.',
    conversionBullets: [
      '캡션 2~3줄마다 이모지나 줄바꿈으로 스캔 피로를 줄이기.',
      '해시태그는 소수 정예 + 브랜드/카테고리 혼합.',
      '“링크는 프로필” 문구를 CTA 직전에 고정.',
    ],
    packagingBullets: [
      '9:16 또는 4:5로 대표 컷을 잘라 피드·릴스에 재사용.',
      '캡션은 앱에서 “캡션 복사” 포맷으로 가져간 뒤 첫 줄만 수정해도 됨.',
      '스토리용 짧은 버전 문장을 따로 적어 두면 재게시에 유리.',
    ],
    hook1: '{hook} 🔥 {productName}',
    hook2: '{category} 고민? {productName} 한눈에',
  },
  brunch: {
    strategy:
      '브런치는 **읽는 리듬·문장 톤**이 곧 전환입니다. {hook}을 도입부에 두고, 과장 없이 문장 호흡으로 신뢰를 쌓는 편이 맞습니다.',
    conversionBullets: [
      '소제목 없이도 읽히도록 한 문단 길이를 짧게.',
      '마지막에만 부드럽게 구매/링크 유도.',
      '에세이 톤과 광고 톤이 섞이지 않게, 사실·경험 위주로.',
    ],
    packagingBullets: [
      '표지 이미지용 한 문장(부제)을 따로 적어 두기.',
      '플레인 텍스트 복사 후 브런치 에디터에서 굵게/인용만 최소로.',
      '안전 점검에서 걸린 표현은 브런치 독자에게도 민감할 수 있으니 순화.',
    ],
    hook1: '{hook}',
    hook2: '{productName}에 대해 솔직히 써봤습니다',
  },
}

const EN: Record<ChannelKitFamily, KitTemplate> = {
  naver: {
    strategy:
      'Naver Blog fits **search + research traffic**. Lead with {hook} up top, then keep **one clear purchase action** at the bottom.',
    conversionBullets: [
      'State “who it’s for” in one line within the first scroll.',
      'Put price/deals right above the link; avoid absolute medical/healing claims.',
      'Mention {category} and the product name naturally early for query context.',
    ],
    packagingBullets: [
      'Use the same hero crop for thumbnail and the first in-post image.',
      'Pick a format in Blog Preview, then copy HTML and paste.',
      'Run the pre-publish safety check for risky wording.',
    ],
    hook1: '{hook} — honest take',
    hook2: '{category} pick: {productName} only, compared',
  },
  tistory: {
    strategy:
      'Tistory mixes subscribers and external traffic. Make **title + first paragraph** carry {hook} so the click reason is obvious.',
    conversionBullets: [
      'After HTML paste, check mobile preview for breaks/images.',
      'Add related posts to increase time-on-page.',
      'One strong CTA; build trust with information density.',
    ],
    packagingBullets: [
      'Space 2–3 images through the body.',
      'Confirm snippet/meta includes {productName} if available in settings.',
      'Fix risky lines from the safety check before publish.',
    ],
    hook1: '{hook} | {productName} review',
    hook2: 'Easy-to-miss points when buying {category}',
  },
  wordpress: {
    strategy:
      'WordPress, storefronts, Medium, Shopify, LinkedIn HTML posts behave like **SEO/landing** pages. Place {hook} near an H2; use frequent subheads for skimmers.',
    conversionBullets: [
      'Above the fold: 3 bullets on what the reader gets.',
      'One accent color for primary buttons/links.',
      'Check mobile thumb reach for the main CTA.',
    ],
    packagingBullets: [
      'Set OG image/meta with {productName} in your theme or plugin.',
      'After Custom HTML paste, ensure the editor did not strip tags.',
      'For multilingual pages, verify hreflang/URL structure.',
    ],
    hook1: '{hook}: {productName} guide',
    hook2: 'Checklist before you buy {category}',
  },
  instagram: {
    strategy:
      'Instagram is **first line + cover**. Put {hook} in line one; align caption copy with profile/story link behavior.',
    conversionBullets: [
      'Use line breaks/emojis every few lines to reduce scan fatigue.',
      'Few sharp hashtags + brand/category mix.',
      'Place “link in bio” right before the CTA line.',
    ],
    packagingBullets: [
      'Crop hero to 4:5 or 9:16 for feed/Reels reuse.',
      'Paste the caption format, then tweak only the hook if needed.',
      'Keep a one-line version for Stories reposts.',
    ],
    hook1: '{hook} 🔥 {productName}',
    hook2: '{category}? {productName} at a glance',
  },
  brunch: {
    strategy:
      'Brunch rewards **cadence and tone**. Open with {hook}; build trust with calm sentences rather than hype.',
    conversionBullets: [
      'Short paragraphs even without subheads.',
      'Soft CTA only at the end.',
      'Facts/experience over ad-speak.',
    ],
    packagingBullets: [
      'Draft a one-line subtitle for the cover.',
      'Paste plain text; use bold/quote minimally.',
      'Soften wording flagged by the safety check—Brunch readers are sensitive to hype.',
    ],
    hook1: '{hook}',
    hook2: 'Honest notes on {productName}',
  },
}

const JA: Record<ChannelKitFamily, KitTemplate> = {
  naver: {
    strategy:
      'NAVERブログは検索・情報収集流入に強いです。冒頭で{hook}に注目を集め、下部では購入・リンクなど行動を1つに絞ってください。',
    conversionBullets: [
      '最初のスクロール内に「向いている人」を1行で。',
      '価格・特典はリンク直上に。効果の断定的表現は避ける。',
      '本文前段に{category}・商品名を自然に1回以上。',
    ],
    packagingBullets: [
      'サムネと本文先頭は同じ構図の画像がおすすめ。',
      'プレビューで形式を選び、HTMLをコピーして貼り付け。',
      '公開前チェックで誇大表現を確認。',
    ],
    hook1: '{hook} — 正直レビュー',
    hook2: '{category}なら {productName} だけ整理',
  },
  tistory: {
    strategy:
      'Tistoryは購読と外部流入が混在します。タイトルと第1段落で{hook}を見せ、クリック理由を明確に。',
    conversionBullets: [
      'HTML貼り付け後、モバイル表示で改行・画像を確認。',
      '関連記事リンクで滞在時間を伸ばす。',
      'CTAは1つを強く、情報密度で信頼を作る。',
    ],
    packagingBullets: [
      '本文中に画像2〜3枚を分散。',
      '設定でスニペットに{productName}を含めるか確認。',
      'リスク表現はチェック後に修正。',
    ],
    hook1: '{hook} | {productName} レビュー',
    hook2: '{category} で見落としがちな点',
  },
  wordpress: {
    strategy:
      'WordPressや自社サイト、Medium等のHTML長文はSEO・ランディング色が強いです。{hook}をH2付近に。見出しを細かくしてスキャン読みへ。',
    conversionBullets: [
      'ファーストビューで「読むと得ること」を3行以内の箇条書きに。',
      '主CTAの色を1つに統一。',
      'スマホで親指が届く位置にボタンがあるか確認。',
    ],
    packagingBullets: [
      'OG・メタに{productName}を反映。',
      'HTMLブロック貼り付け後、タグが壊れていないか確認。',
      '多言語ならhreflangも点検。',
    ],
    hook1: '{hook}: {productName} ガイド',
    hook2: '{category} 購入前チェックリスト',
  },
  instagram: {
    strategy:
      'Instagramは1行目とカバーが主戦場です。{hook}を先頭に。プロフィールリンク誘導の文言と揃えてください。',
    conversionBullets: [
      '数行ごとに改行・絵文字で負担を減らす。',
      'ハッシュタグは少数精鋭＋カテゴリ。',
      '「リンクはプロフィール」をCTA直前に。',
    ],
    packagingBullets: [
      '4:5や9:16にトリミングして再利用。',
      'キャプションコピー後、フックだけ編集でも可。',
      'ストーリー用の短文を別途用意。',
    ],
    hook1: '{hook} 🔥 {productName}',
    hook2: '{category}？ {productName} まとめ',
  },
  brunch: {
    strategy:
      'Brunchは文章のリズムとトーンが成果に直結します。{hook}で入り、誇張より事実・体験で信頼を。',
    conversionBullets: [
      '小見出しなしでも読める段落の長さに。',
      '最後にやわらかく購入・リンクへ。',
      '広告口調とエッセイ口調が混ざらないように。',
    ],
    packagingBullets: [
      '表紙用の副題を1行用意。',
      'プレーンテキスト貼り付け後、装飾は最小限に。',
      'チェックで引っかかった表現は読者にも敏感なので弱める。',
    ],
    hook1: '{hook}',
    hook2: '{productName} について正直に書きました',
  },
}

const ZH: Record<ChannelKitFamily, KitTemplate> = {
  naver: {
    strategy:
      'Naver 博客适合搜索与“做功课”流量。用 {hook} 抓住开头注意力，文末只保留**一个**清晰的购买/链接行动。',
    conversionBullets: [
      '首屏内用一行写清“适合谁”。',
      '价格与优惠放在链接正上方，避免疗效类绝对化表述。',
      '正文前段自然出现 {category} 与商品名，帮助搜索语境。',
    ],
    packagingBullets: [
      '封面图与正文首张图尽量同一构图。',
      '在预览里选好格式后复制 HTML 粘贴。',
      '发布前用安全检查扫一遍风险用语。',
    ],
    hook1: '{hook} — 真实使用感受',
    hook2: '{category} 选购：只整理 {productName}',
  },
  tistory: {
    strategy:
      'Tistory 混合订阅与外链流量。标题与第一段就要露出 {hook}，让点击理由一目了然。',
    conversionBullets: [
      'HTML 粘贴后在移动端检查换行与图片。',
      '用相关文章拉长停留时间。',
      'CTA 只强推一个，用信息密度建立信任。',
    ],
    packagingBullets: [
      '正文均匀插入 2–3 张图。',
      '在设置里确认摘要/元信息是否含 {productName}。',
      '先处理安全检查提示再发布。',
    ],
    hook1: '{hook} | {productName} 测评',
    hook2: '买 {category} 时容易忽略的点',
  },
  wordpress: {
    strategy:
      'WordPress、独立站、Medium 等长 HTML 更偏 **SEO/落地页**。把 {hook} 放在二级标题附近，多用小标题方便扫读。',
    conversionBullets: [
      '首屏用不超过三行的要点说明“读完能得到什么”。',
      '主按钮/链接颜色统一为一个行动色。',
      '检查手机端主 CTA 是否在拇指易触区域。',
    ],
    packagingBullets: [
      '在主题或插件里设置含 {productName} 的 OG 图与描述。',
      '自定义 HTML 粘贴后确认编辑器没有剥掉标签。',
      '多语言站点顺便检查 hreflang 与 URL。',
    ],
    hook1: '{hook}：{productName} 指南',
    hook2: '下单 {category} 前的清单',
  },
  instagram: {
    strategy:
      'Instagram **首行文案 + 封面**决定成败。首行放 {hook}，并与主页/快拍链接引导话术一致。',
    conversionBullets: [
      '每隔几行用换行或表情降低扫读疲劳。',
      '标签少而精，搭配品类词。',
      '在 CTA 行前固定放“链接见主页”。',
    ],
    packagingBullets: [
      '按 4:5 或 9:16 裁切以便动态/Reels 复用。',
      '粘贴配文后可只改钩子句。',
      '另备一句适合快拍的短文案。',
    ],
    hook1: '{hook} 🔥 {productName}',
    hook2: '{category}？一文看懂 {productName}',
  },
  brunch: {
    strategy:
      'Brunch 吃**语气与节奏**。用 {hook} 开场，用事实与体验堆信任，少用喊口号式夸张。',
    conversionBullets: [
      '没有小标题也要保持短段落。',
      '只在结尾轻柔引导购买/链接。',
      '避免广告腔与随笔腔混用。',
    ],
    packagingBullets: [
      '准备一行封面副标题。',
      '纯文本粘贴后尽量少用加粗/引用。',
      '安全检查提示的用语对读者也敏感，建议弱化。',
    ],
    hook1: '{hook}',
    hook2: '关于 {productName}，如实记录',
  },
}

function tableForLang(lang: UiLang): Record<ChannelKitFamily, KitTemplate> {
  if (lang === 'ko') return KO
  if (lang === 'ja') return JA
  if (lang === 'zh') return ZH
  return EN
}

export function channelKitFamily(platform: PublishPlatform): ChannelKitFamily {
  if (platform === 'medium' || platform === 'shopify' || platform === 'linkedin') return 'wordpress'
  return platform as ChannelKitFamily
}

export function getChannelPublishKit(
  platform: PublishPlatform,
  lang: UiLang,
  ctx: Ctx,
): ChannelPublishKitContent {
  const family = channelKitFamily(platform)
  const tpl = tableForLang(lang)[family]
  return applyKit(tpl, ctx)
}
