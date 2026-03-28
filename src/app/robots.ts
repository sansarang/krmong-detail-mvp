import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/order/', '/api/'] },
    sitemap: 'https://krmong-detail-mvp.vercel.app/sitemap.xml',
  }
}
