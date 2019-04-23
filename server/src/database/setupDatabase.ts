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

            ${alterOwnerIfNotProduction('session')}

            CREATE TABLE IF NOT EXISTS users
            (
                _id SERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            ${alterOwnerIfNotProduction('users')}

            CREATE TABLE IF NOT EXISTS crypto_currencies
            (
                _id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                value_history FLOAT DEFAULT 0,
                current_value FLOAT DEFAULT 0,
                sort_order INTEGER,
                symbol TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE crypto_currencies ADD COLUMN IF NOT EXISTS sort_order INTEGER;
            ${alterOwnerIfNotProduction('crypto_currencies')}

            CREATE TABLE IF NOT EXISTS group_participants
            (
                _id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                group_id INTEGER NOT NULL,
                bet TEXT,
                effort INTEGER DEFAULT 0,
                hypothetical_gain INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            ${alterOwnerIfNotProduction('group_participants')}

            CREATE TABLE IF NOT EXISTS groups
            (
                _id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                crypto_currency INTEGER NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            ${alterOwnerIfNotProduction('groups')}
            `
        )
    } catch (error) {
        console.error('Creating tables failed')
        console.error(error.message)
        throw new Error(error.message)
    }
}

function alterOwnerIfNotProduction(table: string) {
    const environmentIsProduction = process.env.NODE_ENV === 'production'

    return environmentIsProduction
        ? ''
        : `ALTER TABLE ${table} OWNER TO admin;`
}
