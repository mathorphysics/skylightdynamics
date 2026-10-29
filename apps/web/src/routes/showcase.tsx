import type { Route } from './+types/showcase';
import { Showcase } from '@/components/home/showcase';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { defaultMedia, type PerformanceItem } from '@/data/performance-media';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';
import { seo } from '@/lib/seo';

export async function loader() {
	let media: PerformanceItem[] = defaultMedia.map((item, index) => ({
		id: `default-${index}`,
		...item,
	}));

	try {
		const response = await pocketbaseAdmin.listRecords<PerformanceItem>('performance_media', {
			filter: 'published = true',
			sort: 'sort_order',
			perPage: 60,
		});
		if (response.items.length > 0) media = response.items;
	} catch {
		// Keep bundled media when the CMS is unavailable.
	}

	return { media };
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
			</main>
			<SiteFooter />
		</>
	);
}
