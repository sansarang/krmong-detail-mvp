import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '페이지AI — AI 상세페이지 자동 생성',
  description: '제품 정보 30초 입력하고 AI가 전환율 높은 스마트스토어 상세페이지를 5분 만에 완성해드립니다.',
  keywords: '상세페이지, AI, 스마트스토어, 쿠팡, 자동생성, 카피라이팅',
  openGraph: {
    title: '페이지AI — 압도적 퀄리티 상세페이지, AI로 5분 완성',
    description: '제품 정보만 입력하면 AI가 전환율 높은 상세페이지를 자동으로 만들어드립니다.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
