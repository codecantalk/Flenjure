import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/account', '/checkout'],
    },
    sitemap: 'https://flenjure.com/sitemap.xml',
  };
}
