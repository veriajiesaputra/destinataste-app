import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'destinataste_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Aktifkan SSL untuk cloud MySQL seperti TiDB Cloud / Aiven
if (process.env.DB_SSL === 'true' || Number(process.env.DB_PORT) === 4000) {
  poolConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool(poolConfig);

export default pool;
