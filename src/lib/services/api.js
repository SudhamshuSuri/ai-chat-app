// API Service - Handles all external API calls

/**
 * Get all sessions for the current user
 * @returns {Promise<Array<Object>>} - Array of session objects
 */
export async function getSessions() {
	try {
		const response = await fetch('/api/sessions');

		if (!response.ok) {
			throw new Error(`Failed to fetch sessions: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Session service error:', error);
		throw error;
	}
}

/**
 * Create a new chat session
 * @param {string} title - Session title
 * @returns {Promise<Object>} - Created session object
 */
export async function createSession(title = 'New Chat') {
	try {
		const response = await fetch('/api/sessions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ title })
		});

		if (!response.ok) {
			throw new Error(`Failed to create session: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Create session error:', error);
		throw error;
	}
}

/**
 * Delete a chat session
 * @param {string} sessionId - Session ID to delete
 * @returns {Promise<Object>} - Deletion confirmation
 */
export async function deleteSession(sessionId) {
	try {
		const response = await fetch(`/api/sessions?id=${sessionId}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error(`Failed to delete session: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Delete session error:', error);
		throw error;
	}
}

/**
 * Update session title
 * @param {string} sessionId - Session ID
 * @param {string} title - New title
 * @returns {Promise<Object>} - Updated session object
 */
export async function updateSessionTitle(sessionId, title) {
	try {
		const response = await fetch('/api/sessions', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: sessionId, title })
		});

		if (!response.ok) {
			throw new Error(`Failed to update session: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Update session title error:', error);
		throw error;
	}
}

/**
 * Get all messages for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array<Object>>} - Array of message objects
 */
export async function getMessages(sessionId) {
	try {
		const response = await fetch(`/api/messages?sessionId=${sessionId}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch messages: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Message service error:', error);
		throw error;
	}
}

/**
 * Save a message to the database
 * @param {string} sessionId - Session ID
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 * @returns {Promise<Object|null|{message: Object, newSessionId: string}>} - Saved message object, or object with message and new session ID if local session was converted
 */
export async function saveMessage(sessionId, role, content) {
	// Handle local sessions by creating a proper database session first
	let actualSessionId = sessionId;

	if (!sessionId || sessionId.startsWith('local-')) {
		console.log('🔄 Converting local session to database session...');

		try {
			// Create a new session in the database
			const newSession = /** @type {{id: string}} */ (await createSession('New Chat'));
			actualSessionId = newSession.id;
		} catch (error) {
			console.error('Failed to create database session:', error);
			return null;
		}
	}

	// Now save the message with the actual session ID

	// Map role to valid enum values
	let senderType;
	if (role === 'assistant') {
		senderType = 'ai';
	} else if (role === 'user') {
		senderType = 'user';
	} else {
		senderType = 'user'; // Default to user
	}

	try {
		const response = await fetch('/api/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sessionId: actualSessionId,
				senderType,
				content
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to save message: ${response.status} - ${errorText}`);
		}

		const result = await response.json();

		// Return both the message and the new session ID if it was converted
		if (sessionId !== actualSessionId) {
			return { message: result, newSessionId: actualSessionId };
		}

		return result;
	} catch (error) {
		console.error(
			'❌ Error saving message:',
			error instanceof Error ? error.message : String(error)
		);
		throw error;
	}
}

/**
 * Search through conversations
 * @param {string} query - Search query
 * @returns {Promise<Array<Object>>} - Array of search results
 */
export async function searchConversations(query) {
	if (!query.trim()) {
		return [];
	}

	try {
		const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

		if (!response.ok) {
			throw new Error(`Search failed: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Search error:', error);
		throw error;
	}
}

/**
 * Send a message to the AI and get streaming response
 * @param {Array<Object>} messages - Array of message objects
 * @returns {Promise<Response>} - Streaming response
 */
export async function sendChatMessage(messages) {
	try {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ messages })
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		return response;
	} catch (error) {
		console.error('Chat service error:', error);
		throw error;
	}
}
