import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.array(z.string()),
  draft: z.boolean().optional(),
  accent: z
    .enum([
      "red",
      "orange",
      "amber",
      "yellow",
      "lime",
      "green",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      "rose",
    ])
    .optional(),
});

const labs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/labs" }),
  schema: postSchema,
});

const lens = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/lens" }),
  schema: postSchema,
});

export const collections = { labs, lens };
