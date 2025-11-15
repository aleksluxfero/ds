
import { NextResponse } from 'next/server';
import { createTables } from '../../../lib/db';

/**
 * API route to set up the database tables.
 * Calling GET on /api/setup-db will trigger the table creation.
 */
export async function GET() {
  try {
    await createTables();
    return NextResponse.json({ message: 'Database tables created or verified successfully.' });
  } catch (error) {
    console.error('API Error setting up database:', error);
    // It's important to return a proper error response
    return NextResponse.json(
      { message: 'Failed to set up database.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
