
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { validateTelegramAuth } from '@/lib/auth';

// This is the same helper from the parent route. In a larger app, this would be in a shared lib file.
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

// GET /api/tags - Fetches all unique tags for the authenticated user
export async function GET(request: Request) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) {
        return authResult; // Return error response
    }
    const userId = authResult;

    try {
        // unnest() expands the array into a set of rows.
        // DISTINCT filters for unique values.
        const { rows } = await sql`
            SELECT DISTINCT unnest(tags) AS tag
            FROM dreams
            WHERE user_id = ${userId} AND tags IS NOT NULL AND cardinality(tags) > 0
            ORDER BY tag;
        `;
        
        const tags = rows.map(row => row.tag);
        
        return NextResponse.json({ tags });
    } catch (error) {
        console.error('API Error fetching tags:', error);
        return NextResponse.json({ message: 'Failed to fetch tags.' }, { status: 500 });
    }
}
