import 'dotenv/config';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { shareSessionsTable } from '$lib/server/db/schema';

export const actions = {
	default: async () => {
		const token = crypto.randomUUID();
		await db.insert(shareSessionsTable).values({ token });
		redirect(303, '/share?token=' + token);
	}
} satisfies Actions;
