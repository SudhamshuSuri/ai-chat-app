// Streaming Service - Handles streaming response processing

/**
 * Process streaming response from AI
 * @param {Response} response - Streaming response
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onComplete - Callback when complete
 */
export async function processStreamingResponse(response, onChunk, onComplete) {
	try {
		if (!response.body) {
			throw new Error('No response body');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder('utf-8');
		let done = false;
		let assistantMessage = '';

		while (!done) {
			const { value, done: streamDone } = await reader.read();
			done = streamDone;

			if (value) {
				const chunk = decoder.decode(value, { stream: true });
				for (const line of chunk.split('\n')) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6).trim();
						if (data === '[DONE]') {
							done = true;
							break;
						}

						try {
							const json = JSON.parse(data);
							const delta = json.choices?.[0]?.delta?.content;
							if (delta) {
								assistantMessage += delta;
								onChunk(delta, assistantMessage);
							}
						} catch (parseError) {
							console.warn('Failed to parse streaming data:', parseError);
						}
					}
				}
			}
		}

		onComplete(assistantMessage);
	} catch (error) {
		console.error('Streaming response error:', error);
		throw error;
	}
}
