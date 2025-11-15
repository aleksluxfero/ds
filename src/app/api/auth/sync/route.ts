
import { NextResponse } from 'next/server';
import { validateTelegramAuth, syncUser } from '@/lib/auth';

/**
 * API route to sync a Telegram user.
 * Receives initData, validates it, and upserts the user into the database.
 */
export async function POST(request: Request) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json({ message: 'initData is required.' }, { status: 400 });
    }

    // Validate the initData and get the user object
    const validatedUser = validateTelegramAuth(initData);

    // Sync the user to the database
    const dbUser = await syncUser(validatedUser);

    return NextResponse.json({ message: 'User synced successfully.', user: dbUser });

  } catch (error: any) {
    // Auth errors from validateTelegramAuth will be caught here
    if (error.message === 'Invalid authentication data.') {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    
    // Other errors
    console.error('API Error syncing user:', error);
    return NextResponse.json(
      { message: 'Failed to sync user.', error: error.message },
      { status: 500 }
    );
  }
}
