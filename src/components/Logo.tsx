interface LogoProps {
  size?: number
  dark?: boolean
  showText?: boolean
  className?: string
}

export default function Logo({ size = 32, dark = false, showText = true, className = '' }: LogoProps) {
  const bg = dark ? '#ffffff' : '#000000'
  const fg = dark ? '#000000' : '#ffffff'
  const textColor = dark ? 'text-white' : 'text-black'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 아이콘 */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* 배경 */}
        <rect width="32" height="32" rx="9" fill={bg} />

        {/* 문서 아이콘 */}
        <rect x="7" y="6" width="13" height="17" rx="2" fill={fg} opacity="0.15" />
        <rect x="7" y="6" width="13" height="17" rx="2" stroke={fg} strokeWidth="1.5" />

        {/* 문서 라인들 */}
        <line x1="10" y1="11" x2="17" y2="11" stroke={fg} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="14" x2="17" y2="14" stroke={fg} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="17" x2="14" y2="17" stroke={fg} strokeWidth="1.5" strokeLinecap="round" />

        {/* AI 스파크 */}
        <circle cx="22" cy="22" r="7" fill={bg} />
        <path
          d="M22 16.5L23.2 20.8L27.5 22L23.2 23.2L22 27.5L20.8 23.2L16.5 22L20.8 20.8L22 16.5Z"
          fill={fg}
        />
      </svg>

      {/* 텍스트 */}
      {showText && (
        <span
          className={`font-black text-xl tracking-tight ${textColor}`}
          style={{ fontFamily: "'Pretendard', sans-serif", letterSpacing: '-0.03em' }}
        >
          페이지AI
        </span>
      )}
    </div>
  )
}

export function LogoEn({ size = 32, dark = false, showText = true, className = '' }: LogoProps) {
  const bg = dark ? '#ffffff' : '#000000'
  const fg = dark ? '#000000' : '#ffffff'
  const textColor = dark ? 'text-white' : 'text-black'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="32" height="32" rx="9" fill={bg} />
        <rect x="7" y="6" width="13" height="17" rx="2" fill={fg} opacity="0.15" />
        <rect x="7" y="6" width="13" height="17" rx="2" stroke={fg} strokeWidth="1.5" />
        <line x1="10" y1="11" x2="17" y2="11" stroke={fg} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="14" x2="17" y2="14" stroke={fg} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="17" x2="14" y2="17" stroke={fg} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="22" cy="22" r="7" fill={bg} />
        <path d="M22 16.5L23.2 20.8L27.5 22L23.2 23.2L22 27.5L20.8 23.2L16.5 22L20.8 20.8L22 16.5Z" fill={fg} />
      </svg>
      {showText && (
        <span className={`font-black text-xl tracking-tight ${textColor}`} style={{ letterSpacing: '-0.03em' }}>
          PageAI
        </span>
      )}
    </div>
  )
}
