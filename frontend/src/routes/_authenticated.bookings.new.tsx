import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { BookingForm } from '../features/bookings/booking-form';
import { fetchRooms } from '../features/rooms/api';
export const Route = createFileRoute('/_authenticated/bookings/new')({
  validateSearch: z.object({
    roomId: z.number().int().positive().optional().catch(undefined),
    startsAt: z.string().max(30).optional().catch(undefined),
    endsAt: z.string().max(30).optional().catch(undefined),
    participants: z
      .string()
      .regex(/^\d{1,6}$/)
      .optional()
      .catch(undefined)
  }),
  loader: ({ abortController }) => fetchRooms(abortController.signal),
  component: NewBookingRoute
});
function NewBookingRoute() {
  const { roomId, startsAt, endsAt, participants } = Route.useSearch();
  return (
    <BookingForm
      key={roomId}
      rooms={Route.useLoaderData()}
      initialRoomId={roomId}
      initialStartsAt={startsAt}
      initialEndsAt={endsAt}
      initialParticipants={participants}
    />
  );
}
