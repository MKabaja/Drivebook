import { z } from 'zod';
import { request } from '../../shared/api/client';
export const roomSchema = z.object({
	id: z.number().int(),
	name: z.string(),
	capacity: z.number().int().positive(),
});
export type Room = z.infer<typeof roomSchema>;
export async function fetchRooms(signal?: AbortSignal): Promise<Room[]> {
	return z.array(roomSchema).parse(await request('/api/rooms', { signal }));
}
