// src/db/index.ts
import { config } from 'dotenv';
// config();
import * as path from 'path';

import { Client } from 'pg';

config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

console.log('Environment Variables:', {
  PG_HOST: process.env.PG_HOST,
  PG_USER: process.env.PG_USER,
  PG_DATABASE: process.env.PG_DATABASE,
  PG_PORT: process.env.PG_PORT,
});


client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    return client.query('SELECT * FROM game_winners');
  })
  .then(result => {
    console.log('Query results:', result.rows);
  })
  .catch(err => {
    console.error('Error connecting / executing query:', err);
  });

export default client;
