import { copyFile, cp, readdir, stat } from "node:fs/promises";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { slugifyStr } from "./slugify";

const BLOG_PATH = "src/data/blog";

type BuildDoneHookContext = {
    dir: URL;
    logger: {
        info: (message: string) => void;
        warn: (message: string) => void;
    };
};

const isDirectory = async (path: string) => {
    try {
        return (await stat(path)).isDirectory();
    } catch {
        return false;
    }
};

const toPosixPath = (value: string) => value.split("\\").join("/");

const collectBlogEntryFiles = async (dir: string): Promise<string[]> => {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name.startsWith("_")) {
                continue;
            }
            files.push(...(await collectBlogEntryFiles(fullPath)));
            continue;
        }

        if (!entry.isFile() || entry.name.startsWith("_")) {
            continue;
        }

        if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
            files.push(fullPath);
        }
    }

    return files;
};

const getBlogRouteFromEntryFile = (filePath: string) => {
    const normalizedPath = toPosixPath(filePath);
    const pathSegments = normalizedPath
        .replace(`${BLOG_PATH}/`, "")
        .split("/")
        .filter(segment => segment !== "")
        .filter(segment => !segment.startsWith("_"))
        .slice(0, -1)
        .map(segment => slugifyStr(segment));

    const fileName = basename(normalizedPath, extname(normalizedPath));
    const isIndexEntry = fileName.toLowerCase() === "index";
    const slug = slugifyStr(fileName);

    // `index.md` and `index.mdx` posts map to the directory route.
    if (isIndexEntry && pathSegments.length > 0) {
        return pathSegments.join("/");
    }

    if (pathSegments.length < 1) {
        return slug;
    }

    const lastPathSegment = pathSegments[pathSegments.length - 1];

    if (lastPathSegment === slug) {
        return pathSegments.join("/");
    }

    return [...pathSegments, slug].filter(Boolean).join("/");
};

export const sitemapAlias = (): AstroIntegration => ({
    name: "sitemap-xml-alias",
    hooks: {
        "astro:build:done": async ({ dir, logger }: BuildDoneHookContext) => {
            const dist = fileURLToPath(dir);
            const indexPath = join(dist, "sitemap-index.xml");
            const aliasPath = join(dist, "sitemap.xml");
            try {
                await copyFile(indexPath, aliasPath);
                logger.info("`sitemap.xml` created from `sitemap-index.xml`.");
            } catch {
                logger.warn("Could not create `sitemap.xml` alias.");
            }
        },
    },
});

export const copyBlogWwwDirs = (): AstroIntegration => ({
    name: "copy-blog-www-dirs",
    hooks: {
        "astro:build:done": async ({ dir, logger }: BuildDoneHookContext) => {
            const projectRoot = process.cwd();
            const dist = fileURLToPath(dir);
            const blogRoot = join(projectRoot, BLOG_PATH);

            if (!(await isDirectory(blogRoot))) {
                logger.warn(`Blog path "${BLOG_PATH}" does not exist. Skipping \`www\` asset copy.`);
                return;
            }

            const blogEntryFiles = await collectBlogEntryFiles(blogRoot);
            let copiedCount = 0;

            for (const entryFile of blogEntryFiles) {
                const sourceDir = dirname(entryFile);
                const sourceWwwDir = join(sourceDir, "www");

                if (!(await isDirectory(sourceWwwDir))) {
                    continue;
                }

                const relativeEntryPath = toPosixPath(relative(projectRoot, entryFile));
                const blogRoute = getBlogRouteFromEntryFile(relativeEntryPath);
                const destinationWwwDir = join(dist, "blog", blogRoute, "www");

                await cp(sourceWwwDir, destinationWwwDir, {
                    recursive: true,
                    force: true,
                });

                copiedCount += 1;
            }

            if (copiedCount > 0) {
                logger.info(`Copied ${copiedCount} blog \`www\` asset director${copiedCount === 1 ? "y" : "ies"}.`);
            }
        },
    },
});
