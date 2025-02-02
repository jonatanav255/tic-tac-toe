// src/db/index.ts
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from the .env file located at the project root
config({ path: path.resolve(__dirname, '../../.env') });

import { Client } from 'pg';

// Create a new PostgreSQL client using environment variables
const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});

// Connect to the database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    // You can execute queries here, for example:
    return client.query('SELECT * FROM game_winners');
  })
  .then(result => {
    // If you run a query above, you can handle the result here
    // console.log('Query results:', result.rows);
  })
  .catch(err => {
    console.error('Error connecting to the database or executing query:', err);
  });

export default client;
