import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL Database Connection Configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'klinik_hapud',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function testDbConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const p = getDbPool();
    const connection = await p.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true, message: `Terhubung ke MySQL (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})` };
  } catch (error: any) {
    return { connected: false, message: `Tidak dapat terhubung ke MySQL: ${error.message || error}` };
  }
}
