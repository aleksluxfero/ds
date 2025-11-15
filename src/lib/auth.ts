
import { validate, type User } from '@tma.js/init-data-node';
import { sql } from '@vercel/postgres';

/**
 * Validates the initData string from Telegram.
 * @param initData - The initData string from the request.
 * @returns The validated user object from the initData.
 * @throws {Error} If the bot token is not configured.
 * @throws {Error} If validation fails.
 */
export function validateTelegramAuth(initData: string): User {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not configured in environment variables.');
    throw new Error('Authentication provider is not configured.');
  }

  try {
    // The validate function will throw an error if validation fails.
    validate(initData, botToken, { expiresIn: 3600 }); // Expires in 1 hour

    // The library's documentation is a bit sparse on return, but typically,
    // you'd parse the initData after validation. Let's assume we need to parse it.
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) {
        throw new Error('User data is missing from initData');
    }
    
    const user: User = JSON.parse(userJson);
    return user;

  } catch (error: any) {
    console.error('Telegram auth validation failed:', error.message);
    throw new Error('Invalid authentication data.');
  }
}

/**
 * Creates or updates a user in the database based on validated Telegram data.
 * @param user - The validated user object.
 * @returns The user from the database.
 */
export async function syncUser(user: User) {
    if (!user || !user.id) {
        throw new Error("Invalid user data for sync.");
    }

    try {
        const result = await sql`
            INSERT INTO users (id, first_name, last_name, username, language_code)
            VALUES (${user.id}, ${user.first_name}, ${user.last_name || null}, ${user.username || null}, ${user.language_code || null})
            ON CONFLICT (id) DO UPDATE
            SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                username = EXCLUDED.username,
                language_code = EXCLUDED.language_code
            RETURNING *;
        `;
        return result.rows[0];
    } catch (error) {
        console.error('Error syncing user to database:', error);
        throw new Error('Could not sync user.');
    }
}
