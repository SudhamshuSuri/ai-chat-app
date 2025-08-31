/**
 * Client-side error handler.
 * @param {Object} args - The arguments for the handleError function.
 * @param {Error} args.error - The error object.
 * @param {import('@sveltejs/kit').RequestEvent} args.event - The SvelteKit request event.
 */
export const handleError = async ({ error, event }) => {
	console.error(error, event);
};
