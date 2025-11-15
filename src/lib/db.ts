
import { sql } from '@vercel/postgres';

// Enum for DreamType, matching the source project's types.ts
export enum DreamType {
  Normal = 'normal',
  Lucid = 'lucid',
  FalseAwakening = 'false_awakening',
  SleepParalysis = 'sleep_paralysis',
  Vivid = 'vivid'
}

// Interface for the Dream object, for use in our application code
export interface Dream {
  id: number;
  user_id: number;
  title: string;
  content: string;
  date: number | null;
  tags: string[];
  type: DreamType;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for the User object
export interface User {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

/**
 * Creates the necessary database tables if they don't already exist.
 * This function is idempotent and safe to run on every application startup.
 */
export async function createTables() {
  console.log("Attempting to create database tables...");

  try {
    // The Vercel Postgres SDK uses template literals for safe, parameterized queries.
    // We combine all table creation logic into a single transaction block.
    await sql.query(`
      BEGIN;

      -- Create a custom ENUM type for dream types if it doesn't exist
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dream_type') THEN
              CREATE TYPE dream_type AS ENUM ('normal', 'lucid', 'false_awakening', 'sleep_paralysis', 'vivid');
          END IF;
      END$$;

      -- Create the users table
      CREATE TABLE IF NOT EXISTS users (
          id BIGINT PRIMARY KEY,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          username VARCHAR(255),
          language_code VARCHAR(10),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create the dreams table
      CREATE TABLE IF NOT EXISTS dreams (
          id SERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          date BIGINT, -- Storing as BIGINT to match the timestamp number from the original app
          tags TEXT[],
          type dream_type,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create a function to update the updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Drop existing trigger to avoid errors on re-run
      DROP TRIGGER IF EXISTS update_dreams_updated_at ON dreams;

      -- Create a trigger to automatically update the updated_at field on dreams table
      CREATE TRIGGER update_dreams_updated_at
      BEFORE UPDATE ON dreams
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

      COMMIT;
    `);
    console.log("Successfully ensured tables and types exist.");
  } catch (error) {
    console.error("Error creating database tables:", error);
    // If we are in a transaction, we should roll back
    await sql.query('ROLLBACK;');
    throw error;
  }
}
