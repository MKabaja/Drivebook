import { Link, useRouter } from '@tanstack/react-router';
import { CalendarDays, Users } from 'lucide-react';
import { useState } from 'react';
import { errorMessage } from '../../shared/api/client';
import { uiStyles as s } from '../../shared/components/ui.styles';
import { type Booking, cancelBooking, formatDateTime } from './api';

type BookingsPageProps = {
  bookings: Booking[];
  currentPage: number;
  lastPage: number;
  total: number;
};
const statusLabels = { pending: 'Oczekująca', confirmed: 'Potwierdzona', cancelled: 'Anulowana' };
export function BookingsPage({ bookings, currentPage, lastPage, total }: BookingsPageProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  async function handleCancel(id: number) {
    if (pendingId !== null) return;
    setPendingId(id);
    setError('');
    try {
      await cancelBooking(id);
      await router.invalidate();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPendingId(null);
    }
  }
  return (
    <main id="main" className={`${s.shell} ${s.page}`}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className={s.eyebrow}>Twoje plany w jednym miejscu</p>
          <h1 className={s.title}>Moje rezerwacje</h1>
          <p className={s.lead}>
            Łącznie: {total}. Zaplanuj kolejne spotkanie lub zarządzaj rezerwacjami.
          </p>
        </div>
        <Link to="/rooms" className={s.primary}>
          Nowa rezerwacja
        </Link>
      </div>
      {error && (
        <p className={`${s.alert} mt-6`} role="alert">
          {error}
        </p>
      )}
      {bookings.length === 0 ? (
        <div className={s.empty}>
          <CalendarDays size={32} className="mx-auto mb-4 text-accent" aria-hidden="true" />
          <h2 className="text-lg text-copy">Jeszcze nie masz rezerwacji.</h2>
          <p className="mt-2 text-sm">Wybierz salę i zaplanuj pierwsze spotkanie.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {bookings.map(booking => (
            <li key={booking.id} className={s.panel}>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-medium">
                      {booking.room?.name ?? `Sala ${booking.room_id}`}
                    </h2>
                    <span className={s.status}>{statusLabels[booking.status]}</span>
                  </div>
                  <p className="mt-4 text-sm text-muted">
                    <time dateTime={booking.starts_at}>{formatDateTime(booking.starts_at)}</time> —{' '}
                    <time dateTime={booking.ends_at}>{formatDateTime(booking.ends_at)}</time>
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <Users size={16} aria-hidden="true" />
                    Liczba uczestników: {booking.participants_count}
                  </p>
                </div>
                {booking.status !== 'cancelled' && (
                  <button
                    type="button"
                    className={s.secondary}
                    disabled={pendingId !== null}
                    onClick={() => handleCancel(booking.id)}
                    aria-label={`Anuluj rezerwację ${booking.room?.name ?? booking.id}`}
                  >
                    {pendingId === booking.id ? 'Anulowanie…' : 'Anuluj rezerwację'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <nav
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
        aria-label="Strony rezerwacji"
      >
        {currentPage > 1 && (
          <Link to="/bookings" search={{ page: currentPage - 1 }} className={s.secondary}>
            Poprzednia
          </Link>
        )}
        <span className="text-sm text-muted">
          Strona {currentPage} z {lastPage}
        </span>
        {currentPage < lastPage && (
          <Link to="/bookings" search={{ page: currentPage + 1 }} className={s.secondary}>
            Następna
          </Link>
        )}
      </nav>
    </main>
  );
}
