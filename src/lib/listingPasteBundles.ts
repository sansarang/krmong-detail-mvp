import type { PublishPlatform } from '@/lib/orderResultUi'
import type { UiLang } from '@/lib/uiLocale'

type Sec = { title: string; body: string }

function stripHtmlish(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function bulletLines(sections: Sec[], max = 6): string {
  return sections
    .slice(0, max)
    .map(s => stripHtmlish(s.title))
    .filter(Boolean)
    .map((t, i) => `${i + 1}. ${t}`)
    .join('\n')
}

function detailHtmlish(sections: Sec[], productName: string, category: string): string {
  const parts = sections.map(s => `<h3>${s.title}</h3>\n<p>${s.body.replace(/\n/g, '</p>\n<p>')}</p>`)
  return `<div class="detail-ai-draft">\n<p><strong>${productName}</strong> · ${category}</p>\n${parts.join('\n')}\n</div>`
}

/** Plain-text detail for marketplaces that prefer no HTML */
function detailPlain(sections: Sec[]): string {
  return sections.map(s => `■ ${s.title}\n${s.body}`).join('\n\n')
}

export function buildListingPasteBundle(
  platform: PublishPlatform,
  lang: UiLang,
  input: {
    productName: string
    category: string
    sections: Sec[]
    metaTitle?: string
    metaDescription?: string
  },
): string {
  if (platform !== 'smartstore' && platform !== 'coupang') return ''

  const { productName, category, sections } = input
  const metaTitle = input.metaTitle?.trim() || `${productName} ${category}`.slice(0, 50)
  const metaDesc = (input.metaDescription || sections.map(s => s.title).join(' · ')).slice(0, 160)
  const bullets = bulletLines(sections)
  const detail = detailPlain(sections).slice(0, 8000)
  const seoTags = [category, productName, `${category} 추천`, `${productName} 후기`]
    .join(', ')
    .slice(0, 200)

  if (lang === 'ko') {
    if (platform === 'smartstore') {
      return [
        '━━ 스마트스토어 · 붙여넣기 초안 ━━',
        '',
        '[상품명]',
        metaTitle.slice(0, 50),
        '',
        '[SEO 검색어 / 태그]',
        seoTags,
        '',
        '[대표 문구(요약)]',
        metaDesc,
        '',
        '[옵션·구성 안내용 불릿]',
        bullets || '(섹션 제목을 불릿으로 옮겨 쓰세요)',
        '',
        '[상세 설명 (에디터에 붙인 뒤 서식만 조정)]',
        detail,
        '',
        '[이미지]',
        '대표: 1000×1000 이상 권장. 상세: 가로 860px 내외에 맞추면 깨짐이 적습니다.',
        '',
        '[안내]',
        '실제 금칙어·카테고리별 필수표기는 셀러센터 최신 정책을 확인하세요.',
      ].join('\n')
    }
    return [
      '━━ 쿠팡 윙 · 붙여넣기 초안 ━━',
      '',
      '[노출 상품명]',
      metaTitle.slice(0, 50),
      '',
      '[핵심 사항 요약]',
      metaDesc,
      '',
      '[상세 설명용 불릿]',
      bullets,
      '',
      '[상세 본문]',
      detail,
      '',
      '[이미지]',
      '대표 1000×1000 이상. 상세 페이지는 가로 기준 레이아웃에 맞게 여백을 두세요.',
      '',
      '[안내]',
      '과장·치료 효과 표현, 비교 광고 문구는 윙 정책에 따라 제한될 수 있습니다.',
    ].join('\n')
  }

  if (lang === 'ja') {
    const hdr = platform === 'smartstore' ? '━━ Smartstore 下書き ━━' : '━━ Coupang Wing 下書き ━━'
    return [
      hdr,
      '',
      '[商品名]',
      metaTitle.slice(0, 50),
      '',
      '[要約]',
      metaDesc,
      '',
      '[箇条書き]',
      bullets,
      '',
      '[詳細]',
      detail,
    ].join('\n')
  }

  if (lang === 'zh') {
    const hdr = platform === 'smartstore' ? '━━ Smartstore 草稿 ━━' : '━━ Coupang Wing 草稿 ━━'
    return [hdr, '', '[商品名]', metaTitle.slice(0, 50), '', '[摘要]', metaDesc, '', '[要点]', bullets, '', '[详情]', detail].join(
      '\n',
    )
  }

  const header =
    platform === 'smartstore' ? '━━ Naver Smartstore paste draft ━━' : '━━ Coupang Wing paste draft ━━'
  return [
    header,
    '',
    '[Product name]',
    metaTitle.slice(0, 50),
    '',
    '[Short summary]',
    metaDesc,
    '',
    '[Bullets]',
    bullets,
    '',
    '[Detail body]',
    detail,
    '',
    '[Images]',
    'Hero 1000×1000+ recommended. Match marketplace image rules before publish.',
  ].join('\n')
}

export function listingBundleUsesPlainText(platform: PublishPlatform): boolean {
  return platform === 'smartstore' || platform === 'coupang'
}

/** Optional HTML block for smartstore rich editor experiments */
export function buildListingDetailHtmlDraft(productName: string, category: string, sections: Sec[]): string {
  return detailHtmlish(sections, productName, category)
}
