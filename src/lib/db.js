import { Pool } from 'pg';
import { DATABASE_URL } from '$env/static/private';

const pool = new Pool({
	connectionString: DATABASE_URL
});

export default pool;
