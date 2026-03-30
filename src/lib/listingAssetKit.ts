import type { UiLang } from '@/lib/uiLocale'

type Section = { title: string; body: string }

export type ImageSlotRow = {
  slot: string
  purpose: string
  ratio: string
  note: string
}

export type ChannelAssetBlock = {
  id: string
  label: string
  lines: string[]
  /** 복사용 한 덩어리 */
  blob: string
}

export type ListingAssetKit = {
  thumbnailLines: [string, string, string]
  /** 썸네일·스티커용 더 짧은 한 줄 */
  brandMicroLines: [string, string, string]
  ratioRows: { ratio: string; use: string }[]
  slotChecklist: string[]
  imageSlots: ImageSlotRow[]
  channels: ChannelAssetBlock[]
  overlaySafeZoneNotes: string[]
  /** 기본 블록 (비율+슬롯 요약) */
  copyBlock: string
  /** 채널+슬롯+비율+문구 전부 */
  copyFullPipeline: string
  /** 채널별 문구만 */
  channelsBlob: string
  /** 슬롯 플랜만 */
  slotsBlob: string
  /** 오버레이 안전 영역만 */
  safeZoneBlob: string
}

function channelBlocksKo(productName: string, category: string, h: string): ChannelAssetBlock[] {
  return [
    {
      id: 'smartstore',
      label: '스마트스토어 · 대표/목록',
      lines: [
        `${productName} | ${category}`,
        `${h.slice(0, 24)}${h.length > 24 ? '…' : ''}`,
        `${category} 비교 끝`,
      ],
      blob: '',
    },
    {
      id: 'coupang',
      label: '쿠팡 윙 · 노출 썸네일',
      lines: [
        `${productName} ${category}`,
        `${productName} 후기 요약`,
        `지금 보는 ${category} pick`,
      ],
      blob: '',
    },
    {
      id: 'instagram_feed',
      label: '인스타 피드 4:5',
      lines: [
        `${h} ✨ #${category.replace(/\s/g, '')}`,
        `${productName} 솔직 정리`,
        `링크는 프로필 👆`,
      ],
      blob: '',
    },
    {
      id: 'reels',
      label: '릴스·쇼츠 9:16',
      lines: [
        `${productName} 30초 요약`,
        `${category} 이렇게 골랐어요`,
        `다음 장면에서 디테일`,
      ],
      blob: '',
    },
    {
      id: 'naver_blog',
      label: '네이버 블로그 썸네일',
      lines: [
        `${productName} 총정리`,
        `${category} 기준 후기`,
        `${h}`,
      ],
      blob: '',
    },
  ].map(c => ({ ...c, blob: c.lines.map((l, i) => `${i + 1}. ${l}`).join('\n') }))
}

function channelBlocksEn(productName: string, category: string, h: string): ChannelAssetBlock[] {
  return [
    {
      id: 'smartstore',
      label: 'Marketplace hero (1:1)',
      lines: [`${productName} | ${category}`, h.slice(0, 28), `Compare ${category} picks`],
      blob: '',
    },
    {
      id: 'coupang',
      label: 'Coupang-style title strip',
      lines: [`${productName} ${category}`, `Honest ${productName} notes`, `Why this ${category} pick`],
      blob: '',
    },
    {
      id: 'instagram_feed',
      label: 'Instagram feed 4:5',
      lines: [`${h} ✨`, `Real notes: ${productName}`, `Link in bio 👆`],
      blob: '',
    },
    {
      id: 'reels',
      label: 'Reels / Shorts 9:16',
      lines: [`${productName} in 30s`, `How I chose ${category}`, `Details next →`],
      blob: '',
    },
    {
      id: 'naver_blog',
      label: 'Blog thumbnail',
      lines: [`${productName} breakdown`, `${category} review`, h],
      blob: '',
    },
  ].map(c => ({ ...c, blob: c.lines.map((l, i) => `${i + 1}. ${l}`).join('\n') }))
}

