import { ArrowUpRight, Menu, Sparkle, X } from 'lucide-react';
import { useDisclosure } from '@/hooks/use-disclosure';

const navigation = [
	{ href: '/team', label: 'Team' },
	{ href: '/showcase', label: 'Showcase' },
];

export function SiteHeader() {
	const menu = useDisclosure();

	return (
		<header className="site-header">
			<a className="brand" href="/" aria-label="Sky Light Dynamics home">
				<Sparkle size={26} strokeWidth={1.5} /> Sky Light Dynamics
				<span className="brand-dot">®</span>
			</a>
			<nav className="desktop-nav" aria-label="Main navigation">
				{navigation.map(item => (
					<a key={item.href} href={item.href}>
						{item.label}
					</a>
				))}
				<a href="/#contact" className="nav-contact">
					Let’s talk <ArrowUpRight size={16} />
				</a>
			</nav>
			<button className="menu-toggle" {...menu.triggerProps} aria-label="Toggle navigation">
				{menu.isOpen ? <X /> : <Menu />}
			</button>
			{menu.isOpen && (
				<nav className="mobile-nav" {...menu.panelProps} aria-label="Mobile navigation">
					{[...navigation, { href: '/#contact', label: 'Let’s talk' }].map(item => (
						<a key={item.href} href={item.href} onClick={menu.close}>
							{item.label}
							<ArrowUpRight size={18} />
						</a>
					))}
				</nav>
			)}
		</header>
	);
}
