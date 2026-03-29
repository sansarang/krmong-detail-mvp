import Link from 'next/link'

/** 홈 상단용 — 내부 링크·키워드 앵커로 크롤러·노출 보조 */
export default function InternalSeoPills() {
  const items = [
    { href: '/samples', label: '스마트스토어 상세페이지 샘플' },
    { href: '/blog', label: '셀러 SEO·전환율 블로그' },
    { href: '/login', label: 'AI 상세페이지 무료 생성' },
    { href: '#pricing', label: '가격·플랜 비교' },
    { href: '#faq', label: '자주 묻는 질문' },
  ]
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2">
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 text-center sm:text-left">
        인기 주제 · 내부 가이드
      </p>
      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[11px] sm:text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 rounded-full px-3 py-1.5 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
