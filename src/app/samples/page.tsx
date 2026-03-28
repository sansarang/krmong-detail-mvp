import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '샘플 보기 — 페이지AI',
  description: 'AI가 실제로 생성한 상세페이지 샘플을 확인해보세요.',
}

const SAMPLES = [
  {
    id: 'probiotics',
    category: '건강식품',
    badge: '🏆 인기',
    productName: '장건강 프리미엄 유산균 90캡슐',
    input: '제품명: 장건강 프리미엄 유산균 90캡슐\n카테고리: 건강식품\n설명: 100억 마리 유산균, 6종 복합 프리바이오틱스, 장 건강 및 면역력 개선, 냉장 보관 불필요',
    sections: [
      {
        title: '지금 장이 보내는 SOS 신호, 무시하고 계신가요?',
        body: '매일 아침 화장실 가는 게 고역이신가요? 식사 후 더부룩함이 일상이 되셨나요? 피부 트러블이 좀처럼 나아지지 않나요?\n\n장 건강이 무너지면 소화·면역·피부 모든 게 함께 무너집니다. 장내 유익균 비율이 줄어들기 시작하는 건 20대 후반부터입니다. 지금이 바로 관리해야 할 때입니다.',
      },
      {
        title: '왜 유산균마다 효과가 다를까요?',
        body: '시중 유산균 제품의 가장 큰 문제점은 위산에 도달하기 전에 90% 이상이 죽는다는 것입니다.\n\n장건강 프리미엄 유산균은 특허받은 이중 코팅 기술로 위산 통과율 87%를 달성했습니다. 살아서 장까지 도달하는 유산균이 다릅니다.',
      },
      {
        title: '100억 마리 × 6종 복합 프리바이오틱스',
        body: '✓ 락토바실러스 애시도필러스 — 장내 산성 환경 유지\n✓ 비피도박테리움 롱검 — 면역 조절 및 염증 완화\n✓ 락토바실러스 람노서스 — 장 점막 보호\n✓ 스트렙토코커스 써모필러스 — 유당 분해 도움\n✓ 비피도박테리움 브레베 — 배변 활동 개선\n✓ 락토바실러스 플란타럼 — 항산화 작용\n\n6가지 균주가 각각 다른 역할을 하며 장 환경 전체를 균형있게 개선합니다.',
      },
      {
        title: '냉장 보관 없이도 유효기간 내 100억 마리 보장',
        body: '일반 유산균은 냉장 보관 필수. 여행이나 출장 중에는 사실상 챙기기 불가능합니다.\n\n장건강 유산균은 상온에서도 유효기간 내 100억 마리 생존을 보장하는 특허 기술을 적용했습니다. 가방에 넣고 어디서든 챙겨드세요.',
      },
      {
        title: '이런 분들께 추천드립니다',
        body: '✓ 변비나 설사가 반복되는 분\n✓ 항생제 복용 후 장 컨디션이 나빠진 분\n✓ 피부 트러블이 잦은 분\n✓ 면역력이 약해진 것 같은 분\n✓ 바쁜 일상으로 식단 관리가 어려운 분',
      },
      {
        title: '지금 구매하시면 3+1 이벤트',
        body: '3박스 구매 시 1박스 추가 증정 (수량 한정)\n무료 배송 + 당일 출고 (오후 2시 이전 주문)\n30일 내 효과 없으면 100% 환불 보장\n\n지금 바로 장 건강을 회복하세요.',
      },
    ],
  },
  {
    id: 'skincare',
    category: '뷰티/스킨케어',
    badge: '✨ 신규',
    productName: '비건 히알루론산 앰플 50ml',
    input: '제품명: 비건 히알루론산 앰플 50ml\n카테고리: 뷰티/스킨케어\n설명: 3중 히알루론산, 비건 인증, 저자극 무향, 건성·민감성 피부 적합, 피부과 테스트 완료',
    sections: [
      {
        title: '보습 크림을 아무리 발라도 2시간 후엔 다시 당기는 이유',
        body: '피부 표면에만 수분을 공급하는 일반 보습제는 한계가 있습니다. 진피층까지 수분이 전달되지 않으면 겉은 촉촉해 보여도 속은 여전히 건조합니다.\n\n수분 부족이 지속되면 피부 탄력이 감소하고, 잔주름이 깊어지며, 피부 장벽이 약해집니다.',
      },
      {
        title: '히알루론산, 크기가 다르면 작용이 다릅니다',
        body: '고분자 히알루론산 — 피부 표면에 수분 필름 형성, 즉각적인 촉촉함\n중분자 히알루론산 — 표피층 침투, 수분 저장 능력 강화\n저분자 히알루론산 — 진피층까지 침투, 속 건조 개선\n\n3가지 분자 크기를 동시에 담아 피부 전층에 수분을 공급합니다.',
      },
      {
        title: '비건 인증 × 피부과 테스트 완료',
        body: '동물성 원료 0% — 100% 식물 유래 성분\n알레르기 유발 향료 0% — 민감한 피부도 안심\n파라벤·황산염 0% — 자극 유발 방부제 미사용\n피부과 테스트 완료 — 민감성 피부 안전성 검증\n비건 소사이어티 공식 인증',
      },
      {
        title: '사용 방법',
        body: '세안 후 스킨/토너로 기초 정돈 → 앰플 2~3방울 취한 후 얼굴 전체에 가볍게 두드리며 흡수 → 크림 마무리\n\n아침·저녁 2회 사용을 권장합니다. 눈가 등 건조한 부위에 더 많이 발라주세요.',
      },
      {
        title: '2주 후기',
        body: '"민감한 피부라 새 제품 쓸 때마다 걱정했는데, 이건 바르고 나서 당기거나 붉어지는 느낌 전혀 없었어요. 2주 정도 쓰니까 피부 결이 확실히 부드러워졌고 화장이 더 잘 먹혀요." — 서울 직장인 29세',
      },
      {
        title: '지금 구매 특가',
        body: '첫 구매 20% 할인 쿠폰 자동 적용\n미니 사이즈 (15ml) 무료 증정\n무료 배송 · 빠른 출고\n\n피부과 테스트까지 완료된 믿을 수 있는 수분 앰플, 지금 경험해보세요.',
      },
    ],
  },
  {
    id: 'kitchen',
    category: '주방용품',
    badge: '🔥 베스트',
    productName: '에코 스테인리스 밀폐용기 세트 5종',
    input: '제품명: 에코 스테인리스 밀폐용기 세트 5종\n카테고리: 주방용품\n설명: 304 스테인리스, 유리 뚜껑, BPA FREE, 전자레인지 사용 가능(뚜껑 제거), 식세기 세척 가능, 냉동·냉장·오븐 모두 가능',
    sections: [
      {
        title: '플라스틱 용기, 아직도 쓰고 계신가요?',
        body: '플라스틱 용기를 뜨거운 음식에 담을 때, 전자레인지에 돌릴 때, 기름진 음식을 보관할 때마다 환경 호르몬이 식품으로 용출될 수 있습니다.\n\n특히 음식이 직접 닿는 용기는 소재가 중요합니다. 가족의 건강, 이제 소재부터 바꿔보세요.',
      },
      {
        title: '304 스테인리스 — 식품 등급 최고 기준',
        body: '304 스테인리스(18-8 스테인리스)는 식품용기에 사용되는 가장 안전한 등급입니다.\n\n녹슬지 않고, 냄새 배지 않고, 세균 번식 어렵고, 100년 넘게 음식 용기에 사용되어온 검증된 소재입니다. 한 번 구매하면 평생 씁니다.',
      },
      {
        title: '5가지 사이즈, 모든 상황에 딱 맞게',
        body: '250ml — 소스·드레싱·반찬 소량 보관\n500ml — 1인분 반찬, 과일 보관\n800ml — 국·찌개·샐러드\n1200ml — 2~3인 반찬, 나물류\n1800ml — 대용량 저장, 냉동 보관\n\n겹겹이 쌓아 보관 가능 — 냉장고 공간을 효율적으로.',
      },
      {
        title: '어디에나 쓸 수 있어요',
        body: '✓ 냉장·냉동 — 안전하게 보관\n✓ 오븐 — 200°C까지 사용 가능 (뚜껑 제거)\n✓ 전자레인지 — 뚜껑 제거 후 사용\n✓ 식기세척기 — 그냥 넣으면 끝\n✓ 인덕션/가스레인지 — 직화 조리도 가능',
      },
      {
        title: '유리 뚜껑으로 속을 확인하세요',
        body: '강화 유리 뚜껑으로 용기를 열지 않고도 안에 무엇이 들었는지 바로 확인할 수 있습니다.\n\n실리콘 패킹으로 밀폐력을 높여 냄새 차단, 국물 새지 않음을 보장합니다.',
      },
      {
        title: '지금 구매 혜택',
        body: '5종 세트 구매 시 실리콘 주걱 2개 무료 증정\n30일 파손 교환 보장\n무료 배송 (당일 출고)\n\n플라스틱에서 스테인리스로, 가족 건강을 위한 가장 현명한 선택.',
      },
    ],
  },
]

