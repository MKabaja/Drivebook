import { Link } from '@tanstack/react-router';
import { ArrowUpRight, CalendarCheck, CarFront, Clock3 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { uiStyles } from '@/shared/components/ui.styles';

import { landingPageStyles } from './landing-page.styles';

function LandingPage() {
	const { shell, eyebrow, primary, secondary } = uiStyles;
	const {
		hero,
		texture,
		title,
		description,
		actions,
		visual,
		image,
		caption,
		steps,
		step,
		stepTitle,
		stepDescription,
		callout,
	} = landingPageStyles;
	const shouldReduceMotion = useReducedMotion();

	return (
		<main id="main" className={shell}>
			<section className={hero} aria-labelledby="welcome-title">
				<img
					src="/design/grid-texture.png"
					alt=""
					className={texture}
					width="400"
					height="400"
				/>
				<motion.div
					initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
				>
					<p className={eyebrow}>Less paperwork. More road.</p>
					<h1 id="welcome-title" className={title}>
						A good car.
						<br />
						An even better
						<br />
						<span className="text-accent">destination.</span>
					</h1>
					<p className={description}>
						A weekend out of town or a spontaneous trip? Pick a car that fits
						your plans. Leave the rest to us.
					</p>
					<div className={actions}>
						<Link to="/register" className={primary}>
							Create an account
							<ArrowUpRight size={18} aria-hidden="true" />
						</Link>
						<a href="#how-it-works" className={secondary}>
							How it works
						</a>
					</div>
				</motion.div>
				<motion.figure
					className={visual}
					initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
				>
					<img
						src="/design/porsche.jpg"
						alt="Black Porsche Panamera on the road"
						width="1200"
						height="800"
						className={image}
						fetchPriority="high"
					/>
					<figcaption className={caption}>
						<p className="text-xs uppercase tracking-[0.16em] text-accent">
							The road is yours
						</p>
						<p className="mt-2 text-2xl font-medium">
							Change the view out the window.
						</p>
					</figcaption>
				</motion.figure>
			</section>
			<section id="how-it-works" aria-label="How to book a car">
				<ol className={steps}>
					<li className={step}>
						<CarFront
							size={24}
							className="shrink-0 text-accent"
							aria-hidden="true"
						/>
						<div>
							<h2 className={stepTitle}>01 · Pick a car</h2>
							<p className={stepDescription}>
								Find a car with the right number of seats and transmission.
							</p>
						</div>
					</li>
					<li className={step}>
						<Clock3
							size={24}
							className="shrink-0 text-accent"
							aria-hidden="true"
						/>
						<div>
							<h2 className={stepTitle}>02 · Choose your dates</h2>
							<p className={stepDescription}>
								Full days and a clear price. Pick-up and return are always at
								10:00.
							</p>
						</div>
					</li>
					<li className={step}>
						<CalendarCheck
							size={24}
							className="shrink-0 text-accent"
							aria-hidden="true"
						/>
						<div>
							<h2 className={stepTitle}>03 · Hit the road</h2>
							<p className={stepDescription}>
								Sign in when you book and pick the car up at our location.
							</p>
						</div>
					</li>
				</ol>
			</section>
			<section className={callout} aria-labelledby="start-title">
				<div>
					<h2 id="start-title" className="text-2xl font-medium tracking-tight">
						Small plan. Big adventure.
					</h2>
					<p className="mt-3 text-sm text-muted">
						Browse cars without an account. Sign in only when you have picked
						yours.
					</p>
				</div>
				<Link to="/register" className={primary}>
					Create an account
					<ArrowUpRight size={18} aria-hidden="true" />
				</Link>
			</section>
		</main>
	);
}

export { LandingPage };
