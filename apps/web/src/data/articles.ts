import { defaultMedia } from '@/data/performance-media';
import { cmsImageUrl } from '@/lib/cms-media';

export type Article = {
	id?: string;
	collectionName?: string;
	title: string;
	slug: string;
	category: string;
	excerpt: string;
	body: string;
	cover_image?: string;
	cover_image_url?: string;
	coverImage: string;
	published_at: string;
	featured?: boolean;
};

export type ArticleRecord = Omit<Article, 'coverImage'> & { coverImage?: string };

export const defaultArticles: Article[] = [
	{
		id: 'default-urban-skies',
		title: 'Designing for urban night skies',
		slug: 'designing-for-urban-night-skies',
		category: 'Research',
		excerpt:
			'How scale, viewing distance and the character of a place shape a drone-light composition.',
		body: `<p>A city skyline is never a blank canvas. Buildings, ambient light and the movement of an audience all influence how a formation is perceived.</p><h2>Design begins with the place</h2><p>We study sightlines, scale and visual rhythm before choreography begins. The goal is not simply to place an image in the sky, but to create a composition that belongs to its setting.</p><h2>Clarity at a distance</h2><p>Strong silhouettes, controlled transitions and considered pacing help an idea remain legible across a large viewing area. Every movement has to support the story as well as the technical environment.</p>`,
		coverImage: defaultMedia[0].image,
		cover_image_url: defaultMedia[0].image,
		published_at: '2026-10-15 12:00:00.000Z',
		featured: true,
	},
	{
		id: 'default-brand-storytelling',
		title: 'Brand storytelling at monumental scale',
		slug: 'brand-storytelling-at-monumental-scale',
		category: 'Commercial ideas',
		excerpt:
			'Turning a campaign thought into a public moment people can experience and share together.',
		body: `<p>Drone light offers brands something rare: a message can become an event, experienced collectively rather than simply viewed on a screen.</p><h2>More than a logo reveal</h2><p>The strongest branded performances build anticipation, create transformation and earn the final image. Narrative gives the audience a reason to stay with the story.</p><h2>Designed to travel</h2><p>A live spectacle can also become a rich source of campaign material. Camera positions, key formations and timing can be planned for both the audience on site and the viewers who discover it later.</p>`,
		coverImage: defaultMedia[1].image,
		cover_image_url: defaultMedia[1].image,
		published_at: '2026-09-22 12:00:00.000Z',
	},
	{
		id: 'default-shared-memory',
		title: 'From festival moment to shared memory',
		slug: 'from-festival-moment-to-shared-memory',
		category: 'Commercial ideas',
		excerpt:
			'Why collective attention, pacing and a sense of place matter when designing for live audiences.',
		body: `<p>At a festival or civic celebration, the audience arrives with different expectations but looks up at the same sky. That shared point of focus is the beginning of a memorable experience.</p><h2>Build a collective rhythm</h2><p>Quiet passages make scale feel larger. Surprising transitions create energy. A carefully structured sequence gives a crowd time to notice, react and anticipate together.</p><h2>Leave room for wonder</h2><p>Technology makes the performance possible, but emotion is what remains. Our research asks how each technical choice can make the final experience feel more human.</p>`,
		coverImage: defaultMedia[0].image,
		cover_image_url: defaultMedia[0].image,
		published_at: '2026-08-30 12:00:00.000Z',
	},
];

export function prepareArticle(article: ArticleRecord): Article {
	return {
		...article,
		coverImage: cmsImageUrl(article, 'cover_image', 'cover_image_url', article.coverImage || ''),
	};
}
