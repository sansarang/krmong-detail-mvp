export type PlatformId =
  | 'naver_blog' | 'smartstore' | 'coupang' | 'elevenst'
  | 'amazon_jp'  | 'rakuten'   | 'tmall'   | 'shopify'
  | 'qoo10'      | 'lazada'    | 'temu'    | 'aliexpress' | 'shein'

export interface PlatformConfig {
  id: PlatformId
  name: string
  icon: string
  primaryColor: string
  bgColor: string
  accentColor: string
  market: 'domestic' | 'global'
  language: string
  photoCount: number
  generateKey: string // maps to MARKET_SECTION_GUIDES key in generate/route.ts
}

export const PLATFORMS: PlatformConfig[] = [
  // ── 국내 ──────────────────────────────────────────────────
  {
    id: 'naver_blog',
    name: '네이버 블로그',
    icon: 'N',
    primaryColor: '#03C75A',
    bgColor: '#f4f4f4',
    accentColor: '#03C75A',
    market: 'domestic',
    language: 'ko',
    photoCount: 6,
    generateKey: 'naver_blog',
  },
  {
    id: 'smartstore',
    name: '스마트스토어',
    icon: '🏪',
    primaryColor: '#03C75A',
    bgColor: '#fff',
    accentColor: '#00ac52',
    market: 'domestic',
    language: 'ko',
    photoCount: 5,
    generateKey: 'smartstore',
  },
  {
    id: 'coupang',
    name: '쿠팡',
    icon: '🛒',
    primaryColor: '#1A73E8',
    bgColor: '#f7f8fc',
    accentColor: '#e63312',
    market: 'domestic',
    language: 'ko',
    photoCount: 4,
    generateKey: 'coupang',
  },
  {
    id: 'elevenst',
    name: '11번가',
    icon: '1️⃣',
    primaryColor: '#FF0000',
    bgColor: '#fff',
    accentColor: '#FF0000',
    market: 'domestic',
    language: 'ko',
    photoCount: 4,
    generateKey: 'elevenst',
  },
  // ── 글로벌 ─────────────────────────────────────────────────
  {
    id: 'amazon_jp',
    name: 'Amazon JP',
    icon: '📦',
    primaryColor: '#FF9900',
    bgColor: '#fff',
    accentColor: '#232F3E',
    market: 'global',
    language: 'ja',
    photoCount: 5,
    generateKey: 'amazon',
  },
  {
    id: 'rakuten',
    name: '楽天 Rakuten',
    icon: '🎏',
    primaryColor: '#BF0000',
    bgColor: '#fff',
    accentColor: '#BF0000',
    market: 'global',
    language: 'ja',
    photoCount: 5,
    generateKey: 'rakuten',
  },
  {
    id: 'tmall',
    name: '天猫 Tmall',
    icon: '🏮',
    primaryColor: '#FF4400',
    bgColor: '#fff',
    accentColor: '#FF4400',
    market: 'global',
    language: 'zh',
    photoCount: 8,
    generateKey: 'tmall',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '💚',
    primaryColor: '#96BF48',
    bgColor: '#f8f9fa',
    accentColor: '#5c6bc0',
    market: 'global',
    language: 'en',
    photoCount: 5,
    generateKey: 'shopify',
  },
  {
    id: 'qoo10',
    name: 'Qoo10',
    icon: '🔶',
    primaryColor: '#FF7300',
    bgColor: '#fff9f2',
    accentColor: '#FF7300',
    market: 'global',
    language: 'ja',
    photoCount: 4,
    generateKey: 'qoo10',
  },
  {
    id: 'lazada',
    name: 'Lazada',
    icon: '📫',
    primaryColor: '#F57224',
    bgColor: '#fff',
    accentColor: '#E31837',
    market: 'global',
    language: 'en',
    photoCount: 4,
    generateKey: 'lazada',
  },
  {
    id: 'temu',
    name: 'Temu',
    icon: '🌟',
    primaryColor: '#FF6B35',
    bgColor: '#fff8f5',
    accentColor: '#ff4d00',
    market: 'global',
    language: 'en',
    photoCount: 4,
    generateKey: 'temu',
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    icon: '🧧',
    primaryColor: '#FF4747',
    bgColor: '#fff',
    accentColor: '#FF4747',
    market: 'global',
    language: 'en',
    photoCount: 5,
    generateKey: 'aliexpress',
  },
  {
    id: 'shein',
    name: 'SHEIN',
    icon: '👗',
    primaryColor: '#000000',
    bgColor: '#fafafa',
    accentColor: '#000000',
    market: 'global',
    language: 'en',
    photoCount: 6,
    generateKey: 'shein',
  },
]

export const DOMESTIC_PLATFORMS = PLATFORMS.filter(p => p.market === 'domestic')
export const GLOBAL_PLATFORMS   = PLATFORMS.filter(p => p.market === 'global')

export function getPlatformById(id: string): PlatformConfig | undefined {
  return PLATFORMS.find(p => p.id === id)
}
