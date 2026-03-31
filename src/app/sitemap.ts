import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pagebeer.beer'
  const now = new Date()

  // Core pages — highest priority
  const coreRoutes: MetadataRoute.Sitemap = [
    { url: base,           lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/en`,   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/ja`,   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/zh`,   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
  ]

  // Feature landing pages — high crawl priority
  const featureRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/order/new`, lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/samples`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/blog`,      lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/login`,     lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${base}/terms`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...coreRoutes, ...featureRoutes, ...blogRoutes]
}
