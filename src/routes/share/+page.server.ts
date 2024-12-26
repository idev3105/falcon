import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { shareSessionsTable } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		error(400, 'Token must not be empty');
	}
	const result = await db
		.select({ count: sql`count(*)`.mapWith(Number) })
		.from(shareSessionsTable)
		.where(eq(shareSessionsTable.token, token));
	if (result.length === 0 || result[0].count === 0) {
		error(404, 'Token not found');
	}
	return {
		token: token
	};
};
