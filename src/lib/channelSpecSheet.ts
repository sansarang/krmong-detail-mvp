import type { UiLang } from '@/lib/uiLocale'
import type { ChannelKitFamily } from '@/lib/channelPublishKit'

type Ctx = { productName: string; category: string; hook: string }

export type ChannelSpecField = { label: string; hint: string }

export type ChannelSpecSheet = {
  titleLengthHint: string
  bulletRules: string
  imageRatioGuide: string
  extraFields: ChannelSpecField[]
}

function fill(s: string, c: Ctx): string {
  return s
    .replace(/\{productName\}/g, c.productName)
    .replace(/\{category\}/g, c.category)
    .replace(/\{hook\}/g, c.hook)
}

function koSheet(family: ChannelKitFamily, c: Ctx): ChannelSpecSheet {
  if (family === 'smartstore') {
    return {
      titleLengthHint: fill('노출 상품명은 검색·썸네일에서 약 25~50자 내가 읽기 좋습니다. 브랜드+{category}+{productName} 순으로 핵심을 앞에 두세요.', c),
      bulletRules:
        '옵션명·불릿에 의약·치료·무조건 효과·1위 등 표현을 넣지 마세요. 건강기능식품은 인정 기능 외 주장 금지 범위를 셀러 정책으로 확인하세요.',
      imageRatioGuide:
        '대표 이미지 1000×1000px 이상 권장. 상세 본문 삽입 이미지는 가로 860px 전후에 맞추면 레이아웃 깨짐이 적습니다.',
      extraFields: [
        { label: 'SEO 검색어', hint: fill('{category}, {productName}, 후기, 추천 — 중복·과다 태깅은 노출에 불리할 수 있어요.', c) },
        { label: '대표 문구(요약)', hint: '검색 결과·목록에 나오는 한 줄. 숫자·근거는 출처가 있을 때만.' },
        { label: '상세 상단', hint: fill('첫 3초에 {hook}을 보여 주고, 아래로 스펙·사용법을 이어가세요.', c) },
      ],
    }
  }
  if (family === 'coupang') {
    return {
      titleLengthHint: fill('노출 상품명은 플랫폼 가이드에 맞춰 핵심 키워드를 앞쪽에. {productName}·{category} 조합을 자연스럽게.', c),
      bulletRules:
        '비교·최저가·병원급 등 표현은 제한될 수 있습니다. 리뷰 인용 시 출처·기간을 명시하는 편이 안전합니다.',
      imageRatioGuide: '대표 1000×1000 이상. 상세는 세로 롱폼보다 단락·이미지 교차가 읽기 좋습니다.',
      extraFields: [
        { label: '핵심 사항', hint: '배송·교환·A/S 한 줄 요약은 필수에 가깝게 셀러센터 기준을 따르세요.' },
        { label: '상세 본문', hint: fill('본문 AI 초안은 HTML/에디터에 붙인 뒤 금칙어 필터·필수 고지 문구를 덧붙이세요.', c) },
      ],
    }
  }
  if (family === 'instagram') {
    return {
      titleLengthHint: '피드는 첫 줄만 보이는 경우가 많습니다. 이모지·줄바꿈으로 스캔 피로를 줄이세요.',
      bulletRules: '“링크는 프로필” 고정 문구와 실제 링크 위치를 맞추세요. 허위 후기·과장은 광고 표기 규정을 확인하세요.',
      imageRatioGuide: '피드 4:5, 릴스·스토리 9:16. 동일 제품은 한 컷을 여러 비율로 크롭해 재사용하세요.',
      extraFields: [
        { label: '첫 줄 훅', hint: fill('{hook}을 그대로 쓰거나 40자 내로 압축.', c) },
        { label: '해시태그', hint: fill('브랜드 1~2개 + {category} 롱테일 소수 정예.', c) },
      ],
    }
  }
  if (family === 'naver') {
    return {
      titleLengthHint: fill('검색·모바일 목록에서 제목 앞부분이 잘립니다. {hook} + {productName}을 앞쪽에 두세요.', c),
      bulletRules: '효능·치료·1위·무조건 등은 블로그도 과장광고 리스크가 있습니다. 체감·경험 서술로 바꾸세요.',
      imageRatioGuide: '썸네일과 본문 첫 이미지를 같은 대표 컷으로 통일하면 이탈이 줄어듭니다.',
      extraFields: [
        { label: '본문 첫 문단', hint: fill('{category} 검색 의도에 맞게 상품명을 한 번 이상 자연스럽게.', c) },
        { label: '태그/공개 범위', hint: '스마트에디터·HTML 탭 전환 시 스타일이 바뀌는지 발행 전에 확인.' },
      ],
    }
  }
  // tistory | wordpress | brunch
  return {
    titleLengthHint: fill('제목 60자 내외 + 검색 키워드({category}, {productName})를 과밀하지 않게.', c),
    bulletRules: '불릿은 3~7개가 읽기 좋습니다. 각 줄은 한 가지 메시지에 집중하고 과장 표현은 피하세요.',
    imageRatioGuide: '본문 가로 최대폭에 맞춰 업로드(보통 680~1200px). WebP/적정 용량으로 LCP를 지키세요.',
    extraFields: [
      { label: '메타 설명', hint: fill('검색 스니펫용 120~160자. {productName}과 차별 포인트 한 가지.', c) },
      { label: 'CTA 위치', hint: '본문 중복 링크보다 하단 한 번 강한 CTA가 전환에 유리한 경우가 많습니다.' },
    ],
  }
}

