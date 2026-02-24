import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.preprocess(
      input => {
        if (!input || typeof input !== "object" || Array.isArray(input)) {
          return input;
        }

        const frontmatter = input as Record<string, unknown>;
        let normalized = frontmatter;

        if (!("pubDatetime" in normalized)) {
          if ("pubDateTime" in normalized) {
            normalized = { ...normalized, pubDatetime: normalized.pubDateTime };
          } else if ("date" in normalized) {
            normalized = { ...normalized, pubDatetime: normalized.date };
          }
        }

        // Use `description` as the single canonical summary field.
        if (!("description" in normalized)) {
          if ("summary" in normalized && typeof normalized.summary === "string") {
            normalized = { ...normalized, description: normalized.summary };
          } else if (
            "subtitle" in normalized &&
            typeof normalized.subtitle === "string"
          ) {
            normalized = { ...normalized, description: normalized.subtitle };
          }
        }

        return normalized;
      },
      z.object({
        author: z.string().default(SITE.author),
        pubDatetime: z.date(),
        modDatetime: z.date().optional().nullable(),
        title: z.string(),
        featured: z.boolean().optional(),
        draft: z.boolean().optional(),
        tags: z.array(z.string()).default(["others"]),
        ogImage: image().or(z.string()).optional(),
        description: z.string(),
        notebookPath: z.string().optional(),
        canonicalURL: z.string().optional(),
        hideEditPost: z.boolean().optional(),
        toc: z.boolean().optional().default(true),
        mathjax: z.boolean().optional().default(true),
        timezone: z.string().optional(),
      })
    ),
});

export const collections = { blog };
