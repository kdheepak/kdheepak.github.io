import { copyFile } from "node:fs/promises";
import { join } from "node:path";
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
import remarkToc from "remark-toc";
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
import { remarkPostToc } from "./src/utils/remark-post-toc.js";
import { rehypeExternalLinks } from "./src/utils/rehype-external-links.js";
import { rehypeSvgbob } from "./src/utils/rehype-svgbob.js";
import { SITE } from "./src/config";

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

// https://astro.build/config
export default defineConfig({
    trailingSlash: "always",

    site: SITE.website,
    integrations: [mdx(), icon(), sitemap(), sitemapAlias()],

    markdown: {
        remarkPlugins: [
            remarkNormalizeCodeFences,
            remarkMermaidFences,
            remarkDirective,
            remarkDirectives,
            remarkImageAttributes,
            remarkPostToc,
            remarkToc,
        ],
        rehypePlugins: [
            rehypeSvgbob,
            rehypeRaw,
            [
                rehypeCitation,
                {
                    path: process.cwd(),
                    bibliography: "src/data/bibliography/bibliography.bib",
                    csl: "src/data/blog/writing-papers-with-markdown/www/ieee.csl",
                    linkCitations: true,
                },
            ],
            [rehypeMermaid, {}],
            [rehypeExternalLinks, { site: SITE.website }],
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
