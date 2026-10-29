import type { Route } from './+types/showcase';
import { ArrowUpRight } from 'lucide-react';
import { Showcase } from '@/components/home/showcase';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { defaultArticles, prepareArticle, type ArticleRecord } from '@/data/articles';
import {
	defaultMedia,
	preparePerformanceItem,
	type PerformanceItem,
} from '@/data/performance-media';
import { formatDate } from '@/lib/intl-format';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';
import { seo } from '@/lib/seo';

export async function loader() {
	let media: PerformanceItem[] = defaultMedia.map((item, index) => ({
		id: `default-${index}`,
		...item,
	}));
	let articles = defaultArticles;

	try {
		const response = await pocketbaseAdmin.listRecords<PerformanceItem>('performance_media', {
			filter: 'published = true',
			sort: 'sort_order',
			perPage: 60,
		});
		if (response.items.length > 0) media = response.items.map(preparePerformanceItem);
	} catch {
		// Keep bundled media when the CMS is unavailable.
	}

	try {
		const response = await pocketbaseAdmin.listRecords<ArticleRecord>('articles', {
			filter: 'published = true',
			sort: '-featured,-published_at',
			perPage: 60,
		});
		if (response.items.length > 0) articles = response.items.map(prepareArticle);
	} catch {
		// Keep bundled articles when the CMS is unavailable.
	}

	return { media, articles };
}

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, {
		title: 'Showcase — Sky Light Dynamics',
		description:
			'Explore the scale, movement and visual possibilities of Sky Light Dynamics drone light performances.',
		image: defaultMedia[0]?.image,
	});
}

export default function ShowcasePage({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main className="showcase-page">
				<section className="page-hero">
					<div className="eyebrow">
						<span className="status-dot" /> SELECTED WORK
					</div>
					<h1>
						Ideas written
						<br />
						<span>in light.</span>
					</h1>
					<p>A closer look at the forms, scale and emotion possible in the night sky.</p>
				</section>
				<Showcase items={loaderData.media} />
				<section className="article-index section-wrap" aria-labelledby="article-index-title">
					<div className="article-index-heading">
						<div>
							<div className="section-number">IDEAS / RESEARCH</div>
							<h2 id="article-index-title">
								Notes from
								<br />
								<span>the studio.</span>
							</h2>
						</div>
						<p>Research, observations and commercial possibilities for the sky above us.</p>
					</div>
					<div className="article-grid">
						{loaderData.articles.map(article => (
							<article className="article-card" key={article.slug}>
								<a href={`/showcase/${article.slug}`} className="article-card-image">
									<img src={article.coverImage} alt="" loading="lazy" />
								</a>
								<div className="article-card-meta">
									<span>{article.category}</span>
									<time dateTime={article.published_at}>
										{formatDate(article.published_at.slice(0, 10), { locale: 'en', month: 'short', year: 'numeric' })}
									</time>
								</div>
								<h3>
									<a href={`/showcase/${article.slug}`}>{article.title}</a>
								</h3>
								<p>{article.excerpt}</p>
								<a className="article-read" href={`/showcase/${article.slug}`}>
									Read article <ArrowUpRight size={16} />
								</a>
							</article>
						))}
					</div>
				</section>
			</main>
			<SiteFooter />
		</>
	);
}
