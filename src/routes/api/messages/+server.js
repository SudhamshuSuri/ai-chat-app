import pool from '$lib/db.js';
import { json } from '@sveltejs/kit';

// Temporary UUID for testing - replace with proper user auth later
const TEMP_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET({ url, locals }) {
	try {
		const sessionId = url.searchParams.get('sessionId');
		if (!sessionId) {
			return json({ error: 'Session ID required' }, { status: 400 });
		}

		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query(
			'SELECT id, sender_type, content, created_at FROM messages WHERE chat_session_id = $1 ORDER BY created_at ASC',
			[sessionId]
		);

		return json(result.rows);
	} catch (error) {
		console.error('Error fetching messages:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST({ request, locals }) {
	try {
		const { sessionId, senderType, content } = await request.json();

		if (!sessionId || !senderType || !content) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query(
			'INSERT INTO messages (chat_session_id, sender_type, content) VALUES ($1, $2, $3) RETURNING *',
			[sessionId, senderType, content]
		);

		// Update the session's updated_at
		// @ts-ignore - PostgreSQL pool type issue
		await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [
			sessionId
		]);

		return json(result.rows[0]);
	} catch (error) {
		console.error('Error saving message:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
