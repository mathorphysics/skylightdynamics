import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { Hero } from '@/components/home/hero';
import { Experience } from '@/components/home/experience';
import { Showcase } from '@/components/home/showcase';
import { Contact } from '@/components/home/contact';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';
import {
	defaultMedia,
	defaultSettings,
	preparePerformanceItem,
	type PerformanceItem,
	type SiteSettings,
} from '@/data/performance-media';
import { cmsImageUrl } from '@/lib/cms-media';

// Loads the homepage content from PocketBase (managed in the admin dashboard).
// Falls back to the bundled defaults if PocketBase is unreachable or empty, so
// the page always renders. This is public content — identical for every
// visitor — so it is safe to edge-cache.
export async function loader() {
	let settings: SiteSettings = { ...defaultSettings };
	let media: PerformanceItem[] = defaultMedia.map((m, i) => ({ id: `default-${i}`, ...m }));

	try {
		const res = await pocketbaseAdmin.listRecords<SiteSettings>('site_settings', { perPage: 1 });
		if (res.items.length > 0) {
			const s = res.items[0];
			settings = {
				opening_image: cmsImageUrl(s, 'opening_image_file', 'opening_image', defaultSettings.opening_image),
				opening_image_file: s.opening_image_file || '',
				opening_video: s.opening_video || '',
				hero_eyebrow: s.hero_eyebrow || defaultSettings.hero_eyebrow,
				hero_headline_1: s.hero_headline_1 || defaultSettings.hero_headline_1,
				hero_headline_2: s.hero_headline_2 || defaultSettings.hero_headline_2,
				hero_headline_3: s.hero_headline_3 || defaultSettings.hero_headline_3,
				hero_subtext: s.hero_subtext || defaultSettings.hero_subtext,
			};
		}
	} catch {
		// keep defaults
	}

	try {
		const res = await pocketbaseAdmin.listRecords<PerformanceItem>('performance_media', {
			filter: 'published = true',
			sort: 'sort_order',
			perPage: 60,
		});
		if (res.items.length > 0) {
			media = res.items.map(preparePerformanceItem);
		}
	} catch {
		// keep defaults
	}

	return { settings, media };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	return seo({ matches, location }, {
		title: 'Sky Light Dynamics — Extraordinary Drone Light Performances',
		description:
			'Transform the night sky with Sky Light Dynamics. Discover professionally choreographed drone light performances and start a conversation about your vision.',
		image: loaderData?.settings.opening_image,
		jsonLd: [
			{
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: 'Sky Light Dynamics',
				description: 'Professional drone light performances',
			},
			{
				'@context': 'https://schema.org',
				'@type': 'Organization',
				name: 'Sky Light Dynamics',
				description: 'A professional provider of choreographed drone light performances.',
			},
		],
	});
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<Hero settings={loaderData.settings} />
				<Experience />
				<Showcase items={loaderData.media} />
				<Contact />
			</main>
			<SiteFooter />
		</>
	);
}
