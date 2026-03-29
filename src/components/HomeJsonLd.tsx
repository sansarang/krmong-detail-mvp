const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://krmong-detail-mvp.vercel.app'

/** 메인 페이지 FAQ + 조직 구조화 데이터 (검색 스니펫·리치 결과 보조) */
export default function HomeJsonLd() {
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '페이지AI는 정확히 어떤 서비스인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '제품 정보를 입력하면 AI가 스마트스토어·쿠팡에 최적화된 상세페이지 기획안을 자동 생성합니다. 헤드라인부터 구매 유도 CTA까지 6개 섹션을 전문 카피 수준으로 작성합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '상세페이지 1개를 만드는 데 시간이 얼마나 걸리나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '제품 정보 입력에 약 30초~2분, AI 생성에 약 30초~1분이 소요됩니다. 평균 총 5분 이내에 완성됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '생성된 상세페이지를 수정할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네. 결과 화면에서 각 섹션을 클릭하면 인라인 편집이 가능하며, PDF로 다운로드할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '외주 비용과 비교하면 얼마나 절약되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '일반적으로 상세페이지 외주 제작 비용은 30~100만원 수준입니다. 페이지AI로 대부분의 비용을 절감할 수 있습니다.',
        },
      },
    ],
  }

  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PageAI',
    alternateName: '페이지AI',
    url: SITE,
    description: 'AI 상세페이지·문서 자동 생성 서비스',
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PageAI',
    url: SITE,
    publisher: { '@type': 'Organization', name: 'PageAI' },
  }

  const payload = [org, website, faq]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
