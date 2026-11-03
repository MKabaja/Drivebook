import { Link, useRouter } from '@tanstack/react-router';
import { ArrowLeft, CalendarCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { ApiError, errorMessage } from '../../shared/api/client';
import { Field } from '../../shared/components/field';
import { uiStyles as s } from '../../shared/components/ui.styles';
import type { Room } from '../rooms/api';
import { createBooking } from './api';

type BookingFormProps = {
  rooms: Room[];
  initialRoomId?: number;
  initialStartsAt?: string;
  initialEndsAt?: string;
  initialParticipants?: string;
};
export function BookingForm({
  rooms,
  initialRoomId,
  initialStartsAt = '',
  initialEndsAt = '',
  initialParticipants = '1'
}: BookingFormProps) {
  const router = useRouter();
  const [roomId, setRoomId] = useState(initialRoomId ?? rooms[0]?.id);
  const [startsAt, setStartsAt] = useState(initialStartsAt);
  const [endsAt, setEndsAt] = useState(initialEndsAt);
  const [participants, setParticipants] = useState(initialParticipants);
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [requiresLogin, setRequiresLogin] = useState(false);
  const returnTo = router.buildLocation({
    to: '/bookings/new',
    search: { roomId, startsAt, endsAt, participants }
  }).href;
  const room = rooms.find(candidate => candidate.id === roomId);
  const durationInMinutes =
    startsAt && endsAt ? (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000 : 0;
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!room || status === 'pending') return;
    if (durationInMinutes <= 0) {
      setError('Koniec spotkania musi być późniejszy niż początek.');
      return;
    }
    setStatus('pending');
    setError('');
    setFields({});
    try {
      await createBooking({
        room_id: room.id,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        participants_count: Number(participants)
      });
      await router.invalidate();
      await router.navigate({ to: '/bookings', search: { page: 1 } });
    } catch (failure) {
      setError(errorMessage(failure));
      if (failure instanceof ApiError) {
        setFields(failure.fields);
        setRequiresLogin(failure.status === 401);
      }
    } finally {
      setStatus('idle');
    }
  }
  return (
    <main id="main" className={`${s.shell} ${s.page}`}>
      <Link
        to="/rooms"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-copy"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Wróć do sal
      </Link>
      <p className={`${s.eyebrow} mt-6`}>Zaplanuj spotkanie</p>
      <h1 className={s.title}>Zarezerwuj swoją przestrzeń.</h1>
      <p className={s.lead}>
        Wybierz datę, godziny i liczbę uczestników. Godziny podajesz w swojej lokalnej strefie
        czasowej.
      </p>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className={s.panel} aria-label="Dane rezerwacji">
          {requiresLogin && (
            <Link
              to="/login"
              search={{ redirect: returnTo }}
              className="mt-4 inline-block text-sm text-accent underline underline-offset-4"
            >
              Zaloguj się ponownie
            </Link>
          )}
          {error && (
            <p className={`${s.alert} mb-5`} role="alert">
              {error}
            </p>
          )}
          <form className={s.form} onSubmit={handleSubmit}>
            <label className={s.label} htmlFor="room_id">
              Sala
              <select
                id="room_id"
                name="room_id"
                className={s.input}
                value={roomId ?? ''}
                onChange={event => setRoomId(Number(event.target.value))}
                required
              >
                {!room && <option value="">Wybierz salę</option>}
                {rooms.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} · do {candidate.capacity} osób
                  </option>
                ))}
              </select>
              {fields.room_id?.[0] && <span className={s.fieldError}>{fields.room_id[0]}</span>}
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Początek spotkania"
                name="starts_at"
                type="datetime-local"
                required
                value={startsAt}
                onChange={event => setStartsAt(event.target.value)}
                error={fields.starts_at?.[0]}
              />
              <Field
                label="Koniec spotkania"
                name="ends_at"
                type="datetime-local"
                required
                value={endsAt}
                onChange={event => setEndsAt(event.target.value)}
                error={fields.ends_at?.[0]}
              />
            </div>
            <Field
              label="Liczba uczestników"
              name="participants_count"
              type="number"
              required
              min={1}
              max={room?.capacity}
              value={participants}
              onChange={event => setParticipants(event.target.value)}
              error={fields.participants_count?.[0]}
            />
            <button
              type="submit"
              className={`${s.primary} w-full`}
              disabled={!room || status === 'pending'}
            >
              <CalendarCheck size={18} aria-hidden="true" />
              {status === 'pending' ? 'Zapisywanie…' : 'Zarezerwuj salę'}
            </button>
          </form>
          {error && (
            <Link
              to="/bookings"
              search={{ page: 1 }}
              className="mt-4 inline-block text-sm text-accent underline underline-offset-4"
            >
              Sprawdź moje rezerwacje
            </Link>
          )}
        </section>
        <aside className={s.panel} aria-labelledby="summary-title">
          <h2 id="summary-title" className="text-xl font-medium">
            Twoje spotkanie
          </h2>
          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="text-muted">Sala</dt>
              <dd className="mt-1 font-medium">{room?.name ?? 'Wybierz salę'}</dd>
            </div>
            <div>
              <dt className="text-muted">Uczestnicy</dt>
              <dd className="mt-1 font-medium">
                {participants || '—'}
                {room ? ` / ${room.capacity} miejsc` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Czas spotkania</dt>
              <dd className="mt-1 font-medium">
                {durationInMinutes > 0 ? `${durationInMinutes} min` : 'Wybierz godziny'}
              </dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-line pt-5 text-sm leading-6 text-muted">
            Możesz później anulować rezerwację w zakładce Moje rezerwacje.
          </p>
        </aside>
      </div>
    </main>
  );
}
