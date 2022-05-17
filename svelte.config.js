import preprocess from "svelte-preprocess";
import importAssets from "svelte-preprocess-import-assets";

import child_process from "child_process";
import path from "path";
import fs from "fs";
import matter from "gray-matter";

import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeMathjaxSvg from "rehype-mathjax";

import { h, s } from "hastscript";
import { visit } from "unist-util-visit";

import adapterStatic from "@sveltejs/adapter-static";
import adapterAuto from "@sveltejs/adapter-auto";

function _adapter(options) {
  const baseStatic = adapterStatic(options);
  const pages = options?.pages || "build";
  return {
    name: "svelte-adapter-static",
    async adapt(builder) {
      await baseStatic.adapt(builder);
    },
  };
}

const pathsBase = process.env.PATHS_BASE === undefined ? "" : process.env.PATHS_BASE;

const adapter = process.env.CLOUDFLARE === undefined ? _adapter : adapterAuto;

function pandoc(input, ...args) {
  const option = [
    "-t",
    "html",
    "--email-obfuscation",
    "javascript",
    "--shift-heading-level=0",
    "--no-highlight",
    "--section-divs",
    "--mathjax",
    "--filter",
    "pandoc-secnos",
    "--filter",
    "pandoc-eqnos",
    "--filter",
    "pandoc-fignos",
    "--filter",
    "pandoc-tablenos",
    "--citeproc",
    "--metadata",
    "link-citations=true",
    "--metadata",
    "notes-after-punctuation=false",
    "--metadata",
    "reference-section-title=References",
    "--lua-filter",
    "./pandoc/render.lua",
    "--lua-filter",
    "./pandoc/ref-section-level.lua",
    "--lua-filter",
    "./pandoc/links-target-blank.lua",
    "--lua-filter",
    "./pandoc/section-prefix.lua",
    "--lua-filter",
    "./pandoc/sidenote.lua",
    "--lua-filter",
    "./pandoc/standard-code.lua",
    "--lua-filter",
    "./pandoc/alert.lua",
    "--lua-filter",
    "./pandoc/fix-image-links.lua",
  ].concat(args);
  let pandoc;
  input = Buffer.from(input);
  try {
    pandoc = child_process.spawnSync("pandoc", option, { input, timeout: 20000 });
  } catch (err) {
    console.error(option, input, err);
  }
  if (pandoc.stderr && pandoc.stderr.length) {
    console.log(option, input, Error(pandoc.output[2].toString()));
  }
  var content = pandoc.stdout.toString();
  return content;
}

function escapeCurlies() {
  return function (tree) {
    visit(tree, "element", function (node) {
      if (
        node.tagName === "code" ||
        node.tagName === "math" ||
        (node.tagName == "span" &&
          node.properties["className"] !== undefined &&
          node.properties["className"].includes("math"))
      ) {
        findAndReplace(
          node,
          {
            "&": "&#38;",
            "{": "&#123;",
            "}": "&#125;",
            '"': "&#34;",
            "'": "&#39;",
            "<": "&#60;",
            ">": "&#62;",
            "`": "&#96;",
          },
          {
            ignore: ["title", "script", "style"],
          },
        );
      }
    });
  };
}

function pandocRemarkPreprocess() {
  return {
    markup: async ({ content, filename }) => {
      if (!path.extname(filename).startsWith(".md")) {
        return;
      }
      let c = pandoc(content);
      c = c.replaceAll(/<!--separator-->/g, " ");
      const markdown2svelte = unified()
        .use(rehypeParse, { fragment: true, emitParseErrors: true })
        .use(escapeCurlies)
        .use(rehypeStringify, { allowDangerousHtml: false });
      const result = await markdown2svelte().process(c);
      const html = result
        .toString()
        .replace(/&#x26;#34;/g, "&#34;")
        .replace(/&#x26;#38;/g, "&#38;")
        .replace(/&#x26;#123;/g, "&#123;")
        .replace(/&#x26;#125;/g, "&#125;")
        .replace(/&#x26;#34;/g, "&#34;")
        .replace(/&#x26;#39;/g, "&#39;")
        .replace(/&#x26;#60;/g, "&#60;")
        .replace(/&#x26;#62;/g, "&#62;")
        .replace(/&#x26;#96;/g, "&#96;");
      return {
        code: `${html}`,
        map: "",
      };
    },
  };
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".md"],

  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [pandocRemarkPreprocess(), preprocess(), importAssets()],

  kit: {
    adapter: adapter(),
    paths: {
      base: pathsBase,
    },
    prerender: {
      default: true,
      crawl: true,
      enabled: true,
    },
  },
};

export default config;
