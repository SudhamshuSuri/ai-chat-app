import pool from '$lib/db.js';
import { json } from '@sveltejs/kit';

// Temporary UUID for testing - replace with proper user auth later
const TEMP_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function POST() {
	try {
		console.log('Setting up temp user...');

		// Check if user already exists
		// @ts-ignore - PostgreSQL pool type issue
		const existing = await pool.query('SELECT id FROM users WHERE id = $1', [TEMP_USER_ID]);

		if (existing.rows.length > 0) {
			console.log('✅ Temp user already exists');
			return json({ status: 'ok', message: 'User already exists', userId: TEMP_USER_ID });
		}

		// Create the temp user
		// @ts-ignore - PostgreSQL pool type issue
		await pool.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
			TEMP_USER_ID,
			'temp@example.com',
			'temp'
		]);

		console.log('✅ Temp user created successfully');
		return json({ status: 'ok', message: 'User created', userId: TEMP_USER_ID });
	} catch (error) {
		console.error('Error creating temp user:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return json({ status: 'error', message: errorMessage }, { status: 500 });
	}
}
