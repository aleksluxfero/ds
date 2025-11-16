
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { validateTelegramAuth } from '@/lib/auth';
import { Dream } from '@/lib/db';

/**
 * A helper function to handle authentication for all dream routes.
 * @param request - The incoming NextRequest.
 * @returns A NextResponse for errors, or the validated user ID.
 */
async function handleAuth(request: Request) {
    const initData = request.headers.get('X-Telegram-Auth');
    if (!initData) {
        return new NextResponse(JSON.stringify({ message: 'Authentication required.' }), { status: 401 });
    }
    try {
        const user = validateTelegramAuth(initData);
        return user.id;
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: 'Invalid authentication.' }), { status: 403 });
    }
}


// GET /api/dreams - Fetches all dreams for the authenticated user
export async function GET(request: Request) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) {
        return authResult; // Return error response
    }
    const userId = authResult;

    try {
        const { rows: dreams } = await sql<Dream>`
            SELECT * FROM dreams
            WHERE user_id = ${userId}
            ORDER BY date DESC NULLS LAST, created_at DESC;
        `;
        return NextResponse.json({ dreams });
    } catch (error) {
        console.error('API Error fetching dreams:', error);
        return NextResponse.json({ message: 'Failed to fetch dreams.' }, { status: 500 });
    }
}

// POST /api/dreams - Creates a new dream for the authenticated user
export async function POST(request: Request) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) {
        return authResult; // Return error response
    }
    const userId = authResult;

    try {
        const { dream: dreamInput } = await request.json();
        if (
            !dreamInput ||
            (!dreamInput.title?.trim() &&
             !dreamInput.content?.trim() &&
             (!dreamInput.tags || dreamInput.tags.length === 0))
        ) {
            return NextResponse.json({ message: 'A title, content, or tag is required to save a dream.' }, { status: 400 });
        }

        const { title, content, date, tags, type } = dreamInput;

        const { rows: [newDream] } = await sql<Dream>`
            INSERT INTO dreams (user_id, title, content, date, tags, type)
            VALUES (${userId}, ${title}, ${content}, ${date || null}, ${tags || []}, ${type || 'normal'})
            RETURNING *;
        `;

        return NextResponse.json({ message: 'Dream created successfully.', dream: newDream });

    } catch (error) {
        console.error('API Error creating dream:', error);
        return NextResponse.json({ message: 'Failed to create dream.' }, { status: 500 });
    }
}
