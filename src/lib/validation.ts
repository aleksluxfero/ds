import { z } from 'zod';
import { dreamTypeEnum } from './schema';

export const dreamSchema = z.object({
    title: z.string().default(''),
    content: z.string().default(''),
    date: z.number().nullable().optional(),
    tags: z.array(z.string()).optional().default([]),
    type: z.enum(['normal', 'lucid', 'false_awakening', 'sleep_paralysis', 'vivid']).optional().default('normal'),
}).refine((data) => {
    return data.title.trim().length > 0 || data.content.trim().length > 0 || data.tags.length > 0;
}, {
    message: "At least one of title, content, or tags must be provided",
    path: ["title"] // Attach error to title field
});

export const dreamUpdateSchema = dreamSchema.partial();

export type DreamInput = z.infer<typeof dreamSchema>;
