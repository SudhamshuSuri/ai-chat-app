import pool from '$lib/db.js';
import { json } from '@sveltejs/kit';

// Temporary UUID for testing - replace with proper user auth later
const TEMP_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET({ url, locals }) {
	try {
		const query = url.searchParams.get('q');
		if (!query) {
			return json([]);
		}

		const userId = TEMP_USER_ID;

		// Search in message content and session titles
		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query(
			`
			SELECT DISTINCT
				cs.id,
				cs.title,
				cs.created_at,
				cs.updated_at,
				m.content as matching_content
			FROM chat_sessions cs
			LEFT JOIN messages m ON cs.id = m.chat_session_id
			WHERE cs.user_id = $1
			AND (
				cs.title ILIKE $2
				OR m.content ILIKE $2
			)
			ORDER BY cs.updated_at DESC
			LIMIT 20
		`,
			[userId, `%${query}%`]
		);

		return json(result.rows);
	} catch (error) {
		console.error('Error searching:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
