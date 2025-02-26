// src/db/index.ts
// import { config } from 'dotenv';
// config();
// import * as path from 'path';

import { Client } from 'pg';

// config({ path: path.resolve(__dirname, '../../.env') });


const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
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
