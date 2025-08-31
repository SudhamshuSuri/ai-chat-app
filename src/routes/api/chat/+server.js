import { OPEN_ROUTER_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { messages } = await request.json();

		const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPEN_ROUTER_KEY}`
			},
			body: JSON.stringify({
				model: 'mistralai/mistral-small-3.2-24b-instruct:free',
				messages: messages,
				stream: true
			})
		});

		if (!res.ok) {
			throw new Error(`OpenRouter API error: ${res.status}`);
		}

		// Return the streaming response
		return new Response(res.body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (error) {
		console.error('Chat API error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
