require('dotenv').config()
import { Client } from 'pg'

const DATABASE_CONNECTION_OPTIONS = process.env.NODE_ENV === 'production'
    ? {
        ssl: true,
        connectionString: process.env.DATABASE_URL,
    }
    : {
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        port: Number(process.env.PG_PORT),
        password: process.env.PG_PASSWORD,
    }

export const database = new Client(DATABASE_CONNECTION_OPTIONS)

export async function setupDatabase() {
    try {
        await database.connect()
    } catch (error) {
        console.error('Connecting to database failed')
        console.error(error.message)
        throw new Error(error.message)
    }

    try {
        await database.query(
            `
            CREATE TABLE IF NOT EXISTS session (
                "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
                "sess" json NOT NULL,
                "expire" timestamp(6) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users
            (
                _id SERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                joined_groups INTEGER[],
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS crypto_currencies
            (
                _id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                symbol TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS group_participants
            (
                _id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                group_id INTEGER NOT NULL,
                score INTEGER,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS groups
            (
                _id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                crypto_currency INTEGER NOT NULL,
                group_participants INTEGER[],
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            `
        )
    } catch (error) {
        console.error('Creating tables failed')
        console.error(error.message)
        throw new Error(error.message)
    }
}
