import { useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { mediaSrcSet, type PerformanceItem } from '@/data/performance-media';

export function Showcase({ items }: { items: PerformanceItem[] }) {
	const dialog = useRef<HTMLDialogElement>(null);
	const [selected, setSelected] = useState(0);
	const safeItems = items.length > 0 ? items : [];
	const current = safeItems[selected];

	return (
		<section className="showcase section-wrap" id="showcase">
			<div className="showcase-heading">
				<div>
					<div className="section-number">02 / VISUAL POSSIBILITIES</div>
					<h2>
						Look up.
						<br />
						<span>Feel something.</span>
					</h2>
				</div>
				<p>
					A canvas without boundaries.
					<br />
					An impression beyond the ordinary.
				</p>
			</div>
			<div className="showcase-grid">
				{safeItems.map((item, index) => (
					<figure key={item.id ?? index}>
						<button
							className="image-open"
							aria-label={`View ${item.title}`}
							onClick={() => {
								setSelected(index);
								dialog.current?.showModal();
							}}
						>
							<img
								src={item.image}
								srcSet={mediaSrcSet(item.image) || undefined}
								sizes="(min-width: 768px) 46vw, 100vw"
								alt={item.alt}
								loading="lazy"
							/>
							<span className="image-arrow">
								<ArrowUpRight size={21} />
							</span>
						</button>
						<figcaption>
							<span className="media-index">0{index + 1}</span>
							<div>
								<h3>{item.title}</h3>
								<span>{item.detail}</span>
							</div>
						</figcaption>
					</figure>
				))}
			</div>
			<p className="visual-note">
				Concept imagery — an illustration of the creative possibilities of drone light shows.
			</p>
			<dialog
				ref={dialog}
				className="lightbox"
				onClick={(e) => {
					if (e.target === e.currentTarget) dialog.current?.close();
				}}
			>
				<button className="lightbox-close" onClick={() => dialog.current?.close()} aria-label="Close image">
					<X />
				</button>
				{current && (
					<>
						<img src={current.image} alt={current.alt} />
						<p>{current.title}</p>
					</>
				)}
			</dialog>
		</section>
	);
}
