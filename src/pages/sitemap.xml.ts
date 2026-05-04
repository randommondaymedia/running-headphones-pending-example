// Hand-rolled sitemap.xml — reads pages.json + site.json directly.
// Replaces @astrojs/sitemap, which crashes on hybrid + vercel adapter
// combos (result.pages comes back undefined). Static-prerendered like
// every other page; rebuilds when pages.json changes.

import pagesData from '../data/pages.json';
import siteData from '../data/site.json';

export const prerender = true;

export async function GET() {
  const origin = `https://${siteData.domain}`;
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${origin}/`, priority: '1.0' },
    ...pagesData.map((p: { url: string }) => ({
      loc: `${origin}${p.url}`,
      priority: '0.7',
    })),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><priority>${u.priority}</priority></url>`,
    ),
    '</urlset>',
  ].join('\n');
  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
