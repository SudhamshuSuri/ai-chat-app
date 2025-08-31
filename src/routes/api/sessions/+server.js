import pool from '$lib/db.js';
import { json } from '@sveltejs/kit';

// Temporary UUID for testing - replace with proper user auth later
const TEMP_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET({ locals }) {
	try {
		const userId = TEMP_USER_ID;

		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query(
			'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
			[userId]
		);

		return json(result.rows);
	} catch (error) {
		console.error('Error fetching sessions:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST({ request, locals }) {
	try {
		const userId = TEMP_USER_ID;

		const { title } = await request.json();

		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query(
			'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
			[userId, title || 'New Chat']
		);

		return json(result.rows[0]);
	} catch (error) {
		console.error('Error creating session:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PATCH({ request, locals }) {
	try {
		const { id, title } = await request.json();

		if (!id || !title) {
			return json({ error: 'Session ID and title required' }, { status: 400 });
		}

		// Update session title
		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query(
			'UPDATE chat_sessions SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
			[title, id, TEMP_USER_ID]
		);

		if (result.rows.length === 0) {
			return json({ error: 'Session not found or unauthorized' }, { status: 404 });
		}

		return json(result.rows[0]);
	} catch (error) {
		console.error('Error updating session:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE({ url, locals }) {
	try {
		const sessionId = url.searchParams.get('id');
		if (!sessionId) {
			return json({ error: 'Session ID required' }, { status: 400 });
		}

		// Delete the session (messages will be cascade deleted due to foreign key)
		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query(
			'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING *',
			[sessionId, TEMP_USER_ID]
		);

		if (result.rows.length === 0) {
			return json({ error: 'Session not found or unauthorized' }, { status: 404 });
		}

		return json({ success: true, deletedSession: result.rows[0] });
	} catch (error) {
		console.error('Error deleting session:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