function enSheet(family: ChannelKitFamily, c: Ctx): ChannelSpecSheet {
  if (family === 'smartstore') {
    return {
      titleLengthHint: fill('Keep listing titles scannable (roughly 25–50 chars). Lead with brand + {category} + {productName}.', c),
      bulletRules:
        'Avoid medical claims, guaranteed outcomes, and superlatives without proof. Check marketplace policy for regulated categories.',
      imageRatioGuide: 'Hero 1000×1000+; detail images near 860px wide reduce layout breakage on Naver listings.',
      extraFields: [
        { label: 'SEO tags', hint: fill('{category}, {productName}, review — avoid stuffing.', c) },
        { label: 'Summary line', hint: 'One line for search/listing snippets; cite numbers only with sources.' },
      ],
    }
  }
  if (family === 'coupang') {
    return {
      titleLengthHint: fill('Front-load the buyer reason and {productName} within platform title limits.', c),
      bulletRules: 'Comparative or “lowest price” claims may be restricted. Attribute quotes and time ranges when citing reviews.',
      imageRatioGuide: 'Hero 1000×1000+; alternate images and short paragraphs for mobile readability.',
      extraFields: [
        { label: 'Key notices', hint: 'Shipping/returns/CS lines should follow Wing’s latest checklist.' },
        { label: 'Detail body', hint: 'Paste draft, then run policy filters and mandatory disclosures.' },
      ],
    }
  }
  if (family === 'instagram') {
    return {
      titleLengthHint: 'First line is the hook in feed; keep it short with intentional line breaks.',
      bulletRules: 'Match “link in bio” copy to the actual destination. Label ads per local rules.',
      imageRatioGuide: '4:5 feed, 9:16 Reels/Stories — crop one hero asset into multiple ratios.',
      extraFields: [
        { label: 'Hook', hint: fill('Use {hook} or compress under ~40 chars.', c) },
        { label: 'Hashtags', hint: fill('Brand tags + a few {category} long-tails.', c) },
      ],
    }
  }
  if (family === 'naver') {
    return {
      titleLengthHint: fill('Mobile SERP truncates titles; put {hook} + {productName} early.', c),
      bulletRules: 'Replace absolute medical/efficacy claims with experience-based wording.',
      imageRatioGuide: 'Match thumbnail and first in-post image for continuity.',
      extraFields: [
        { label: 'Lead paragraph', hint: fill('Mention {category} and the product naturally once early.', c) },
        { label: 'Editor mode', hint: 'Re-check formatting when switching smart/HTML tabs.' },
      ],
    }
  }
  return {
    titleLengthHint: fill('Title ~60 chars with {category}/{productName} without stuffing.', c),
    bulletRules: '3–7 bullets, one idea per line; avoid unsubstantiated superlatives.',
    imageRatioGuide: 'Resize to your theme width (often 680–1200px); compress for performance.',
    extraFields: [
      { label: 'Meta description', hint: fill('120–160 chars with one clear differentiator for {productName}.', c) },
      { label: 'CTA', hint: 'One strong bottom CTA often beats many mid-post links.' },
    ],
  }
}

export function buildChannelSpecSheet(family: ChannelKitFamily, lang: UiLang, c: Ctx): ChannelSpecSheet {
  const base = lang === 'ko' ? koSheet(family, c) : enSheet(family, c)
  return {
    titleLengthHint: fill(base.titleLengthHint, c),
    bulletRules: fill(base.bulletRules, c),
    imageRatioGuide: fill(base.imageRatioGuide, c),
    extraFields: base.extraFields.map(f => ({ label: f.label, hint: fill(f.hint, c) })),
  }
}
