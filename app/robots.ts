import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/game-collection/game/'],
      },
    ],
    sitemap: 'https://blakemilam.com/sitemap.xml',
  };
}