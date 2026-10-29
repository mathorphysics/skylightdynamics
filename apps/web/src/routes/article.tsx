import { ArrowLeft } from 'lucide-react';
import type { Route } from './+types/article';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import {
	defaultArticles,
	prepareArticle,
	type ArticleRecord,
} from '@/data/articles';
import { formatDate } from '@/lib/intl-format';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';
import { seo } from '@/lib/seo';

export async function loader({ params }: Route.LoaderArgs) {
	const fallback = defaultArticles.find(article => article.slug === params.slug);

	try {
		const filter = pocketbaseAdmin.filter('slug = {:slug} && published = true', {
			slug: params.slug,
		});
		const response = await pocketbaseAdmin.listRecords<ArticleRecord>('articles', {
			filter,
			perPage: 1,
		});
		if (response.items[0]) return { article: prepareArticle(response.items[0]) };
	} catch {
		// Use bundled article content when the CMS is unavailable.
	}

	if (fallback) return { article: fallback };

	throw new Response('Article not found', { status: 404 });
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const article = loaderData?.article;

	return seo({ matches, location }, {
		title: article ? `${article.title} — Sky Light Dynamics` : 'Article — Sky Light Dynamics',
		description: article?.excerpt || 'Ideas and research from Sky Light Dynamics.',
		image: article?.coverImage,
		type: 'article',
		jsonLd: article
			? {
					'@context': 'https://schema.org',
					'@type': 'Article',
					headline: article.title,
					datePublished: article.published_at,
					image: article.coverImage,
					publisher: { '@type': 'Organization', name: 'Sky Light Dynamics' },
				}
			: undefined,
	});
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
	const { article } = loaderData;

	return (
		<>
			<SiteHeader />
			<main>
				<article className="article-page">
					<header className="article-hero">
						<a href="/showcase" className="article-back">
							<ArrowLeft size={15} /> Back to Showcase
						</a>
						<div className="article-kicker">
							<span>{article.category}</span>
							<time dateTime={article.published_at}>
								{formatDate(article.published_at.slice(0, 10), { locale: 'en' })}
							</time>
						</div>
						<h1>{article.title}</h1>
						<p>{article.excerpt}</p>
					</header>
					<div className="article-cover">
						<img src={article.coverImage} alt="" />
					</div>
					<div className="article-body" dangerouslySetInnerHTML={{ __html: article.body }} />
				</article>
			</main>
			<SiteFooter />
		</>
	);
}
