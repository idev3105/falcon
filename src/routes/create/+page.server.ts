import 'dotenv/config';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { create } from '$lib/server/services/room.service';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		if (!name || typeof name !== 'string') {
			error(400, 'Name must not be empty');
		}
		const room = await create(name);
		redirect(303, '/share?id=' + room.id);
	}
} satisfies Actions;
