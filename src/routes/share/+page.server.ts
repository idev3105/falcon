import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { exist } from '$lib/server/services/room.service';

export const load: PageServerLoad = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		error(400, 'Id must not be empty');
	}
	const result = await exist(id);
	if (!result) {
		error(404, 'Id not found');
	}
	return {
		id: id
	};
};
