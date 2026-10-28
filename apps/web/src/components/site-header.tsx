import { ArrowUpRight, Menu, X, Sparkle } from 'lucide-react';
import { useDisclosure } from '@/hooks/use-disclosure';
export function SiteHeader() {
 const menu = useDisclosure();
 return <header className="site-header"><a className="brand" href="#top" aria-label="Aerform home"><Sparkle size={26} strokeWidth={1.5} /> AERFORM<span className="brand-dot">®</span></a><nav className="desktop-nav" aria-label="Main navigation"><a href="#experience">The experience</a><a href="#showcase">Showcase</a><a href="#contact" className="nav-contact">Let’s talk <ArrowUpRight size={16} /></a></nav><button className="menu-toggle" {...menu.triggerProps} aria-label="Toggle navigation">{menu.isOpen ? <X /> : <Menu />}</button>{menu.isOpen && <nav className="mobile-nav" {...menu.panelProps} aria-label="Mobile navigation">{[['#experience','The experience'],['#showcase','Showcase'],['#contact','Let’s talk']].map(([href,label]) => <a key={href} href={href} onClick={menu.close}>{label}<ArrowUpRight size={18} /></a>)}</nav>}</header>;
}
