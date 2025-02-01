// src/db/index.ts
import { config } from 'dotenv';
import { Client } from 'pg';

// Load environment variables from the .env file
config();

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
  })
  .catch(err => {
    console.error('Failed to connect to PostgreSQL database:', err);
  });

export default client;
