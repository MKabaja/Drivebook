import {
	ArrowDown,
	ArrowUpRight,
	CarFront,
	Check,
	ChevronRight,
	Clock3,
	MapPin,
	ShieldCheck,
	X,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import {
	formatDailyRate,
	type PreviewCar,
	previewCars,
	transmissionLabel,
} from '../../cars';
import { CarCard } from '../car-card';
import { catalogStyles as s } from './catalog.styles';

type TransmissionFilter = 'all' | PreviewCar['transmission'];
const filters: { value: TransmissionFilter; label: string }[] = [
	{ value: 'all', label: 'Wszystkie auta' },
	{ value: 'automatic', label: 'Automatyczne' },
	{ value: 'manual', label: 'Manualne' },
];

export function Catalog() {
	const [transmission, setTransmission] = useState<TransmissionFilter>('all');
	const [sort, setSort] = useState('recommended');
	const [selectedCar, setSelectedCar] = useState<PreviewCar | null>(null);
	const dialog = useRef<HTMLDialogElement>(null);
	const reducedMotion = useReducedMotion();
	const filteredCars = previewCars.filter(
		(car) => transmission === 'all' || car.transmission === transmission,
	);
	const visibleCars =
		sort === 'price'
			? [...filteredCars].sort(
					(first, second) => first.dailyRateInGrosze - second.dailyRateInGrosze,
				)
			: filteredCars;

	function handleSelect(car: PreviewCar) {
		setSelectedCar(car);
		dialog.current?.showModal();
	}

	function handleClose() {
		dialog.current?.close();
	}

	return (
		<>
			<a href="#main" className={s.skip}>
				Przejdź do treści
			</a>
			<div className={s.notice}>
				Podgląd nowego wyglądu · przykładowe samochody i ceny
			</div>
			<div className={s.shell}>
				<header className={s.header}>
					<a
						href="/design-preview.html"
						className={s.brand}
						aria-label="DriveBook — strona główna"
					>
						<span className={s.brandIcon}>
							<CarFront size={22} aria-hidden="true" />
						</span>
						drivebook<span className="text-accent">.</span>
					</a>
					<nav aria-label="Nawigacja główna" className={s.nav}>
						<a href="#fleet" className={s.active}>
							Samochody
						</a>
						<a href="#how-it-works" className={s.navLink}>
							Jak to działa
						</a>
						<a href="/" className={s.navLink}>
							RoomBook
							<ArrowUpRight
								className="ml-1 inline"
								size={14}
								aria-hidden="true"
							/>
						</a>
					</nav>
				</header>
				<main id="main">
					<section className={s.hero} aria-labelledby="hero-title">
						<img
							src="/design/grid-texture.png"
							alt=""
							className={s.texture}
							width="400"
							height="400"
						/>
						<motion.div
							initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: reducedMotion ? 0 : 0.5 }}
						>
							<p className={s.eyebrow}>
								<span className="size-1.5 rounded-full bg-accent" />
								Mniej formalności. Więcej drogi.
							</p>
							<h1 id="hero-title" className={s.heading}>
								Dobry samochód.
								<br />
								Jeszcze lepszy
								<br />
								<span className={s.headingAccent}>kierunek.</span>
							</h1>
							<p className={s.lead}>
								Weekend poza miastem czy spontaniczny wyjazd? Wybierz auto,
								które pasuje do Twoich planów. Resztę zostaw nam.
							</p>
							<a href="#fleet" className={s.cta}>
								Znajdź swoje auto
								<ArrowDown size={18} aria-hidden="true" />
							</a>
							<p className={s.footnote}>
								<MapPin size={14} aria-hidden="true" />
								Jeden punkt odbioru. Tysiące możliwości.
							</p>
						</motion.div>
						<motion.figure
							className={s.visual}
							initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: reducedMotion ? 0 : 0.7 }}
						>
							<img
								src="/design/porsche.jpg"
								alt="Czarne Porsche Panamera podczas jazdy"
								className={s.heroImage}
								width="1200"
								height="923"
								fetchPriority="high"
							/>
							<div className={s.photoOverlay} aria-hidden="true" />
							<span className={s.imageTop}>Twój następny wyjazd</span>
							<figcaption className={s.imageBottom}>
								<div>
									<p className={s.imageCaption}>Droga należy do Ciebie</p>
									<p className={s.imageTitle}>Zmień widok za oknem.</p>
								</div>
								<a
									href="#fleet"
									className={s.imageArrow}
									aria-label="Przejdź do samochodów"
								>
									<ArrowUpRight size={24} aria-hidden="true" />
								</a>
							</figcaption>
						</motion.figure>
					</section>
					<ul
						id="how-it-works"
						className={s.benefits}
						aria-label="Rezerwacja w trzech krokach"
					>
						<li className={s.benefit}>
							<CarFront
								className={s.benefitIcon}
								size={22}
								aria-hidden="true"
							/>
							<span>
								01 <span className="ml-2 text-copy">Wybierz swój samochód</span>
							</span>
						</li>
						<li className={s.benefit}>
							<Clock3 className={s.benefitIcon} size={22} aria-hidden="true" />
							<span>
								02{' '}
								<span className="ml-2 text-copy">Dopasuj termin do planów</span>
							</span>
						</li>
						<li className={s.benefit}>
							<ShieldCheck
								className={s.benefitIcon}
								size={22}
								aria-hidden="true"
							/>
							<span>
								03{' '}
								<span className="ml-2 text-copy">
									Zarezerwuj i ruszaj w drogę
								</span>
							</span>
						</li>
					</ul>
					<section id="fleet" className={s.fleet} aria-labelledby="fleet-title">
						<div className={s.fleetTop}>
							<div>
								<p className={s.sectionEyebrow}>Nasza flota</p>
								<h2 id="fleet-title" className={s.sectionTitle}>
									Każda podróż zaczyna się tutaj.
								</h2>
							</div>
							<p className={s.count} role="status">
								Liczba samochodów: {visibleCars.length}
							</p>
						</div>
						<div className={s.controls}>
							<fieldset className={s.filters}>
								<legend className="sr-only">Skrzynia biegów</legend>
								{filters.map((filter) => (
									<button
										key={filter.value}
										type="button"
										className={s.filter}
										aria-pressed={transmission === filter.value}
										onClick={() => setTransmission(filter.value)}
									>
										{filter.label}
									</button>
								))}
							</fieldset>
							<label>
								<span className="sr-only">Sortowanie samochodów</span>
								<select
									className={s.sort}
									value={sort}
									onChange={(event) => setSort(event.target.value)}
								>
									<option value="recommended">Kolejność domyślna</option>
									<option value="price">Cena: od najniższej</option>
								</select>
							</label>
						</div>
						<div className={s.grid}>
							{visibleCars.map((car, index) => (
								<CarCard
									key={car.id}
									car={car}
									index={index}
									onSelect={handleSelect}
								/>
							))}
						</div>
					</section>
				</main>
				<footer className={s.footer}>
					<span className={s.brand}>
						drivebook<span className="text-accent">.</span>
					</span>
					<p>Mały plan. Wielka przygoda.</p>
					<a href="#main" className={s.footerLink}>
						Wróć na górę
						<ChevronRight
							size={14}
							className="ml-1 inline"
							aria-hidden="true"
						/>
					</a>
				</footer>
			</div>
			<dialog ref={dialog} className={s.dialog} aria-labelledby="car-title">
				{selectedCar && (
					<>
						<div className={s.dialogTop}>
							<div>
								<p className={s.sectionEyebrow}>{selectedCar.category}</p>
								<h2 id="car-title" className={s.dialogTitle}>
									{selectedCar.name}
								</h2>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className={s.close}
								aria-label="Zamknij szczegóły"
							>
								<X size={20} aria-hidden="true" />
							</button>
						</div>
						<img
							className={s.dialogImage}
							src={selectedCar.image}
							alt={selectedCar.imageAlt}
							width="900"
							height="506"
						/>
						<dl className={s.dialogSpecs}>
							<div>
								<dt className={s.dialogLabel}>Skrzynia biegów</dt>
								<dd className={s.dialogValue}>
									{transmissionLabel[selectedCar.transmission]}
								</dd>
							</div>
							<div>
								<dt className={s.dialogLabel}>Liczba miejsc</dt>
								<dd className={s.dialogValue}>{selectedCar.seats}</dd>
							</div>
						</dl>
						<p className={s.dialogPrice}>
							{formatDailyRate(selectedCar.dailyRateInGrosze)}
							<span className="ml-2 text-sm font-normal text-muted">
								/ doba
							</span>
						</p>
						<p className={s.dialogNote}>
							<Check
								size={16}
								className="mr-2 inline text-accent"
								aria-hidden="true"
							/>
							Podgląd oferty demonstracyjnej. Ten ekran nie tworzy rezerwacji.
						</p>
					</>
				)}
			</dialog>
		</>
	);
}
