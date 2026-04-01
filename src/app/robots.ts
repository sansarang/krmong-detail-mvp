import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/order/', '/api/', '/login'] },
    sitemap: 'https://pagebeer.beer/sitemap.xml',
  }
}
