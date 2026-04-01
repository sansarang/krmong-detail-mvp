import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'

export const metadata: Metadata = {
  title: 'AI 상세페이지 자동 생성 | 5분 완성 — 페이지AI',
  description: '스마트스토어·쿠팡 상세페이지를 AI로 5분 만에 자동 생성. SEO 최적화, A/B 카피, 4개 언어 동시 발행. 무료로 시작하세요.',
  keywords: [
    'AI 상세페이지', '상세페이지 자동생성', '스마트스토어 상세페이지', '쿠팡 상세페이지',
    'AI 카피라이팅', '상세페이지 만들기', 'AI 상품설명', '자동 상세페이지 생성',
    '스마트스토어 AI', '쿠팡 AI 상세페이지', '상세페이지 SEO',
  ],
  alternates: {
    canonical: 'https://pagebeer.beer',
    languages: {
      'ko': 'https://pagebeer.beer',
      'en': 'https://pagebeer.beer/en',
      'ja': 'https://pagebeer.beer/ja',
      'zh': 'https://pagebeer.beer/zh',
      'x-default': 'https://pagebeer.beer/en',
    },
  },
  openGraph: {
    title: 'AI 상세페이지 자동 생성 | 5분 완성 — 페이지AI',
    description: '스마트스토어·쿠팡 상세페이지를 AI로 5분 만에 자동 생성. SEO 최적화, A/B 카피, 4개 언어 동시 발행.',
    url: 'https://pagebeer.beer',
    siteName: '페이지AI',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: 'https://pagebeer.beer/og-image.png', width: 1200, height: 630, alt: 'AI 상세페이지 자동생성 — 페이지AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 상세페이지 자동 생성 | 5분 완성 — 페이지AI',
    description: '스마트스토어·쿠팡 상세페이지를 AI로 5분 만에 자동 생성. 무료로 시작하세요.',
    images: ['https://pagebeer.beer/og-image.png'],
  },
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '페이지AI',
  alternateName: ['PageAI', 'AI 상세페이지 생성기'],
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  url: 'https://pagebeer.beer',
  description: 'AI 상세페이지 자동 생성 서비스. 스마트스토어, 쿠팡, Amazon JP, Tmall 등 6개 플랫폼 최적화. 4개 언어 동시 생성.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
    description: '무료 플랜: 월 5회 생성',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1240',
    bestRating: '5',
  },
  inLanguage: ['ko', 'en', 'ja', 'zh'],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '페이지AI는 어떤 서비스인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '페이지AI는 AI로 스마트스토어·쿠팡·Amazon JP·Tmall 등 플랫폼별 최적화 상세페이지를 5분 만에 자동 생성해주는 SaaS 서비스입니다. 제품 정보를 입력하거나 URL을 붙여넣으면 AI가 전문가 수준의 카피를 작성하고, 4개 언어로 동시 출력합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '상세페이지 만드는 데 얼마나 걸리나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '제품 정보 입력 후 평균 30초~2분 이내에 완성됩니다. 4개 언어(한국어·영어·일본어·중국어) 동시 생성도 3분 이내로 처리됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '무료로 사용할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 무료 플랜으로 월 5회까지 상세페이지를 생성할 수 있습니다. 프로 플랜(₩29,000/월)은 무제한 생성, 4개 언어 동시 출력, SEO 분석 리포트 등 모든 기능을 포함합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '어떤 플랫폼을 지원하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '스마트스토어, 쿠팡, Amazon JP(A+ Content 포함), 楽天市場, 天猫(Tmall), Shopify, Qoo10, Lazada 등 6개 이상의 글로벌 이커머스 플랫폼을 지원합니다. 각 플랫폼의 포맷·금칙어·SEO 규칙을 자동 적용합니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'ChatGPT로 상세페이지를 만드는 것과 무엇이 다른가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChatGPT는 범용 AI라 플랫폼별 규칙(금칙어, 포맷, SEO)을 모릅니다. 페이지AI는 스마트스토어·쿠팡·Amazon 전용으로 학습된 AI로, 플랫폼 금칙어 자동 제거, 모바일 최적화 레이아웃, SEO 키워드 배치까지 한 번에 처리합니다.',
      },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePage lang="ko" />
    </>
  )
}
