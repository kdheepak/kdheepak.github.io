import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/blog` in return value
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true
) {
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  // Making sure `id` does not contain the directory
  const blogId = id.split("/");
  const slug = blogId.length > 0 ? blogId.slice(-1)[0] : "";
  const baseSegments = includeBase ? ["blog"] : [];

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    const routeSegments = [...baseSegments, slug].filter(Boolean);
    const path = routeSegments.join("/");
    return includeBase ? `/${path}/` : path;
  }

  const lastPathSegment = pathSegments[pathSegments.length - 1];

  // For nested `index.md` content, Astro's content id can already be the
  // directory name; avoid duplicating the segment in URLs.
  if (lastPathSegment === slug) {
    const routeSegments = [...baseSegments, ...pathSegments].filter(Boolean);
    const path = routeSegments.join("/");
    return includeBase ? `/${path}/` : path;
  }

  const routeSegments = [...baseSegments, ...pathSegments, slug].filter(Boolean);
  const path = routeSegments.join("/");
  return includeBase ? `/${path}/` : path;
}
