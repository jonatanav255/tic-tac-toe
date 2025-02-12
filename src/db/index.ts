// src/db/index.ts
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Client } from 'pg';

// Load environment variables from .env if you want in dev:
config({ path: path.resolve(__dirname, '../../.env') });

// const caCertPath = process.env.PG_SSL_CA_PATH || '/app/us-east-1-bundle.pem';
// const caCert = fs.readFileSync(caCertPath, 'utf8');

const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  // ssl: {
  //   ca: caCert,
  //   rejectUnauthorized: true, // Force certificate validation
  // },
});

// client.connect()
//   .then(() => {
//     console.log('Connected to PostgreSQL database');
//     return client.query('SELECT * FROM game_winners');
//   })
//   .then(result => {
//     console.log('Query results:', result.rows);
//   })
//   .catch(err => {
//     console.error('Error connecting / executing query:', err);
//   });

export default client;
