// Default homepage content. Used as a fallback when PocketBase is unreachable
// or empty, and as the source of truth for the og:image before the loader
// resolves. The live values are managed in the PocketBase admin dashboard via
// the `site_settings` and `performance_media` collections.

export type SiteSettings = {
	opening_image: string;
	opening_video: string;
	hero_eyebrow: string;
	hero_headline_1: string;
	hero_headline_2: string;
	hero_headline_3: string;
	hero_subtext: string;
};

export type PerformanceItem = {
	id?: string;
	title: string;
	detail: string;
	image: string;
	alt: string;
};

export const defaultSettings: SiteSettings = {
	opening_image:
		'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/7cf1a1c7-e1b7-4dad-9417-6051d32dd038.png',
	opening_video: '',
	hero_eyebrow: 'DRONE LIGHT PERFORMANCES',
	hero_headline_1: 'The sky is',
	hero_headline_2: 'only the',
	hero_headline_3: 'beginning.',
	hero_subtext:
		'Extraordinary light. Perfectly choreographed.\nA spectacle that stays with you.',
};

export const defaultMedia: PerformanceItem[] = [
	{
		title: 'Light in motion',
		detail: 'Fluid forms · Infinite possibilities',
		image:
			'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/e2fa714b-b8aa-4dc5-a061-320246660545.png',
		alt: 'Blue points of light creating a flowing wave across the night sky',
	},
	{
		title: 'A new dimension',
		detail: 'Precision formations · Monumental scale',
		image:
			'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/bba4f474-83f0-47b7-9324-6308fa422e11.png',
		alt: 'White points of light arranged in a geometric starburst over water',
	},
];

export function mediaSrcSet(url: string) {
	return `${url}?width=375 375w, ${url}?width=768 768w, ${url}?width=1024 1024w, ${url} 1344w`;
}
