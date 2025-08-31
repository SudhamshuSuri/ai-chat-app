import { sequence } from '@sveltejs/kit/hooks';
import { CLERK_SECRET_KEY } from '$env/static/private';
import { verifyToken } from '@clerk/backend';

export const handle = sequence(async ({ event, resolve }) => {
	const token = event.request.headers.get('authorization')?.replace('Bearer ', '');

	if (token) {
		try {
			const payload = await verifyToken(token, {
				secretKey: CLERK_SECRET_KEY
			});
			event.locals.user = payload.sub;
		} catch (error) {
			console.error('Token verification failed:', error);
		}
	}

	return resolve(event);
});
