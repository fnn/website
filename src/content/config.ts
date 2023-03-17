import { z, defineCollection } from "astro:content";

const shortsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    created: z.string().datetime(),
    updated: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  shorts: shortsCollection,
};
