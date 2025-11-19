import { NextResponse } from 'next/server';
import { validateTelegramAuth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { dreams } from '@/lib/schema';
import { dreamUpdateSchema } from '@/lib/validation';
import { eq, and } from 'drizzle-orm';

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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;
    const dreamId = parseInt(id, 10);

    try {
        const [dream] = await db.select()
            .from(dreams)
            .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)));

        if (!dream) {
            return NextResponse.json({ message: 'Dream not found.' }, { status: 404 });
        }
        return NextResponse.json({ dream });
    } catch (error) {
        console.error(`API Error fetching dream ${dreamId}:`, error);
        return NextResponse.json({ message: 'Failed to fetch dream.' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;
    const dreamId = parseInt(id, 10);

    try {
        const json = await request.json();
        const validation = dreamUpdateSchema.safeParse(json.dream);

        if (!validation.success) {
            return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten() }, { status: 400 });
        }

        const [updatedDream] = await db.update(dreams)
            .set({
                ...validation.data,
                type: validation.data.type as any,
                updatedAt: new Date(),
            })
            .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)))
            .returning();

        if (!updatedDream) {
            return NextResponse.json({ message: 'Dream not found or access denied.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Dream updated successfully.', dream: updatedDream });
    } catch (error) {
        console.error(`API Error updating dream ${dreamId}:`, error);
        return NextResponse.json({ message: 'Failed to update dream.' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;
    const dreamId = parseInt(id, 10);

    try {
        const [deletedDream] = await db.delete(dreams)
            .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)))
            .returning();

        if (!deletedDream) {
            return NextResponse.json({ message: 'Dream not found or access denied.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Dream deleted successfully.' });
    } catch (error) {
        console.error(`API Error deleting dream ${dreamId}:`, error);
        return NextResponse.json({ message: 'Failed to delete dream.' }, { status: 500 });
    }
}
