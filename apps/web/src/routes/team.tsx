import { Aperture, Braces, RadioTower } from 'lucide-react';
import type { Route } from './+types/team';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { seo } from '@/lib/seo';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, {
		title: 'Team — Sky Light Dynamics',
		description:
			'Meet the creative, technical and production disciplines behind every Sky Light Dynamics performance.',
	});
}

const disciplines = [
	{
		icon: Aperture,
		title: 'Creative direction',
		copy: 'Concept, story and choreography shaped into one unforgettable visual language.',
	},
	{
		icon: Braces,
		title: 'Technical design',
		copy: 'Flight programming and precision systems that translate imagination into movement.',
	},
	{
		icon: RadioTower,
		title: 'Show operations',
		copy: 'Planning, safety and live delivery considered carefully from the ground to the sky.',
	},
];

export default function TeamPage() {
	return (
		<>
			<SiteHeader />
			<main>
				<section className="page-hero">
					<div className="eyebrow">
						<span className="status-dot" /> THE TEAM
					</div>
					<h1>
						The people behind
						<br />
						<span>the light.</span>
					</h1>
					<p>
						Artists, technologists and operators working as one to create experiences that move
						people.
					</p>
				</section>
				<section className="team-disciplines section-wrap" aria-label="Team disciplines">
					<div className="section-number">ONE TEAM / EVERY DETAIL</div>
					<div className="discipline-grid">
						{disciplines.map(({ icon: Icon, title, copy }, index) => (
							<article key={title}>
								<span className="discipline-index">0{index + 1}</span>
								<Icon size={28} strokeWidth={1.2} />
								<h2>{title}</h2>
								<p>{copy}</p>
							</article>
						))}
					</div>
				</section>
				<section className="page-cta section-wrap">
					<div>
						<div className="section-number">START A CONVERSATION</div>
						<h2>Bring us your vision.</h2>
					</div>
					<a className="primary-button" href="/#contact">
						Let’s talk
					</a>
				</section>
			</main>
			<SiteFooter />
		</>
	);
}
