// src/db/index.ts
import { config } from 'dotenv';
import * as path from 'path'
import * as fs from 'fs';


// Load environment variables from the .env file located at the project root
config({ path: path.resolve(__dirname, '../../.env') });

import { Client } from 'pg';

const caCertPath = process.env.PG_SSL_CA_PATH || '/opt/myapp/ssl/rds-combined-ca-bundle.pem';
const caCert = fs.readFileSync(caCertPath).toString();


// Create a new PostgreSQL client using environment variables
const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});

console.log("----------------------------3")
console.log({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
    ca: caCert,
    rejectUnauthorized: true  // Ensure the certificate chain is verified
  }
});

console.log("----------------------------3")


// Connect to the database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    // You can execute queries here, for example:
    // return client.query('SELECT * FROM game_winners');
    return client.query('SELECT * FROM game_winners');
  })
  .then(result => {
    // If you run a query above, you can handle the result here
    console.log('Query results:', result.rows);
  })
  .catch(err => {
    console.error('Error connecting to the database or executing query:', err);
  });

export default client;
