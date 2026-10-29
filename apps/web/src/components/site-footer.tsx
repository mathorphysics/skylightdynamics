import { ArrowUpRight, Sparkle } from 'lucide-react';
import { openCookiePreferences } from '@/lib/cookie-consent';

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="footer-top">
				<a href="/" className="brand">
					<Sparkle size={24} /> Sky Light Dynamics
				</a>
				<p>Extraordinary, by design.</p>
				<a href="/#contact">
					Enquire about a performance <ArrowUpRight size={16} />
				</a>
			</div>
			<div className="footer-bottom">
				<span>© 2026 Sky Light Dynamics. All rights reserved.</span>
				<span>DRONE LIGHT PERFORMANCES</span>
				<button onClick={openCookiePreferences}>Cookie settings</button>
			</div>
		</footer>
	);
}
