import { z } from 'zod';
import { dreamTypeEnum } from './schema';

export const dreamSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    date: z.number().nullable().optional(),
    tags: z.array(z.string()).optional().default([]),
    type: z.enum(['normal', 'lucid', 'false_awakening', 'sleep_paralysis', 'vivid']).optional().default('normal'),
});

export const dreamUpdateSchema = dreamSchema.partial();

export type DreamInput = z.infer<typeof dreamSchema>;