function imageSlotsKo(): ImageSlotRow[] {
  return [
    {
      slot: 'S1',
      purpose: '대표 / 목록 썸네일',
      ratio: '1:1 (1000×1000 이상)',
      note: '제품 단독 또는 사용 맥락 한 컷. 텍스트는 하단 20% 또는 중앙 짧게.',
    },
    {
      slot: 'S2',
      purpose: '라이프스타일 / 비교',
      ratio: '4:5 또는 3:4',
      note: '손·책상·공간 등 스케일 감. 썸네일 3안 중 1줄만 오버레이.',
    },
    {
      slot: 'S3',
      purpose: '디테일 / 질감',
      ratio: '1:1 또는 가로 860px 내',
      note: '성분·재질·구성품 클로즈업. 상세 본문 2~3번째 이미지에 배치.',
    },
    {
      slot: 'S4',
      purpose: '패키지·배송 박스',
      ratio: '1:1',
      note: '정품·구성 확인용. 과장 스티커(1위 등) 없이 실물 위주.',
    },
    {
      slot: 'S5',
      purpose: 'CTA·한 장 요약',
      ratio: '16:9 또는 1:1',
      note: '혜택·링크 유도는 짧은 문구만. 플랫폼 금칙어 확인.',
    },
  ]
}

function imageSlotsEn(): ImageSlotRow[] {
  return [
    {
      slot: 'S1',
      purpose: 'Hero / listing thumb',
      ratio: '1:1 (1000×1000+)',
      note: 'Product alone or in context. Text in bottom 20% or short center line.',
    },
    {
      slot: 'S2',
      purpose: 'Lifestyle / scale',
      ratio: '4:5 or 3:4',
      note: 'Show real-world size. One overlay line from your 3 variants.',
    },
    {
      slot: 'S3',
      purpose: 'Detail / texture',
      ratio: '1:1 or ~860px wide',
      note: 'Ingredients, texture, in-box. Place mid-scroll in detail pages.',
    },
    {
      slot: 'S4',
      purpose: 'Packaging',
      ratio: '1:1',
      note: 'Authenticity shot; avoid unverified superlative stickers.',
    },
    {
      slot: 'S5',
      purpose: 'CTA still',
      ratio: '16:9 or 1:1',
      note: 'Short benefit + link cue; check marketplace copy rules.',
    },
  ]
}

function safeZonesKo(): string[] {
  return [
    '9:16: 상·하단 UI(프로필·좋아요·캡션 영역)에 중요 텍스트를 넣지 마세요.',
    '1:1: 가장자리 8%는 플랫폼 크롭에 잘릴 수 있어 여백을 두세요.',
    '오버레이 폰트: 모바일에서 24px 미만은 피하고, 대비(명암) 확보.',
  ]
}

