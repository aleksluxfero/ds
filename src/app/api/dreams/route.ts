import { NextResponse } from 'next/server';
import { validateTelegramAuth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { dreams } from '@/lib/schema';
import { dreamSchema } from '@/lib/validation';
import { eq, desc, and, ilike, or, sql } from 'drizzle-orm';

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

export async function GET(request: Request) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const type = searchParams.get('type');

    try {
        let conditions = eq(dreams.userId, userId);

        if (search) {
            conditions = and(
                conditions,
                or(
                    ilike(dreams.title, `%${search}%`),
                    ilike(dreams.content, `%${search}%`)
                )
            )!;
        }

        if (type && type !== 'all') {
            // Cast type to any to avoid strict enum check if type string is loose, 
            // but ideally we validate it.
            conditions = and(conditions, eq(dreams.type, type as any))!;
        }

        const data = await db.select()
            .from(dreams)
            .where(conditions)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(dreams.date), desc(dreams.createdAt));

        return NextResponse.json({ dreams: data });
    } catch (error) {
        console.error('API Error fetching dreams:', error);
        return NextResponse.json({ message: 'Failed to fetch dreams.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authResult = await handleAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    try {
        const json = await request.json();
        const validation = dreamSchema.safeParse(json.dream);

        if (!validation.success) {
            return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten() }, { status: 400 });
        }

        const { title, content, date, tags, type } = validation.data;

        const [newDream] = await db.insert(dreams).values({
            userId,
            title,
            content,
            date,
            tags,
            type: type as any,
        }).returning();

        return NextResponse.json({ message: 'Dream created successfully.', dream: newDream });
    } catch (error) {
        console.error('API Error creating dream:', error);
        return NextResponse.json({ message: 'Failed to create dream.' }, { status: 500 });
    }
}
