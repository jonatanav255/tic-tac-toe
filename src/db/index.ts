// src/db/index.ts
import { Client } from 'pg';

// Configure the PostgreSQL client connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jonatanav255',
  password: 'jonatan123',
  database: 'myworkdb'
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
