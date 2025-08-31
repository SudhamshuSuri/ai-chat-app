import pool from '$lib/db.js';
import { json } from '@sveltejs/kit';

export async function GET() {
	try {
		console.log('Checking existing users...');
		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query('SELECT id, email FROM users LIMIT 10');
		console.log('Users found:', result.rows.length);

		return json({
			status: 'ok',
			users: result.rows,
			count: result.rows.length
		});
	} catch (error) {
		console.error('Error checking users:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return json({ status: 'error', message: errorMessage }, { status: 500 });
	}
}
