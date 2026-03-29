import type { UiLang } from '@/lib/uiLocale'

type Section = { title: string; body: string }

export type ListingAssetKit = {
  thumbnailLines: [string, string, string]
  ratioRows: { ratio: string; use: string }[]
  slotChecklist: string[]
  copyBlock: string
}

export function buildListingAssetKit(
  lang: UiLang,
  productName: string,
  category: string,
  sections: Section[],
): ListingAssetKit {
  const h = sections[0]?.title ?? productName

  const thumbnailLines: [string, string, string] =
    lang === 'ko'
      ? [
          `${h} | ${category} 한눈에`,
          `${productName} 써본 솔직 정리`,
          `${category} 고민? 지금 보는 이유`,
        ]
      : lang === 'ja'
        ? [
            `${h} | ${category}まとめ`,
            `${productName} 正直メモ`,
            `${category}で迷うなら`,
          ]
        : lang === 'zh'
          ? [`${h} | ${category}速览`, `${productName} 真实记录`, `还在选${category}？`]
          : [
              `${h} | ${category} breakdown`,
              `Honest notes: ${productName}`,
              `Why ${category} buyers stop here`,
            ]

  const ratioRows: { ratio: string; use: string }[] =
    lang === 'ko'
      ? [
          { ratio: '1:1 (1080×1080)', use: '스마트스토어 대표·인스타 피드 정사각' },
          { ratio: '4:5 (1080×1350)', use: '인스타 피드 세로 강조' },
          { ratio: '9:16 (1080×1920)', use: '릴스·쇼츠·스토리 풀세로' },
          { ratio: '16:9 (1920×1080)', use: '유튜브 썸네일·블로그 상단 와이드' },
        ]
      : [
          { ratio: '1:1 (1080×1080)', use: 'Marketplace hero + IG square' },
          { ratio: '4:5 (1080×1350)', use: 'IG feed vertical emphasis' },
          { ratio: '9:16 (1080×1920)', use: 'Reels / Shorts / Stories' },
          { ratio: '16:9 (1920×1080)', use: 'YouTube thumb / blog hero' },
        ]

  const slotChecklist =
    lang === 'ko'
      ? [
          '대표 컷: 제품 실물 + 사용 맥락 한 장에',
          '디테일 컷: 질감·구성·사이즈 참고 각도',
          '텍스트 오버레이는 짧은 한 줄(썸네일 3안 중 택1)',
          '채널별로 동일 사진을 비율만 바꿔 재출력',
        ]
      : lang === 'ja'
        ? ['代表：実物＋文脈', '詳細：質感・同梱・サイズ感', '短いテキストはサムネ3案から1つ', '同じカットを比率違いで使い回し']
        : lang === 'zh'
          ? ['主图：实物+场景', '细节：质感与规格', '缩略图文案从三选一', '一图多比例复用']
          : ['Hero: product-in-context', 'Detail: texture/packaging/scale', 'One short line from thumbnail variants', 'Reuse one shoot across ratios']

  const copyBlock = [
    lang === 'ko' ? '━━ 썸네일·비율 키트 ━━' : '━━ Thumbnail & ratio kit ━━',
    '',
    ...(lang === 'ko' ? ['[썸네일 한 줄 3안]', ...thumbnailLines.map((t, i) => `${i + 1}. ${t}`)] : ['[3 one-liners]', ...thumbnailLines.map((t, i) => `${i + 1}. ${t}`)]),
    '',
    lang === 'ko' ? '[비율 가이드]' : '[Ratios]',
    ...ratioRows.map(r => `- ${r.ratio}: ${r.use}`),
    '',
    lang === 'ko' ? '[슬롯 체크]' : '[Slots]',
    ...slotChecklist.map(s => `- ${s}`),
  ].join('\n')

  return { thumbnailLines, ratioRows, slotChecklist, copyBlock }
}
