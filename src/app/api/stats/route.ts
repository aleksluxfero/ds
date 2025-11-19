import { NextResponse } from 'next/server';
import { validateTelegramAuth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { dreams } from '@/lib/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

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
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const type = searchParams.get('type');

    try {
        let conditions = eq(dreams.userId, userId);

        if (startDateStr) {
            const startDate = new Date(startDateStr);
            // Ensure we compare against the timestamp number if that's how it's stored, 
            // or convert if using actual date columns. 
            // Schema says `date` is bigint (number).
            conditions = and(conditions, sql`(${dreams.date} >= ${startDate.getTime()} OR ${dreams.date} IS NULL)`)!;
        }

        if (endDateStr) {
            const endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999);
            conditions = and(conditions, sql`(${dreams.date} <= ${endDate.getTime()} OR ${dreams.date} IS NULL)`)!;
        }

        if (type && type !== 'all') {
            conditions = and(conditions, eq(dreams.type, type as any))!;
        }

        // Fetch all matching dreams to calculate stats
        // For very large datasets, we should do aggregation in SQL.
        // Given the current schema and likely usage, fetching fields needed for stats is okay,
        // but let's try to be efficient.
        const data = await db.select({
            type: dreams.type,
            tags: dreams.tags,
        }).from(dreams).where(conditions);

        const total = data.length;
        const normalCount = data.filter(d => d.type === 'normal').length;
        const lucidCount = data.filter(d => d.type === 'lucid').length;
        const vividCount = data.filter(d => d.type === 'vivid').length;
        const faCount = data.filter(d => d.type === 'false_awakening').length;
        const spCount = data.filter(d => d.type === 'sleep_paralysis').length;

        const tagCounts: Record<string, number> = {};
        data.forEach(d => {
            d.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const sortedTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([tag, count]) => ({ tag, count }));

        return NextResponse.json({
            stats: {
                total,
                normalCount,
                lucidCount,
                vividCount,
                faCount,
                spCount,
                tagStats: sortedTags
            }
        });

    } catch (error) {
        console.error('API Error fetching stats:', error);
        return NextResponse.json({ message: 'Failed to fetch stats.' }, { status: 500 });
    }
}
