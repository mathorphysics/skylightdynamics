import type { Route } from './+types/sitemap.xml';
import { defaultArticles } from '@/data/articles';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';
import { siteOrigin } from '@/lib/site-origin.server';

type SitemapEntry = {
	path: string;
	lastmod?: string;
};

const STATIC_PATHS = ['/', '/team', '/showcase'];

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function toLoc(origin: string, path: string): string {
	return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

function serializeSitemap(origin: string, entries: SitemapEntry[]): string {
	const urls = entries
		.map(entry => {
			const loc = escapeXml(toLoc(origin, entry.path));
			const lastmod = entry.lastmod
				? `\n\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
				: '';

			return `\t<url>\n\t\t<loc>${loc}</loc>${lastmod}\n\t</url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * Public dynamic URLs (blog posts, PDPs, articles).
 * Return `{ path, lastmod }` in the same change that adds a collection.
 * Return `[]` only while the site has no public records; clear those URLs
 * again in the same change that removes the collection.
 */
async function getDynamicEntries(): Promise<SitemapEntry[]> {
	try {
		const response = await pocketbaseAdmin.listRecords<{ slug: string; updated?: string }>('articles', {
			filter: 'published = true',
			fields: 'slug,updated',
			perPage: 200,
		});

		if (response.items.length > 0) {
			return response.items.map(article => ({
				path: `/showcase/${article.slug}`,
				...(article.updated && { lastmod: article.updated.slice(0, 10) }),
			}));
		}
	} catch {
		// Use bundled articles when the CMS is unavailable.
	}

	return defaultArticles.map(article => ({ path: `/showcase/${article.slug}` }));
}

export async function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);
	const entries: SitemapEntry[] = [
		...STATIC_PATHS.map(path => ({ path })),
		...(await getDynamicEntries()),
	];

	return new Response(serializeSitemap(origin, entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
