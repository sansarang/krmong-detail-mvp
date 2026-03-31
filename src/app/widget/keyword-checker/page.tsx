'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

const KO_FORBIDDEN = ['최고','최저','최대','최소','1등','보장','효과','치료','방지','만족','상담','마감','가격','무료','특가','혜택','완벽','100%','전문가','검증','인증','의학적','부작용','즉시','절대']
const EN_FORBIDDEN = ['guaranteed','cure','prevent','treat','best in the world','cheapest','100% safe','miracle','instant results','no side effects','FDA approved','clinically proven','risk-free','scientifically proven','doctor recommended','number 1','#1','world class','eliminate']
const KO_ALTS: Record<string, string> = {'최고':'높은 수준의','최저':'합리적인','최대':'풍부한','최소':'간편한','1등':'상위권','보장':'기대 가능한','효과':'개선 경험','치료':'케어','방지':'예방 도움','만족':'긍정적 반응','상담':'문의','마감':'인기','가격':'가성비','무료':'무상 제공','특가':'특별 가격','혜택':'장점','완벽':'꼼꼼한','100%':'높은 비율로','전문가':'전문 지식 기반','검증':'자체 테스트','인증':'확인 완료','의학적':'성분 기반','부작용':'주의사항 있음','즉시':'빠르게','절대':'강력히'}
const EN_ALTS: Record<string, string> = {'guaranteed':'proven to','cure':'support','prevent':'help reduce','treat':'address','best in the world':'top-rated','cheapest':'most affordable','100% safe':'rigorously tested','miracle':'remarkable','instant results':'fast-acting','no side effects':'well-tolerated','FDA approved':'compliant with standards','clinically proven':'tested','risk-free':'backed by guarantee','scientifically proven':'research-supported','doctor recommended':'expert-reviewed','number 1':'leading','#1':'leading','world class':'premium','eliminate':'reduce'}

export default function WidgetKeywordCheckerPage() {
  const [text, setText] = useState('')
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  const forbidden = lang === 'ko' ? KO_FORBIDDEN : EN_FORBIDDEN
  const alts = lang === 'ko' ? KO_ALTS : EN_ALTS

  const found = useMemo(() => {
    if (!text) return []
    return forbidden.filter(w => text.toLowerCase().includes(w.toLowerCase()))
  }, [text, forbidden])

  function buildHighlight(str: string) {
    let result = str
    const matches: string[] = []
    forbidden.forEach(w => {
      if (result.toLowerCase().includes(w.toLowerCase())) matches.push(w)
    })
    if (!matches.length) return [<span key="0">{str}</span>]
    const regex = new RegExp(`(${matches.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = result.split(regex)
    return parts.map((p, i) =>
      matches.some(w => w.toLowerCase() === p.toLowerCase())
        ? <mark key={i} style={{ background: '#ef444440', color: '#f87171', borderRadius: '3px', padding: '0 2px' }}>{p}</mark>
        : <span key={i}>{p}</span>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0B1120', minHeight: '100vh', padding: '20px', color: 'white' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setLang('ko')}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: lang === 'ko' ? '#3b82f6' : 'transparent', borderColor: lang === 'ko' ? '#3b82f6' : '#334155', color: 'white' }}
            >한국어</button>
            <button
              onClick={() => setLang('en')}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: lang === 'en' ? '#3b82f6' : 'transparent', borderColor: lang === 'en' ? '#3b82f6' : '#334155', color: 'white' }}
            >English</button>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {lang === 'ko' ? `감지된 금칙어: ${found.length}개` : `Prohibited words found: ${found.length}`}
          </span>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={lang === 'ko' ? '상세페이지 글을 붙여넣으세요...' : 'Paste your product description here...'}
          style={{ width: '100%', minHeight: '120px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px', color: 'white', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
        />

        {text && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px', marginTop: '10px', fontSize: '13px', lineHeight: '1.7' }}>
            {buildHighlight(text)}
          </div>
        )}

        {found.length > 0 && (
          <div style={{ marginTop: '10px', background: '#1e1525', border: '1px solid #7c3aed40', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', marginBottom: '8px' }}>
              {lang === 'ko' ? '대체 단어 추천' : 'Suggested Replacements'}
            </div>
            {found.map(w => (
              <div key={w} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', fontSize: '12px' }}>
                <span style={{ color: '#f87171', background: '#ef444420', padding: '2px 8px', borderRadius: '4px' }}>{w}</span>
                <span style={{ color: '#64748b' }}>→</span>
                <span style={{ color: '#86efac' }}>{alts[w] || (lang === 'ko' ? '표현 재검토 필요' : 'revise expression')}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '14px', background: '#1e3a5f', border: '1px solid #3b82f680', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#93c5fd', marginBottom: '8px', margin: '0 0 8px 0' }}>
            {lang === 'ko' ? '금칙어 없는 글을 AI로 자동 생성하세요' : 'Generate compliant product listings with AI'}
          </p>
          <a href="https://pagebeer.beer/login" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#3b82f6', color: 'white', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
            {lang === 'ko' ? 'PageAI로 자동 생성하기 →' : 'Generate with PageAI →'}
          </a>
        </div>

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '11px', color: '#475569' }}>
          Powered by{' '}
          <a href="https://pagebeer.beer" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>PageAI</a>
        </div>
      </div>
    </div>
  )
}
