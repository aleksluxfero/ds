
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { validateTelegramAuth } from '@/lib/auth';
import { Dream } from '@/lib/db';

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

// GET /api/dreams/[id] - Fetches a single dream
export async function GET(request: Request, { params }: any) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;
    const dreamId = parseInt(params.id, 10);

    try {
        const { rows: [dream] } = await sql<Dream>`
            SELECT * FROM dreams WHERE id = ${dreamId} AND user_id = ${userId};
        `;
        if (!dream) {
            return NextResponse.json({ message: 'Dream not found.' }, { status: 404 });
        }
        return NextResponse.json({ dream });
    } catch (error) {
        console.error(`API Error fetching dream ${dreamId}:`, error);
        return NextResponse.json({ message: 'Failed to fetch dream.' }, { status: 500 });
    }
}

// PUT /api/dreams/[id] - Updates a dream
export async function PUT(request: Request, { params }: any) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;
    const dreamId = parseInt(params.id, 10);

    try {
        const { dream: dreamInput } = await request.json();
        const { title, content, date, tags, type } = dreamInput;

        const { rows: [updatedDream] } = await sql<Dream>`
            UPDATE dreams
            SET
                title = ${title},
                content = ${content},
                date = ${date},
                tags = ${tags},
                type = ${type}
            WHERE id = ${dreamId} AND user_id = ${userId}
            RETURNING *;
        `;

        if (!updatedDream) {
            return NextResponse.json({ message: 'Dream not found or access denied.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Dream updated successfully.', dream: updatedDream });
    } catch (error) {
        console.error(`API Error updating dream ${dreamId}:`, error);
        return NextResponse.json({ message: 'Failed to update dream.' }, { status: 500 });
    }
}

// DELETE /api/dreams/[id] - Deletes a dream
export async function DELETE(request: Request, { params }: any) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;
    const dreamId = parseInt(params.id, 10);

    try {
        const result = await sql`
            DELETE FROM dreams WHERE id = ${dreamId} AND user_id = ${userId};
        `;

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Dream not found or access denied.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Dream deleted successfully.' });
    } catch (error) {
        console.error(`API Error deleting dream ${dreamId}:`, error);
        return NextResponse.json({ message: 'Failed to delete dream.' }, { status: 500 });
    }
}
