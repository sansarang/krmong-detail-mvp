const SITE = 'https://pagebeer.beer'

/**
 * Comprehensive structured data for Google Rich Results + AI search (GEO)
 * Covers: SoftwareApplication, HowTo, FAQPage, Organization, WebSite, ItemList
 */
export default function HomeJsonLd() {
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PageAI',
    alternateName: ['페이지AI', 'PageAI Document Generator'],
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    url: SITE,
    description:
      'PageAI is an AI-powered document and product page generator that auto-fills any template (PDF, DOCX, XLSX) in 4 languages simultaneously — Korean, English, Japanese, and Chinese. Optimized for Amazon JP, Tmall, Rakuten, Shopify, Smartstore, and Coupang.',
    featureList: [
      '4-language simultaneous generation (Korean, English, Japanese, Chinese)',
      'AI form auto-fill — upload PDF/DOCX and AI fills every field',
      'URL auto-scrape — paste any product URL and AI extracts all info',
      'Platform-specific optimization (Amazon A+, Tmall 详情页, Rakuten, Shopify)',
      'Business plan, proposal, report AI generation',
      'One-click ZIP download with HTML, images, and publish guide',
      'CVR (conversion rate) predictor per market',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available — no credit card required',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1240',
      bestRating: '5',
    },
    screenshot: `${SITE}/og-image.png`,
    inLanguage: ['ko', 'en', 'ja', 'zh'],
    availableLanguage: ['Korean', 'English', 'Japanese', 'Chinese'],
    keywords:
      'AI document generator, form auto-fill AI, multilingual product page, Amazon JP listing AI, Tmall description AI, 4 language AI content, cross-border ecommerce AI, business plan AI, 상세페이지 AI, 양식 자동작성',
  }

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Generate a Professional Document in 4 Languages with PageAI',
    description:
      'Upload any form or paste a product URL, and PageAI will generate expert-level content in Korean, English, Japanese, and Chinese in under 5 minutes.',
    totalTime: 'PT5M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload form or paste URL',
        text: 'Attach a PDF, DOCX, or XLSX template — or paste any product URL (Amazon, Tmall, Shopify, Smartstore, Coupang). AI auto-extracts all product info and form structure in ~30 seconds.',
        url: `${SITE}/order/new`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select languages and target markets',
        text: 'Choose 1–4 languages (KR, EN, JP, CN) and your target platforms (Amazon JP, Tmall, Rakuten, Shopify, Smartstore, Coupang). AI auto-activates 4-language simultaneous generation when multiple markets are selected.',
        url: `${SITE}/order/new`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'AI generates expert-level content in 60 seconds',
        text: 'AI fills every form field or creates a full product page with platform-specific formatting. Japanese gets keigo formality, Chinese gets 天猫爆款 style, English gets Amazon A+ bullet structure.',
        url: `${SITE}/order/new`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Review, edit, and download or publish',
        text: 'Inline-edit any section on the result page. Download as ZIP (HTML + images + publish guide), copy HTML, or export to PDF/DOCX. Ready for Amazon A+, Tmall 详情页, Rakuten, Shopify, Smartstore.',
        url: `${SITE}/order/new`,
      },
    ],
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is PageAI and what can it do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PageAI is an AI platform that auto-generates professional documents and product pages in 4 languages (Korean, English, Japanese, Chinese). Upload any form (PDF/DOCX/XLSX) or paste a product URL, and AI fills every field at expert level in under 5 minutes. Supported use cases include business plans, proposals, reports, assignments, product pages for Amazon JP, Tmall, Rakuten, Shopify, Smartstore, and Coupang.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can PageAI really generate content in 4 languages at the same time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Select "All Languages" or choose multiple markets, and PageAI generates Korean, English, Japanese, and Chinese outputs in one click. Each language is culturally localized — not just translated. Japanese uses keigo (polite form), Chinese follows 天猫爆款 social-proof structure, and English uses Amazon A+ benefit-first bullet format.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the AI form auto-fill feature work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload a PDF, DOCX, or XLSX template. PageAI\'s AI analyzes the structure, identifies all blank fields and items, and fills them with expert-level, contextually appropriate content. You can also paste reference information to guide the AI. The result mirrors your original form structure with AI-completed content in each field.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which e-commerce platforms does PageAI support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PageAI auto-optimizes content for Amazon JP (A+ Content, 5-bullet format), Tmall (天猫详情页 structure, social proof), Rakuten (keigo style, seasonal emphasis), Shopify (brand story, SEO meta), Smartstore (Korean SEO, mobile-first), Coupang (spec + A/S focused), Qoo10, Lazada, Temu, AliExpress, and SHEIN.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does PageAI cost compared to outsourcing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Multilingual content outsourcing typically costs $800–$2,400 per month. PageAI Pro costs $29/month for unlimited generations — a 95%+ cost reduction. The free tier lets you try the service without a credit card.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to create a full multilingual product page or document?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '30 seconds for input + 60 seconds for AI generation = under 2 minutes total for a complete multilingual set. Compared to 2+ weeks for professional multilingual outsourcing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is PageAI real localization or just machine translation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Real cultural localization. Japan: keigo formality + seasonal nuance + quality-trust structure. China: KOL references + social proof + promo-first ordering. English: benefit-first + numerical trust + scannable bullets. Each country\'s persuasion logic is built in, not just translated.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I generate business plans, proposals, and reports — not just product pages?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. PageAI\'s Form Auto-Fill feature handles any document template: business plans, project proposals, RFP responses, performance reports, grant applications, research papers, IR pitch decks, academic reports, assignments, and more. Upload the template and AI fills every field professionally.',
        },
      },
      {
        '@type': 'Question',
        name: '페이지AI는 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PageAI는 양식(PDF/DOCX/XLSX)을 업로드하거나 제품 URL을 붙여넣으면 AI가 5분 내에 전문가 수준의 문서나 상세페이지를 4개국어(한국어·영어·일본어·중국어)로 완성해주는 서비스입니다. 사업계획서·제안서·보고서·과제·스마트스토어·쿠팡·Amazon·Tmall 상세페이지 모두 지원합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '4개 언어를 동시에 생성하면 번역과 다른가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '번역이 아닌 문화적 현지화입니다. 일본어는 경어체와 계절감, 중국어는 天猫爆款 스타일과 사회적 증거, 영어는 Amazon A+ 형식으로 각 나라에 맞는 설득 논리를 갖춰 생성합니다.',
        },
      },
    ],
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PageAI',
    alternateName: ['페이지AI', 'pagebeer'],
    url: SITE,
    logo: `${SITE}/logo.png`,
    description:
      'AI-powered multilingual document and product page generator. Supports Korean, English, Japanese, and Chinese content creation for global e-commerce platforms.',
    sameAs: [
      'https://twitter.com/pageai_app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['Korean', 'English', 'Japanese', 'Chinese'],
    },
    foundingDate: '2024',
    areaServed: ['KR', 'US', 'JP', 'CN', 'SG'],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PageAI',
    url: SITE,
    description:
      'Upload any form or URL — AI generates professional documents and product pages in 4 languages in 5 minutes.',
    publisher: { '@type': 'Organization', name: 'PageAI', url: SITE },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/blog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['ko', 'en', 'ja', 'zh'],
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Supported E-Commerce Platforms',
    description: 'PageAI auto-optimizes content for these global e-commerce and publishing platforms',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Amazon JP', description: 'A+ Content with 5-bullet benefit-first format' },
      { '@type': 'ListItem', position: 2, name: 'Tmall (天猫)', description: '天猫详情页 structure with social proof and 爆款 style' },
      { '@type': 'ListItem', position: 3, name: 'Rakuten (楽天)', description: 'Keigo Japanese with seasonal emphasis and quality trust' },
      { '@type': 'ListItem', position: 4, name: 'Shopify', description: 'Brand story format with SEO meta optimization' },
      { '@type': 'ListItem', position: 5, name: 'Smartstore', description: 'Korean SEO with mobile-first vertical layout' },
      { '@type': 'ListItem', position: 6, name: 'Coupang', description: 'Spec-focused with A/S and review-trust structure' },
      { '@type': 'ListItem', position: 7, name: 'Naver Blog', description: 'Natural review-style long-form with photo placement' },
      { '@type': 'ListItem', position: 8, name: 'Qoo10', description: 'Clean deal-first format for Japanese marketplace' },
      { '@type': 'ListItem', position: 9, name: 'Lazada', description: 'Southeast Asia price-competitive product descriptions' },
      { '@type': 'ListItem', position: 10, name: 'Temu', description: 'Global ultra-low price with fast shipping emphasis' },
    ],
  }

  const payload = [softwareApp, howTo, faq, organization, website, itemList]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