const SECTION_COLORS = [
  'bg-slate-50 border-slate-200',
  'bg-blue-50 border-blue-100',
  'bg-green-50 border-green-100',
  'bg-amber-50 border-amber-100',
  'bg-purple-50 border-purple-100',
  'bg-rose-50 border-rose-100',
]

export default function SamplesPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg" />
          <span className="font-bold text-lg tracking-tight">페이지AI</span>
        </Link>
        <Link href="/login" className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
          무료로 시작 →
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-4 py-2 rounded-full">실제 AI 생성 샘플</span>
          <h1 className="text-5xl font-black text-black mt-6 mb-4 tracking-tight leading-tight">
            이렇게 나옵니다.
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            실제 제품 설명을 입력하면 AI가 만드는 결과물입니다.<br />
            직접 스크롤해서 확인해보세요.
          </p>
        </div>

        <div className="space-y-24">
          {SAMPLES.map((sample) => (
            <div key={sample.id}>
              {/* 헤더 */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">{sample.category}</span>
                    <span className="text-xs font-bold text-black bg-yellow-100 border border-yellow-200 px-3 py-1 rounded-full">{sample.badge}</span>
                  </div>
                  <h2 className="text-2xl font-black text-black">{sample.productName}</h2>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-mono text-gray-400 whitespace-pre-line max-w-xs">
                    {sample.input}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-right">← 이 정보만 입력했을 때</p>
                </div>
              </div>

              {/* 생성 결과 */}
              <div className="grid grid-cols-1 gap-4">
                {sample.sections.map((section, i) => (
                  <div
                    key={i}
                    className={`border rounded-2xl p-6 ${SECTION_COLORS[i % SECTION_COLORS.length]}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-black text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">섹션 {i + 1}</span>
                    </div>
                    <h3 className="text-lg font-black text-black mb-3">{section.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-black text-white font-black px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all hover:scale-105"
                >
                  나도 이런 상세페이지 만들기 →
                </Link>
                <p className="text-xs text-gray-400 mt-3">무료로 시작 · 신용카드 불필요</p>
              </div>
            </div>
          ))}
        </div>

        {/* 최하단 CTA */}
        <div className="mt-24 bg-black rounded-3xl p-12 text-center text-white">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">지금 바로 시작</p>
          <h2 className="text-4xl font-black mb-4 tracking-tight">내 제품 정보 입력 30초,<br />결과물은 5분 안에.</h2>
          <p className="text-gray-400 mb-8">위 샘플들은 실제로 제품 설명만 입력해서 나온 결과입니다.<br />무료 플랜으로 바로 체험해보세요.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-gray-100 transition-all text-lg"
          >
            무료로 만들어보기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
