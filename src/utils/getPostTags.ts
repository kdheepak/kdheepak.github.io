import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";

export const DRAFT_TAG = "draft";

const getPostTags = (post: CollectionEntry<"blog">) => {
  const baseTags = post.data.tags;
  const allTags = post.data.draft ? [...baseTags, DRAFT_TAG] : baseTags;
  const seen = new Set<string>();

  return allTags.filter(tag => {
    const slug = slugifyStr(tag);
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
};

export default getPostTags;
