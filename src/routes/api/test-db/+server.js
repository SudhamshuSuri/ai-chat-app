import pool from '$lib/db.js';
import { json } from '@sveltejs/kit';

export async function GET() {
	try {
		console.log('Testing database connection...');
		// @ts-ignore - PostgreSQL pool type issue
		const result = await pool.query('SELECT NOW()');
		console.log('Database connection successful:', result.rows[0]);
		return json({ status: 'ok', timestamp: result.rows[0].now });
	} catch (error) {
		console.error('Database connection failed:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return json({ status: 'error', message: errorMessage }, { status: 500 });
	}
}
