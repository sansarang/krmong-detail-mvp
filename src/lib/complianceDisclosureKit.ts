import type { UiLang } from '@/lib/uiLocale'
import type { IndustryBucket } from '@/lib/postPublishCheck'

export type ComplianceDisclosureLine = {
  id: string
  label: string
  body: string
}

export type ComplianceDisclosurePack = {
  headline: string
  note: string
  lines: ComplianceDisclosureLine[]
  copyAllBlock: string
}

function joinBlock(lines: ComplianceDisclosureLine[]): string {
  return lines.map(l => `【${l.label}】\n${l.body}`).join('\n\n')
}

export function buildComplianceDisclosureKit(bucket: IndustryBucket, lang: UiLang): ComplianceDisclosurePack {
  if (lang === 'ko') {
    const generalLines: ComplianceDisclosureLine[] = [
      {
        id: 'gen-1',
        label: '일반',
        body: '본 글은 상업·정보 목적의 콘텐츠이며 법률·의료·투자 자문이 아닙니다. 최종 판단은 게시자·독자의 책임입니다.',
      },
      {
        id: 'gen-2',
        label: '체험·효과',
        body: '개인 사용 경험에 기반한 내용이며, 효과·체감은 사람마다 다를 수 있습니다.',
      },
    ]

    if (bucket === 'general') {
      return {
        headline: '공통 권장 고지',
        note: '카테고리 특성상 추가 의무 문구는 없지만, 과장 표현은 플랫폼·공정위 가이드를 따르세요.',
        lines: generalLines,
        copyAllBlock: joinBlock(generalLines),
      }
    }

    if (bucket === 'health') {
      const lines: ComplianceDisclosureLine[] = [
        ...generalLines,
        {
          id: 'h-1',
          label: '질병·의약품 아님',
          body: '본 제품(또는 이 글에서 다루는 제품)은 질병의 예방·진단·치료를 위한 의약품이 아닙니다.',
        },
        {
          id: 'h-2',
          label: '건강기능식품 톤',
          body: '건강기능식품은 의약품이 아니며 의약품의 효능·효과와 동일한 표현을 할 수 없습니다. 인정된 기능이 있는 경우에만 식약처 형식에 맞게 표시하세요.',
        },
        {
          id: 'h-3',
          label: '특정인 주의',
          body: '임산부·수유부, 만성질환·약물 복용 중인 경우 전문가와 상담 후 이용하세요.',
        },
      ]
      return {
        headline: '건강·영양 카테고리 고지',
        note: '실제 라벨·심의 문구는 제품 유형(일반식품/건강기능식품 등)에 맞게 반드시 확인하세요.',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }

    if (bucket === 'beauty') {
      const lines: ComplianceDisclosureLine[] = [
        ...generalLines,
        {
          id: 'b-1',
          label: '화장품 범위',
          body: '화장품은 피부·모발 등을 깨끗하게 하거나 아름답게 가꾸는 등의 목적용이며, 질환의 치료·예방을 목적으로 한 표현을 할 수 없습니다.',
        },
        {
          id: 'b-2',
          label: '사용 주의',
          body: '사용 중 이상이 있으면 사용을 중단하고 피부과 등 전문의와 상담하세요. 상세 성분은 제품 패키지를 확인하세요.',
        },
      ]
      return {
        headline: '뷰티·화장품 고지',
        note: '미백·주름·여드름 등 표현은 화장품법상 허용 범위와 심의 결과에 따라 달라질 수 있습니다.',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }

    if (bucket === 'food') {
      const lines: ComplianceDisclosureLine[] = [
        ...generalLines,
        {
          id: 'f-1',
          label: '식품 표시',
          body: '이 식품(또는 관련 표현)은 질병의 예방·치료를 위한 의약품이 아닙니다. 질병 예방·치료 효과를 기대할 수 있는 표현은 하지 마세요.',
        },
        {
          id: 'f-2',
          label: '알레르기',
          body: '알레르기 유발 성분이 있는 경우 제품 정보에 따라 표시·고지하세요.',
        },
      ]
      return {
        headline: '식품 카테고리 고지',
        note: '건강기능식품·일반식품 등 유형별 표시광고 규정을 따르세요.',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }

    if (bucket === 'finance') {
      const lines: ComplianceDisclosureLine[] = [
        ...generalLines,
        {
          id: 'fi-1',
          label: '투자 위험',
          body: '투자는 원금 손실이 발생할 수 있으며, 과거 수익률이나 실적이 미래 수익을 보장하지 않습니다.',
        },
        {
          id: 'fi-2',
          label: '권유 범위',
          body: '본 글은 정보 제공 목적이며, 특정 금융상품에 대한 투자 권유로 해석되지 않도록 표현을 점검하세요. (필요 시 금융투자업자 여부·광고 심의 확인)',
        },
      ]
      return {
        headline: '금융·투자 톤 고지',
        note: '수익 보장·원금 보장·무위험 등 표현은 금융 관련 광고에서 엄격히 제한됩니다.',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }

    if (bucket === 'medical') {
      const lines: ComplianceDisclosureLine[] = [
        ...generalLines,
        {
          id: 'm-1',
          label: '의료 대체 아님',
          body: '본 내용은 의학적 진단·치료·처방을 대체하지 않습니다. 증상이 있거나 지속되면 반드시 의료기관을 방문하세요.',
        },
        {
          id: 'm-2',
          label: '콘텐츠 성격',
          body: '자동 생성·정보성 글일 수 있으며, 개인 건강 결정은 반드시 면허 의료인과 상담하세요.',
        },
      ]
      return {
        headline: '의료·건강정보 톤 고지',
        note: '의료법·의료광고 규정상 허용되지 않는 진단·치료·효능 표현을 쓰지 마세요.',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }

    return {
      headline: '공통 권장 고지',
      note: '',
      lines: generalLines,
      copyAllBlock: joinBlock(generalLines),
    }
  }

  if (lang === 'ja') {
    const base: ComplianceDisclosureLine[] = [
      {
        id: 'ja-g1',
        label: '一般',
        body: '本記事は情報・商業目的の内容であり、法的・医療・投資のアドバイスではありません。',
      },
      {
        id: 'ja-g2',
        label: '体験',
        body: '個人の使用感であり、効果には個人差があります。',
      },
    ]
    if (bucket === 'health') {
      const lines = [
        ...base,
        {
          id: 'ja-h1',
          label: '医薬品ではない',
          body: '疾病の診断・治療・予防を目的とした医薬品ではありません。健康食品の表示は許可された範囲に従ってください。',
        },
      ]
      return {
        headline: '健康・サプリ向けの注意文',
        note: '製品区分に応じて表示を確認してください。',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'beauty') {
      const lines = [
        ...base,
        {
          id: 'ja-b1',
          label: '化粧品',
          body: '化粧品は肌を清潔にし美しく整えるためのものであり、疾患の治療・予防を目的とした表現はできません。',
        },
      ]
      return {
        headline: '美容・化粧品向けの注意文',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'finance') {
      const lines = [
        ...base,
        {
          id: 'ja-fi',
          label: '投資リスク',
          body: '投資には元本割れのリスクがあります。過去の実績は将来の成果を保証しません。',
        },
      ]
      return {
        headline: '金融・投資向けの注意文',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'medical') {
      const lines = [
        ...base,
        {
          id: 'ja-m1',
          label: '医療の代替ではない',
          body: '本内容は診断・治療の代替になりません。症状がある場合は医療機関を受診してください。',
        },
      ]
      return {
        headline: '医療・健康情報向けの注意文',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'food') {
      const lines = [
        ...base,
        {
          id: 'ja-f1',
          label: '食品',
          body: '食品として疾病の治療・予防効果を標示してはいけません。',
        },
      ]
      return {
        headline: '食品向けの注意文',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    return {
      headline: '共通の注意文',
      note: '',
      lines: base,
      copyAllBlock: joinBlock(base),
    }
  }

  if (lang === 'zh') {
    const base: ComplianceDisclosureLine[] = [
      {
        id: 'zh-g1',
        label: '一般',
        body: '本文为信息与商业目的内容，不构成法律、医疗或投资建议。',
      },
      {
        id: 'zh-g2',
        label: '体验',
        body: '基于个人体验，效果因人而异。',
      },
    ]
    if (bucket === 'health') {
      const lines = [
        ...base,
        {
          id: 'zh-h1',
          label: '非药品',
          body: '本产品/内容不用于疾病的诊断、治疗或预防。保健食品宣传须在许可范围内。',
        },
      ]
      return {
        headline: '健康品类提示语',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'beauty') {
      const lines = [
        ...base,
        {
          id: 'zh-b1',
          label: '化妆品',
          body: '化妆品不得宣称治疗或预防疾病；如有不适请停用并咨询医生。',
        },
      ]
      return {
        headline: '美妆品类提示语',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'finance') {
      const lines = [
        ...base,
        {
          id: 'zh-fi',
          label: '投资风险',
          body: '投资有风险，过往业绩不代表未来收益。',
        },
      ]
      return {
        headline: '金融投资提示语',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'medical') {
      const lines = [
        ...base,
        {
          id: 'zh-m1',
          label: '非诊疗',
          body: '本文不能替代专业诊疗；如有症状请及时就医。',
        },
      ]
      return {
        headline: '医疗健康信息提示语',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    if (bucket === 'food') {
      const lines = [
        ...base,
        {
          id: 'zh-f1',
          label: '食品',
          body: '食品不得宣称疾病预防或治疗功效。',
        },
      ]
      return {
        headline: '食品品类提示语',
        note: '',
        lines,
        copyAllBlock: joinBlock(lines),
      }
    }
    return {
      headline: '通用提示语',
      note: '',
      lines: base,
      copyAllBlock: joinBlock(base),
    }
  }

  const enBase: ComplianceDisclosureLine[] = [
    {
      id: 'en-g1',
      label: 'General',
      body: 'This content is for informational or commercial purposes only—not legal, medical, or investment advice. You are responsible for what you publish.',
    },
    {
      id: 'en-g2',
      label: 'Personal experience',
      body: 'Based on personal use; results and perceptions vary by individual.',
    },
  ]

  if (bucket === 'health') {
    const lines = [
      ...enBase,
      {
        id: 'en-h1',
        label: 'Not a drug',
        body: 'This product is not intended to diagnose, treat, cure, or prevent any disease. Follow applicable supplement/food labeling rules in your market.',
      },
      {
        id: 'en-h2',
        label: 'Who should ask a pro',
        body: 'Pregnant/nursing people or those on medication should consult a qualified professional before use.',
      },
    ]
    return {
      headline: 'Health & supplement disclosures',
      note: 'Match claims to authorized structure/function rules for your jurisdiction.',
      lines,
      copyAllBlock: joinBlock(lines),
    }
  }

  if (bucket === 'beauty') {
    const lines = [
      ...enBase,
      {
        id: 'en-b1',
        label: 'Cosmetics scope',
        body: 'Cosmetics are for cleansing, beautifying, or altering appearance—not for treating or preventing disease. Stop use and see a clinician if irritation occurs.',
      },
    ]
    return {
      headline: 'Beauty & cosmetics disclosures',
      note: 'Claims about acne, wrinkles, or pigmentation must stay within cosmetic (non-drug) boundaries.',
      lines,
      copyAllBlock: joinBlock(lines),
    }
  }

  if (bucket === 'food') {
    const lines = [
      ...enBase,
      {
        id: 'en-f1',
        label: 'Food claims',
        body: 'Foods must not suggest disease treatment or prevention unless legally permitted for that product category.',
      },
    ]
    return {
      headline: 'Food disclosures',
      note: '',
      lines,
      copyAllBlock: joinBlock(lines),
    }
  }

  if (bucket === 'finance') {
    const lines = [
      ...enBase,
      {
        id: 'en-fi1',
        label: 'Risk',
        body: 'Investing involves risk of loss; past performance does not guarantee future results.',
      },
      {
        id: 'en-fi2',
        label: 'Not personalized advice',
        body: 'This is not individualized investment advice. Verify licensing and ad rules for financial promotions in your region.',
      },
    ]
    return {
      headline: 'Finance & investing disclosures',
      note: 'Avoid guaranteed returns, “no risk,” or principal protection claims without proper authorization.',
      lines,
      copyAllBlock: joinBlock(lines),
    }
  }

  if (bucket === 'medical') {
    const lines = [
      ...enBase,
      {
        id: 'en-m1',
        label: 'Not medical care',
        body: 'This does not replace professional diagnosis or treatment. Seek a licensed clinician for health decisions.',
      },
    ]
    return {
      headline: 'Medical / health-information tone',
      note: 'Avoid implying you are providing medical services or guaranteed outcomes.',
      lines,
      copyAllBlock: joinBlock(lines),
    }
  }

  return {
    headline: 'Recommended baseline disclosures',
    note: 'Add category-specific lines when your content touches regulated topics.',
    lines: enBase,
    copyAllBlock: joinBlock(enBase),
  }
}
