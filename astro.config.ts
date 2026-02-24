import { copyFile, cp, readdir, stat } from "node:fs/promises";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, envField, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeCitation from "rehype-citation";
import rehypeRaw from "rehype-raw";
import rehypeMermaid from "rehype-mermaid";
import remarkDirective from "remark-directive";
import {
    transformerNotationDiff,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { remarkDirectives } from "./src/utils/remark-directives.js";
import { remarkImageAttributes } from "./src/utils/remark-image-attributes.js";
import { remarkMermaidFences } from "./src/utils/remark-mermaid-fences.js";
import { remarkNormalizeCodeFences } from "./src/utils/remark-normalize-code-fences.js";
import { rehypeExternalLinks } from "./src/utils/rehype-external-links.js";
import { rehypePostEnhancements } from "./src/utils/rehype-post-enhancements.js";
import {
    rehypeProtectCodeCitations,
    rehypeRestoreCodeCitations,
} from "./src/utils/rehype-protect-code-citations.js";
import { rehypeSvgbob } from "./src/utils/rehype-svgbob.js";
import { remarkPostToc } from "./src/utils/remark-post-toc.js";
import { slugifyStr } from "./src/utils/slugify";
import { SITE } from "./src/config";

const BLOG_PATH = "src/data/blog";

const sitemapAlias = () => ({
    name: "sitemap-xml-alias",
    hooks: {
        "astro:build:done": async ({
            dir,
            logger,
        }: {
            dir: URL;
            logger: {
                info: (message: string) => void;
                warn: (message: string) => void;
            };
        }) => {
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

const copyBlogWwwDirs = () => ({
    name: "copy-blog-www-dirs",
    hooks: {
        "astro:build:done": async ({
            dir,
            logger,
        }: {
            dir: URL;
            logger: {
                info: (message: string) => void;
                warn: (message: string) => void;
            };
        }) => {
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

// https://astro.build/config
export default defineConfig({
    trailingSlash: "always",

    site: SITE.website,
    integrations: [mdx(), icon(), sitemap(), sitemapAlias(), copyBlogWwwDirs()],

    markdown: {
        remarkPlugins: [
            remarkNormalizeCodeFences,
            remarkMermaidFences,
            remarkDirective,
            remarkDirectives,
            remarkImageAttributes,
            remarkPostToc,
        ],
        rehypePlugins: [
            rehypeSvgbob,
            rehypeRaw,
            rehypeProtectCodeCitations,
            [
                rehypeCitation,
                {
                    path: process.cwd(),
                    bibliography: "src/data/bibliography/bibliography.bib",
                    csl: "src/data/blog/writing-papers-with-markdown/www/ieee.csl",
                    linkCitations: true,
                    showTooltips: true,
                },
            ],
            rehypeRestoreCodeCitations,
            [rehypeMermaid, {}],
            [rehypeExternalLinks, { site: SITE.website }],
            rehypePostEnhancements,
        ],
        syntaxHighlight: {
            type: "shiki",
            excludeLangs: ["render_svgbob", "svgbob"],
        },
        shikiConfig: {
            // For more themes, visit https://shiki.style/themes
            themes: { light: "min-light", dark: "night-owl" },
            defaultColor: false,
            wrap: false,
            transformers: [
                transformerFileName({ style: "v2", hideDot: false }),
                transformerNotationHighlight(),
                transformerNotationWordHighlight(),
                transformerNotationDiff({ matchAlgorithm: "v3" }),
            ],
        },
    },

    vite: {
        // eslint-disable-next-line
        // @ts-ignore
        // This will be fixed in Astro 6 with Vite 7 support
        // See: https://github.com/withastro/astro/issues/14030
        plugins: [tailwindcss()],
        optimizeDeps: {
            exclude: ["@resvg/resvg-js"],
        },
    },

    image: {
        responsiveStyles: true,
        layout: "constrained",
    },

    env: {
        schema: {
            PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
                access: "public",
                context: "client",
                optional: true,
            }),
        },
    },

    experimental: {
        preserveScriptOrder: true,
        fonts: [
            {
                name: "Google Sans Code",
                cssVariable: "--font-google-sans-code",
                provider: fontProviders.google(),
                fallbacks: ["monospace"],
                weights: [300, 400, 500, 600, 700],
                styles: ["normal", "italic"],
            },
        ],
    },
});
