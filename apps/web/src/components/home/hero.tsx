import { Fragment } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { ParticleGlobe } from '@/components/home/particle-globe';
import type { SiteSettings } from '@/data/performance-media';

export function Hero({ settings }: { settings: SiteSettings }) {
	const subtextLines = settings.hero_subtext.split('\n');

	return (
		<section className="hero" id="top">
			<ParticleGlobe />
			<div className="hero-shade" />
			<div className="hero-content">
				<div className="eyebrow">
					<span className="status-dot" /> {settings.hero_eyebrow}
				</div>
				<h1>
					{settings.hero_headline_1}
					<br />
					{settings.hero_headline_2} <span>{settings.hero_headline_3}</span>
				</h1>
				<div className="hero-bottom">
					<p>
						{subtextLines.map((line, i) => (
							<Fragment key={i}>
								{i > 0 && <br />}
								{line}
							</Fragment>
						))}
					</p>
					<a className="primary-button" href="#contact">
						Create your spectacle <ArrowUpRight size={18} />
					</a>
				</div>
			</div>
			<div className="hero-rail">
				<a href="#experience">
					<ArrowDown size={15} /> SCROLL TO DISCOVER
				</a>
				<span>ART. TECHNOLOGY. ABOVE EVERYTHING.</span>
			</div>
		</section>
	);
}
