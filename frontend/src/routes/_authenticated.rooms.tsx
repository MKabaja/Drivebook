import { createFileRoute } from '@tanstack/react-router';
import { fetchRooms } from '../features/rooms/api';
import { RoomsPage } from '../features/rooms/rooms-page';
export const Route = createFileRoute('/_authenticated/rooms')({
	loader: ({ abortController }) => fetchRooms(abortController.signal),
	component: RoomsRoute,
});
function RoomsRoute() {
	return <RoomsPage rooms={Route.useLoaderData()} />;
}
