import { defineConfig, envField, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeCitation from "rehype-citation";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeMermaid from "rehype-mermaid";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import {
    transformerNotationDiff,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { remarkDirectives } from "./src/utils/remark-directives";
import { remarkImageAttributes } from "./src/utils/remark-image-attributes";
import { remarkInlineMark } from "./src/utils/remark-inline-mark";
import { remarkMermaidFences } from "./src/utils/remark-mermaid-fences";
import { remarkNormalizeCodeFences } from "./src/utils/remark-normalize-code-fences";
import { rehypeExternalLinks } from "./src/utils/rehype-external-links";
import { rehypePostEnhancements } from "./src/utils/rehype-post-enhancements";
import {
    rehypeProtectCodeCitations,
    rehypeRestoreCodeCitations,
} from "./src/utils/rehype-protect-code-citations";
import { rehypeSvgbob } from "./src/utils/rehype-svgbob";
import { remarkPostToc } from "./src/utils/remark-post-toc";
import { copyBlogWwwDirs, sitemapAlias } from "./src/utils/astro-build-hook-integrations";
import { SITE } from "./src/config";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
    trailingSlash: "always",

    site: SITE.website,
    integrations: [
        expressiveCode({
            themes: ["github-light", "github-dark"],
            useDarkModeMediaQuery: false,
            themeCssSelector: theme => `[data-theme='${theme.type}']`,
        }),
        mdx(),
        icon(),
        sitemap(),
        sitemapAlias(),
        copyBlogWwwDirs(),
    ],

    markdown: {
        remarkPlugins: [
            remarkMath,
            remarkNormalizeCodeFences,
            remarkMermaidFences,
            remarkDirective,
            remarkInlineMark,
            remarkDirectives,
            remarkImageAttributes,
            remarkPostToc,
        ],
        rehypePlugins: [
            rehypeSvgbob,
            rehypeRaw,
            [rehypeKatex, { throwOnError: false, strict: false }],
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
            themes: { light: "github-light", dark: "github-dark" },
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
