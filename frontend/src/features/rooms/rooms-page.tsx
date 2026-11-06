import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Building2, Users } from 'lucide-react';
import { uiStyles as s } from '../../shared/components/ui.styles';
import type { Room } from './api';

type RoomsPageProps = { rooms: Room[] };
export function RoomsPage({ rooms }: RoomsPageProps) {
	return (
		<main id="main" className={`${s.shell} ${s.page}`}>
			<p className={s.eyebrow}>Nasze przestrzenie</p>
			<h1 className={s.title}>Miejsce na dobre spotkanie.</h1>
			<p className={s.lead}>
				Wybierz salę dla swojego zespołu. Dostępność wybranego terminu
				sprawdzimy przy rezerwacji.
			</p>
			{rooms.length === 0 ? (
				<p className={s.empty}>Obecnie nie ma sal do wyświetlenia.</p>
			) : (
				<ul className={s.grid}>
					{rooms.map((room) => (
						<li key={room.id} className={s.panel}>
							<div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-canvas text-accent">
								<Building2 size={26} aria-hidden="true" />
							</div>
							<h2 className="text-xl font-medium">{room.name}</h2>
							<p className="mt-3 flex items-center gap-2 text-sm text-muted">
								<Users size={17} aria-hidden="true" />
								Maksymalnie {room.capacity} osób
							</p>
							<Link
								to="/bookings/new"
								search={{ roomId: room.id }}
								className={`${s.secondary} mt-6 w-full`}
							>
								Zarezerwuj salę
								<ArrowUpRight size={17} aria-hidden="true" />
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
