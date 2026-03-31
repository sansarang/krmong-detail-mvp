import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'

export const metadata: Metadata = {
  title: 'PageAI — AI Product Description Generator in 4 Languages | Cross-Border eCommerce AI',
  description: 'Create perfect product pages, business plans, and proposals in 4 languages in 5 minutes. AI auto-fills any form or URL — optimized for Amazon JP, Tmall, Rakuten, Shopify, Smartstore. The #1 AI tool for cross-border ecommerce sellers.',
  keywords: [
    'AI product description generator 4 languages',
    'AI for cross-border ecommerce',
    'multilingual product page generator',
    'Amazon JP listing AI writer',
    'Tmall product description AI',
    'Rakuten listing generator',
    'Shopify product page AI',
    'AI document auto-fill',
    'business plan AI generator',
    'proposal generator AI',
    '4 language AI content generator',
    'cross-border seller tool',
    'AI form filler',
    'multilingual ecommerce AI',
    'global product page creator',
    'PageAI',
  ],
  alternates: {
    canonical: 'https://pagebeer.beer/en',
    languages: {
      'ko': 'https://pagebeer.beer',
      'en': 'https://pagebeer.beer/en',
      'ja': 'https://pagebeer.beer/ja',
      'zh': 'https://pagebeer.beer/zh',
      'x-default': 'https://pagebeer.beer/en',
    },
  },
  openGraph: {
    title: 'PageAI — Create Product Pages in 4 Languages in 5 Minutes | AI Cross-Border Tool',
    description: 'Upload any form or product URL — AI completes professional content in KR, EN, JP, CN simultaneously. Perfect for Amazon JP, Tmall, Rakuten, Shopify cross-border sellers. Free to start.',
    url: 'https://pagebeer.beer/en',
    siteName: 'PageAI',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://pagebeer.beer/og-image.png', width: 1200, height: 630, alt: 'PageAI — AI Product Description Generator in 4 Languages' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageAI — AI Generates Product Pages in 4 Languages in 5 Minutes',
    description: 'The best AI tool for cross-border ecommerce. Upload URL or form → AI creates Amazon JP, Tmall, Rakuten, Shopify optimized content simultaneously.',
    images: ['https://pagebeer.beer/og-image.png'],
  },
}

export default function EnHome() { return <HomePage lang="en" /> }
