import type { UiLang } from '@/lib/uiLocale'

type Section = { name: string; title: string; body: string }

export type EvidenceRow = {
  sectionLabel: string
  rationale: string
  footnoteHint: string
}

export type ListingEvidencePack = {
  rows: EvidenceRow[]
  copyBlock: string
}

export function buildListingEvidencePack(
  lang: UiLang,
  productName: string,
  category: string,
  sections: Section[],
): ListingEvidencePack {
  const rows: EvidenceRow[] = sections.slice(0, 8).map(s => {
    if (lang === 'ko') {
      return {
        sectionLabel: `${s.name}: ${s.title}`,
        rationale: `이 문단은 ${category} 구매자가 흔히 비교하는 "${s.title}" 관점에서 ${productName}의 맥락을 설명합니다.`,
        footnoteHint: `[출처] 스펙·가격은 판매 시점의 공식 페이지를 인용하세요. 수치는 발행일 기준으로 명시.`,
      }
    }
    if (lang === 'ja') {
      return {
        sectionLabel: `${s.name}: ${s.title}`,
        rationale: `この段落は${category}購入者が比較しやすい「${s.title}」の観点で${productName}の文脈を説明します。`,
        footnoteHint: '[出典] 仕様・価格は販売時点の公式ページを引用してください。',
      }
    }
    if (lang === 'zh') {
      return {
        sectionLabel: `${s.name}: ${s.title}`,
        rationale: `本段从「${s.title}」角度说明 ${productName} 在 ${category} 场景下的语境，便于读者比较。`,
        footnoteHint: '[来源] 规格与价格请以当时官方页面为准并标注日期。',
      }
    }
    return {
      sectionLabel: `${s.name}: ${s.title}`,
      rationale: `This block answers a common ${category} buyer question (“${s.title}”) in context of ${productName}.`,
      footnoteHint: '[Source] Cite official specs/pricing pages as of publication; label measurement dates for stats.',
    }
  })

  const header =
    lang === 'ko'
      ? `근거 요약 · ${productName} (${category})\n본 문서는 자동 생성 초안이며 수치·인용은 사용자가 검증해야 합니다.\n`
      : lang === 'ja'
        ? `根拠メモ · ${productName}（${category}）\n自動下書き — 数値・引用は必ずご確認ください。\n`
        : lang === 'zh'
          ? `依据摘要 · ${productName}（${category}）\n自动草稿 — 数字与引用请自行核实。\n`
          : `Evidence memo · ${productName} (${category})\nAuto draft — verify numbers and citations before external use.\n`

  const why =
    lang === 'ko' ? '왜' : lang === 'ja' ? '理由' : lang === 'zh' ? '理由' : 'Why'

  const copyBlock =
    header +
    rows
      .map(
        (r, i) =>
          `${i + 1}. ${r.sectionLabel}\n   — ${why}: ${r.rationale}\n   — ${r.footnoteHint}\n`,
      )
      .join('\n')

  return { rows, copyBlock }
}
