// Quick test script to verify database connection
import { Pool } from 'pg';
import { config } from 'dotenv';
config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

async function testConnection() {
	try {
		console.log('Testing database connection...');
		const result = await pool.query('SELECT NOW(), version()');
		console.log('✅ Connection successful!');
		console.log('Current time:', result.rows[0].now);
		console.log(
			'PostgreSQL version:',
			result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
		);

		// Test if our tables exist
		const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('chat_sessions', 'messages', 'users')
    `);

		console.log(
			'Found tables:',
			tables.rows.map((r) => r.table_name)
		);

		await pool.end();
	} catch (error) {
		console.error('❌ Connection failed:', error.message);
		process.exit(1);
	}
}

testConnection();
