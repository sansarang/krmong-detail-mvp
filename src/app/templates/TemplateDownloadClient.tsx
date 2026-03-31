'use client'
import { useState } from 'react'

interface Template {
  id: string
  title: string
  badge: string
  badgeColor: string
  desc: string
  icon: string
}

const TEMPLATES: Template[] = [
  { id: 'smartstore-beauty',   title: '스마트스토어 뷰티 템플릿',      badge: '스마트스토어', badgeColor: 'bg-green-500/20 text-green-400',  desc: '뷰티·스킨케어 상세페이지 완성형 템플릿. 성분 강조, 전후 비교, CTA 구조 포함.', icon: '💄' },
  { id: 'coupang-electronics', title: '쿠팡 전자기기 템플릿',          badge: '쿠팡',       badgeColor: 'bg-orange-500/20 text-orange-400', desc: '전자기기·가전 상세페이지 스펙 중심 템플릿. 기술 스펙 표, 비교 차트 포함.',        icon: '💻' },
  { id: 'amazon-jp-food',      title: 'Amazon JP 식품 템플릿',        badge: 'Amazon JP',  badgeColor: 'bg-yellow-500/20 text-yellow-400', desc: '일본 식품 상품 페이지 A+ 스타일. 원산지, 영양성분, 조리법 섹션 포함.',         icon: '🍱' },
  { id: 'naver-blog-review',   title: '네이버 블로그 리뷰 템플릿',      badge: '블로그',     badgeColor: 'bg-blue-500/20 text-blue-400',    desc: '네이버 블로그 협찬 리뷰 완성형 템플릿. SEO 최적화 구조, 이미지 배치 가이드 포함.', icon: '📝' },
]

export default function TemplateDownloadClient() {
  const [selected, setSelected] = useState<string | null>(null)
  const [emails, setEmails] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, { url: string } | { error: string }>>({})
  const [loading, setLoading] = useState<string | null>(null)

  const handleDownload = async (templateId: string) => {
    const email = emails[templateId]?.trim()
    if (!email) return
    setLoading(templateId)
    try {
      const res = await fetch('/api/template-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, templateId, lang: 'ko' }),
      })
      const data = await res.json()
      if (data.downloadUrl) {
        setResults(prev => ({ ...prev, [templateId]: { url: data.downloadUrl } }))
      } else {
        setResults(prev => ({ ...prev, [templateId]: { error: '이메일을 확인해주세요.' } }))
      }
    } catch {
      setResults(prev => ({ ...prev, [templateId]: { error: '서버 오류가 발생했습니다.' } }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {TEMPLATES.map(tpl => {
        const result = results[tpl.id]
        const isSuccess = result && 'url' in result
        const isError   = result && 'error' in result

        return (
          <div
            key={tpl.id}
            className="bg-white/5 border border-white/8 hover:border-blue-500/30 rounded-2xl p-6 transition-all cursor-pointer"
            onClick={() => setSelected(selected === tpl.id ? null : tpl.id)}
          >
            <div className="text-3xl mb-3">{tpl.icon}</div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tpl.badgeColor} border-current/20 mb-2 inline-block`}>
              {tpl.badge}
            </span>
            <h3 className="font-black text-white mb-2">{tpl.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{tpl.desc}</p>

            {!isSuccess ? (
              <div className={`overflow-hidden transition-all duration-300 ${selected === tpl.id ? 'max-h-40' : 'max-h-0'}`}>
                <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                  <input
                    type="email"
                    placeholder="이메일 입력"
                    value={emails[tpl.id] || ''}
                    onChange={e => setEmails(prev => ({ ...prev, [tpl.id]: e.target.value }))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleDownload(tpl.id)}
                    disabled={loading === tpl.id}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {loading === tpl.id ? '처리중...' : '무료 다운로드'}
                  </button>
                </div>
                {isError && <p className="text-red-400 text-xs mt-2">{'error' in result ? result.error : ''}</p>}
              </div>
            ) : (
              <a
                href={'url' in result ? result.url : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                onClick={e => e.stopPropagation()}
              >
                ✅ 다운로드 링크 열기
              </a>
            )}

            {selected !== tpl.id && !isSuccess && (
              <button className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors">
                이메일 입력 후 무료 다운로드 →
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