function safeZonesEn(): string[] {
  return [
    '9:16: Keep key text out of top/bottom UI safe areas (handles, captions).',
    '1:1: Assume ~8% edge crop on some surfaces—keep logos inside.',
    'Overlay type: aim for strong contrast; avoid tiny text on mobile.',
  ]
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

  const brandMicroLines: [string, string, string] =
    lang === 'ko'
      ? [`${productName}`, `${category} 총정리`, `지금 확인 →`]
      : lang === 'ja'
        ? [`${productName}`, `${category}まとめ`, `チェック →`]
        : lang === 'zh'
          ? [`${productName}`, `${category}整理`, `查看 →`]
          : [`${productName}`, `${category} recap`, `See more →`]

  const ratioRows: { ratio: string; use: string }[] =
    lang === 'ko'
      ? [
          { ratio: '1:1 (1080×1080)', use: '스마트스토어·쿠팡 대표, 인스타 정사각' },
          { ratio: '4:5 (1080×1350)', use: '인스타 피드 세로 강조' },
          { ratio: '9:16 (1080×1920)', use: '릴스·쇼츠·스토리' },
          { ratio: '16:9 (1920×1080)', use: '유튜브 썸네일·블로그 상단' },
        ]
      : [
          { ratio: '1:1 (1080×1080)', use: 'Marketplace hero, IG square' },
          { ratio: '4:5 (1080×1350)', use: 'IG feed vertical' },
          { ratio: '9:16 (1080×1920)', use: 'Reels / Shorts / Stories' },
          { ratio: '16:9 (1920×1080)', use: 'YouTube thumb / blog hero' },
        ]

  const slotChecklist =
    lang === 'ko'
      ? [
          '동일 촬영본에서 1:1 → 4:5 → 9:16 순으로 크롭해 채널별 재사용',
          '텍스트 오버레이: 썸네일 3안 vs 브랜드 초단문 3안 중 채널에 맞게 택1',
          '업로드 전 플랫폼별 금칙어·과장 표현을 카피와 이미지 스티커 모두 점검',
        ]
      : lang === 'ja'
        ? ['同じ素材を1:1→4:5→9:16でクロップ', 'テキストはサムネ3案か短い3案から選択', 'アップロード前にコピーとステッカーを確認']
        : lang === 'zh'
          ? ['一图多比例裁剪复用', '文案用长三句或超短三句之一', '上传前检查文字与贴纸合规']
          : ['Crop one shoot to 1:1, 4:5, 9:16', 'Pick long thumbnail set or micro lines per channel', 'Scan copy + stickers before upload']

  const imageSlots =
    lang === 'ko' ? imageSlotsKo() : lang === 'ja' || lang === 'zh' ? imageSlotsEn() : imageSlotsEn()

  const channels =
    lang === 'ko'
      ? channelBlocksKo(productName, category, h)
      : lang === 'ja' || lang === 'zh'
        ? channelBlocksEn(productName, category, h)
        : channelBlocksEn(productName, category, h)

  const overlaySafeZoneNotes = lang === 'ko' ? safeZonesKo() : safeZonesEn()

  const ratioLbl = lang === 'ko' ? '비율' : lang === 'ja' ? '比率' : lang === 'zh' ? '比例' : 'Ratio'
  const slotsBlob =
    (lang === 'ko'
      ? '━━ 이미지 슬롯 플랜 (S1–S5) ━━\n'
      : lang === 'ja'
        ? '━━ 画像スロットプラン (S1–S5) ━━\n'
        : lang === 'zh'
          ? '━━ 图片槽位计划 (S1–S5) ━━\n'
          : '━━ Image slot plan (S1–S5) ━━\n') +
    imageSlots
      .map(s => `${s.slot} · ${s.purpose}\n   ${ratioLbl}: ${s.ratio}\n   ${s.note}`)
      .join('\n\n')

  const channelsBlob =
    (lang === 'ko'
      ? '━━ 채널별 썸네일·오버레이 문구 ━━\n\n'
      : lang === 'ja'
        ? '━━ チャネル別サムネ・オーバーレイ ━━\n\n'
        : lang === 'zh'
          ? '━━ 分渠道缩略图文案 ━━\n\n'
          : '━━ Channel thumbnail / overlay copy ━━\n\n') +
    channels.map(c => `■ ${c.label}\n${c.blob}\n`).join('\n')

  const microIntro = lang === 'ko' ? '[브랜드 톤 초단문 3안 — 스티커·영상 자막]\n' : '[Brand micro-lines — stickers / captions]\n'

  const copyBlock = [
    lang === 'ko' ? '━━ 썸네일·비율 키트 ━━' : '━━ Thumbnail & ratio kit ━━',
    '',
    ...(lang === 'ko' ? ['[썸네일 한 줄 3안]', ...thumbnailLines.map((t, i) => `${i + 1}. ${t}`)] : ['[3 one-liners]', ...thumbnailLines.map((t, i) => `${i + 1}. ${t}`)]),
    '',
    microIntro,
    ...brandMicroLines.map((t, i) => `${i + 1}. ${t}`),
    '',
    lang === 'ko' ? '[비율 가이드]' : '[Ratios]',
    ...ratioRows.map(r => `- ${r.ratio}: ${r.use}`),
    '',
    lang === 'ko' ? '[슬롯 체크]' : '[Slots]',
    ...slotChecklist.map(s => `- ${s}`),
  ].join('\n')

  const safeBlob =
    (lang === 'ko'
      ? '━━ 오버레이 안전 영역 ━━\n'
      : lang === 'ja'
        ? '━━ オーバーレイ安全領域 ━━\n'
        : lang === 'zh'
          ? '━━ 叠字安全区 ━━\n'
          : '━━ Overlay safe zones ━━\n') +
    overlaySafeZoneNotes.map(s => `- ${s}`).join('\n')

  const copyFullPipeline = [
    lang === 'ko'
      ? '━━ 통합 에셋 파이프라인 ━━'
      : lang === 'ja'
        ? '━━ 統合アセットパイプライン ━━'
        : lang === 'zh'
          ? '━━ 完整素材流水线 ━━'
          : '━━ Full asset pipeline ━━',
    '',
    channelsBlob,
    '',
    slotsBlob,
    '',
    safeBlob,
    '',
    copyBlock,
  ].join('\n')

  return {
    thumbnailLines,
    brandMicroLines,
    ratioRows,
    slotChecklist,
    imageSlots,
    channels,
    overlaySafeZoneNotes,
    copyBlock,
    copyFullPipeline,
    channelsBlob,
    slotsBlob,
    safeZoneBlob: safeBlob,
  }
}
