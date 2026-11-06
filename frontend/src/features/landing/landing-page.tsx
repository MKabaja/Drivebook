import { Link } from '@tanstack/react-router';
import { ArrowUpRight, CalendarCheck, Clock3, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { uiStyles as ui } from '../../shared/components/ui.styles';
import { landingStyles as s } from './landing.styles';
export function LandingPage() {
	const reducedMotion = useReducedMotion();
	return (
		<main id="main" className={ui.shell}>
			<section className={s.hero} aria-labelledby="welcome-title">
				<img
					src="/design/grid-texture.png"
					alt=""
					className={s.texture}
					width="400"
					height="400"
				/>
				<motion.div
					initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: reducedMotion ? 0 : 0.45 }}
				>
					<p className={ui.eyebrow}>Mniej ustaleń. Więcej współpracy.</p>
					<h1 id="welcome-title" className={s.title}>
						Dobre spotkanie
						<br />
						zaczyna się od
						<br />
						<span className="text-accent">dobrej przestrzeni.</span>
					</h1>
					<p className={s.description}>
						Warsztat, ważna prezentacja czy spokojna rozmowa? Znajdź salę dla
						swojego zespołu i zarezerwuj ją w kilku prostych krokach.
					</p>
					<div className={s.actions}>
						<Link to="/rooms" className={ui.primary}>
							Znajdź swoją salę
							<ArrowUpRight size={18} aria-hidden="true" />
						</Link>
						<a href="#how-it-works" className={ui.secondary}>
							Jak to działa
						</a>
					</div>
				</motion.div>
				<motion.figure
					className={s.visual}
					initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: reducedMotion ? 0 : 0.6 }}
				>
					<img
						src="/design/meeting-room.jpg"
						alt="Sala konferencyjna ze stołem i krzesłami"
						width="1000"
						height="800"
						className={s.image}
						fetchPriority="high"
					/>
					<figcaption className={s.caption}>
						<p className="text-xs uppercase tracking-[0.16em] text-accent">
							Miejsce na Twój następny pomysł
						</p>
						<p className="mt-2 text-2xl font-medium">
							Spotkajmy się w dobrym miejscu.
						</p>
					</figcaption>
				</motion.figure>
			</section>
			<section id="how-it-works" aria-label="Jak zarezerwować salę">
				<ol className={s.steps}>
					<li className={s.step}>
						<Users
							size={24}
							className="shrink-0 text-accent"
							aria-hidden="true"
						/>
						<div>
							<h2 className={s.stepTitle}>01 · Wybierz przestrzeń</h2>
							<p className={s.stepDescription}>
								Dopasuj salę do liczby uczestników spotkania.
							</p>
						</div>
					</li>
					<li className={s.step}>
						<Clock3
							size={24}
							className="shrink-0 text-accent"
							aria-hidden="true"
						/>
						<div>
							<h2 className={s.stepTitle}>02 · Ustal termin</h2>
							<p className={s.stepDescription}>
								Wybierz datę i godziny, które pasują zespołowi.
							</p>
						</div>
					</li>
					<li className={s.step}>
						<CalendarCheck
							size={24}
							className="shrink-0 text-accent"
							aria-hidden="true"
						/>
						<div>
							<h2 className={s.stepTitle}>03 · Zarezerwuj salę</h2>
							<p className={s.stepDescription}>
								Wszystkie swoje rezerwacje znajdziesz w jednym miejscu.
							</p>
						</div>
					</li>
				</ol>
			</section>
			<section className={s.callout} aria-labelledby="start-title">
				<div>
					<h2 id="start-title" className="text-2xl font-medium tracking-tight">
						Twój zespół. Wasze miejsce.
					</h2>
					<p className="mt-3 text-sm text-muted">
						Załóż konto, wybierz salę i zaplanuj kolejne spotkanie.
					</p>
				</div>
				<Link
					to="/register"
					search={{ redirect: '/rooms' }}
					className={ui.primary}
				>
					Zacznij od konta
					<ArrowUpRight size={18} aria-hidden="true" />
				</Link>
			</section>
		</main>
	);
}
