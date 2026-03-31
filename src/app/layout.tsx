import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'sonner'
import ChatWidget from '@/components/ChatWidget'
import { Analytics } from '@vercel/analytics/react'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pagebeer.beer'),
  title: {
    default: 'PageAI — AI Document & Product Page Generator in 4 Languages | 양식·URL → 5분 완성',
    template: '%s | PageAI',
  },
  description: 'Upload any form or URL — AI completes professional documents in 5 minutes, in 4 languages (KR/EN/JP/CN). Auto-optimized for Amazon JP, Tmall, Rakuten, Shopify, Smartstore, Coupang. Business plans, proposals, reports, product pages — any template, expert level.',
  keywords: [
    'AI document generator', 'AI form auto-fill', 'multilingual product page', '4 language AI content',
    'Amazon JP listing AI', 'Tmall description AI', 'Rakuten product page', 'Shopify SEO content',
    'cross-border ecommerce AI', '상세페이지 AI 자동생성', '스마트스토어 상세페이지', '사업계획서 AI',
    '4개국어 동시생성', '양식 자동작성 AI', 'global seller AI tool', 'PageAI', 'pagebeer',
  ],
  authors: [{ name: 'PageAI', url: 'https://pagebeer.beer' }],
  creator: 'PageAI',
  publisher: 'PageAI',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://pagebeer.beer',
    languages: {
      'ko': 'https://pagebeer.beer',
      'en': 'https://pagebeer.beer/en',
      'ja': 'https://pagebeer.beer/ja',
      'zh': 'https://pagebeer.beer/zh',
      'x-default': 'https://pagebeer.beer/en',
    },
  },
  openGraph: {
    title: 'PageAI — Upload Any Form or URL · AI Completes in 5 Min · 4 Languages',
    description: 'Business plans, proposals, reports, product pages — AI auto-fills any template at expert level. Optimized for Amazon JP, Tmall, Rakuten, Shopify, Smartstore. Free to start.',
    url: 'https://pagebeer.beer',
    siteName: 'PageAI',
    locale: 'en_US',
    alternateLocale: ['ko_KR', 'ja_JP', 'zh_CN'],
    type: 'website',
    images: [{ url: 'https://pagebeer.beer/og-image.png', width: 1200, height: 630, alt: 'PageAI — AI Document Generator in 4 Languages' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageAI — AI Completes Any Document in 4 Languages in 5 Minutes',
    description: 'Upload form or URL → AI auto-fills at expert level. Amazon JP, Tmall, Rakuten, Shopify, Smartstore optimized.',
    images: ['https://pagebeer.beer/og-image.png'],
    creator: '@pageai_app',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'naver-site-verification': 'fa19d9f9a60dca13c152015425244cf01813653a',
    },
  },
  category: 'technology',
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        {children}
        <Toaster richColors position="top-center" />
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  )
}
