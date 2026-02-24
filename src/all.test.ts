import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { formatReadingStats, getReadingStats } from "./utils/readingStats";
import { remarkInlineMark } from "./utils/remark-inline-mark.js";
import { remarkPostToc } from "./utils/remark-post-toc.js";
import { rehypePostEnhancements } from "./utils/rehype-post-enhancements.js";
import {
  rehypeProtectCodeCitations,
  rehypeRestoreCodeCitations,
} from "./utils/rehype-protect-code-citations.js";
import {
  getLatestCommitHash,
  getRepositoryHeadCommitHash,
} from "./utils/getLatestCommitHash";
import getPostsByGroupCondition from "./utils/getPostsByGroupCondition";
import getUniqueTags from "./utils/getUniqueTags";
import { slugifyAll, slugifyStr } from "./utils/slugify";

const layoutSource = readFileSync(
  resolve(process.cwd(), "src/layouts/Layout.astro"),
  "utf8"
);

const astroConfigSource = readFileSync(
  resolve(process.cwd(), "astro.config.ts"),
  "utf8"
);

const postDetailsSource = readFileSync(
  resolve(process.cwd(), "src/layouts/PostDetails.astro"),
  "utf8"
);

const footerSource = readFileSync(
  resolve(process.cwd(), "src/components/Footer.astro"),
  "utf8"
);

const makePost = (tags: string[], draft = false) => ({
  data: {
    draft,
    tags,
    pubDatetime: new Date("2024-01-01T00:00:00.000Z"),
  },
});

const applyInlineMark = (tree: Record<string, unknown>) => {
  const transform = remarkInlineMark();
  transform(tree as never);
};

const applyRemarkPostToc = (
  tree: Record<string, unknown>,
  {
    path = "/tmp/project/src/data/blog/example/index.md",
    toc = true,
  }: { path?: string; toc?: boolean } = {}
) => {
  const transform = remarkPostToc();
  transform(tree as never, {
    path,
    data: {
      astro: {
        frontmatter: { toc },
      },
    },
  } as never);
};

const applyProtect = (tree: Record<string, unknown>) => {
  const transform = rehypeProtectCodeCitations();
  transform(tree as never);
};

const applyRestore = (tree: Record<string, unknown>) => {
  const transform = rehypeRestoreCodeCitations();
  transform(tree as never);
};

const findFirstElement = (
  node: Record<string, unknown>,
  predicate: (candidate: Record<string, unknown>) => boolean
): Record<string, unknown> | null => {
  if (node.type === "element" && predicate(node)) {
    return node;
  }

  const children = Array.isArray(node.children)
    ? (node.children as Record<string, unknown>[])
    : [];
  for (const child of children) {
    const nested = findFirstElement(child, predicate);
    if (nested) return nested;
  }

  return null;
};

const applyEnhancements = (tree: any, path: string) => {
  const transform = rehypePostEnhancements();
  transform(tree, { path });
};

const hasClass = (node: any, className: string) => {
  const rawClassName = node?.properties?.className;
  if (Array.isArray(rawClassName)) {
    return rawClassName.includes(className);
  }

  if (typeof rawClassName === "string") {
    return rawClassName.split(/\s+/).includes(className);
  }

  return false;
};

const getNodeText = (node: any): string => {
  if (node?.type === "text" && typeof node.value === "string") {
    return node.value;
  }

  if (!Array.isArray(node?.children)) return "";
  return node.children.map((child: any) => getNodeText(child)).join("");
};

const findElements = (
  node: any,
  predicate: (candidate: any) => boolean,
  results: any[] = []
): any[] => {
  if (node?.type === "element" && predicate(node)) {
    results.push(node);
  }

  if (!Array.isArray(node?.children)) return results;
  for (const child of node.children) {
    findElements(child, predicate, results);
  }
  return results;
};

describe("KaTeX integration", () => {
  it("configures markdown math rendering through remark-math + rehype-katex", () => {
    expect(astroConfigSource).toContain('import remarkMath from "remark-math";');
    expect(astroConfigSource).toContain(
      'import rehypeKatex from "rehype-katex";'
    );
    expect(astroConfigSource).toContain("remarkMath,");
    expect(astroConfigSource).toContain(
      "[rehypeKatex, { throwOnError: false, strict: false }],"
    );
  });

  it("loads KaTeX styles in the layout and removes MathJax runtime scripts", () => {
    expect(layoutSource).toContain('import "katex/dist/katex.min.css";');
    expect(layoutSource).not.toContain("window.MathJax");
    expect(layoutSource).not.toContain("tex-mml-chtml.js");
    expect(layoutSource).not.toContain("enableMathJax");
  });

  it("does not rely on MathJax-only TOC resize events", () => {
    expect(postDetailsSource).not.toContain("kd:mathjax-typeset");
  });

  it("syncs TOC link markup from rendered headings so heading math appears in TOC", () => {
    expect(postDetailsSource).toContain("const getHeadingHtml = heading =>");
    expect(postDetailsSource).toContain("link.innerHTML = headingHtml;");
  });
});

describe("Footer timestamp", () => {
  it("keeps machine-readable ISO while rendering a standardized local timestamp", () => {
    expect(footerSource).toContain(
      'const buildTimestampLabel = buildIsoString.replace(/\\.\\d{3}Z$/, "Z");'
    );
    expect(footerSource).toContain("data-build-local-time");
    expect(footerSource).toContain("data-build-iso={buildIsoString}");
    expect(footerSource).toContain("datetime={buildIsoString}");
    expect(footerSource).toContain("{buildTimestampLabel}");
    expect(footerSource).toContain("const formatLocalTimestamp = (date: Date)");
    expect(footerSource).toContain(
      "return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;"
    );
    expect(footerSource).not.toContain(
      "Intl.DateTimeFormat().resolvedOptions().timeZone"
    );
    expect(footerSource).toContain(
      'document.addEventListener("astro:page-load", setBuildTimestamp);'
    );
  });

  it("links build timestamp to the repository tree and keeps copyright year plain", () => {
    expect(footerSource).toContain("const toTreeBaseUrl = (sourceUrl: string)");
    expect(footerSource).toContain('const buildTreeRef = latestCommitHash ?? "main";');
    expect(footerSource).toContain("const buildTreeHref =");
    expect(footerSource).toContain("href={buildTreeHref}");
    expect(footerSource).toContain("&#169; {currentYear}");
    expect(footerSource).not.toContain("latestCommitHref");
  });
});

describe("remarkInlineMark", () => {
  it("converts ==text== into a mark directive", () => {
    const tree: Record<string, unknown> = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "Before ==mark me== after" }],
        },
      ],
    };

    applyInlineMark(tree);

    expect(tree).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Before " },
            {
              type: "textDirective",
              name: "mark",
              attributes: {},
              children: [{ type: "text", value: "mark me" }],
            },
            { type: "text", value: " after" },
          ],
        },
      ],
    });
  });

  it("does not touch inline code or fenced code blocks", () => {
    const tree: Record<string, unknown> = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "inlineCode", value: "==no change==" },
            { type: "text", value: " and ==changed==" },
          ],
        },
        {
          type: "code",
          lang: "markdown",
          value: "==still no change==",
        },
      ],
    };

    applyInlineMark(tree);

    expect(tree).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "inlineCode", value: "==no change==" },
            { type: "text", value: " and " },
            {
              type: "textDirective",
              name: "mark",
              attributes: {},
              children: [{ type: "text", value: "changed" }],
            },
          ],
        },
        {
          type: "code",
          lang: "markdown",
          value: "==still no change==",
        },
      ],
    });
  });

  it("leaves unmatched markers unchanged", () => {
    const tree: Record<string, unknown> = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "No close ==marker here" }],
        },
      ],
    };

    applyInlineMark(tree);

    expect(tree).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "No close ==marker here" }],
        },
      ],
    });
  });
});

describe("remarkPostToc", () => {
  it("preserves inline math nodes inside generated TOC links", () => {
    const tree: Record<string, unknown> = {
      type: "root",
      children: [
        {
          type: "heading",
          depth: 2,
          children: [
            { type: "text", value: "Case 1: " },
            { type: "inlineMath", value: "\\theta" },
            { type: "text", value: " is zero" },
          ],
        },
      ],
    };

    applyRemarkPostToc(tree);

    const children = tree.children as Record<string, unknown>[];
    const tocList = children[1] as Record<string, unknown>;
    const tocLink = (
      ((tocList.children as Record<string, unknown>[])[0].children as Record<
        string,
        unknown
      >[])[0].children as Record<string, unknown>[]
    )[0];

    const linkChildren = tocLink.children as Record<string, unknown>[];
    expect(
      linkChildren.some(
        node => node.type === "inlineMath" && node.value === "\\theta"
      )
    ).toBe(true);
  });
});

describe("rehypeProtectCodeCitations / rehypeRestoreCodeCitations", () => {
  it("protects spans inside pre > code and restores them afterward", () => {
    const tree: Record<string, unknown> = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "code",
              properties: {},
              children: [
                {
                  type: "element",
                  tagName: "span",
                  properties: { className: ["token"] },
                  children: [{ type: "text", value: "[@citation]" }],
                },
              ],
            },
          ],
        },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "span",
              properties: {},
              children: [{ type: "text", value: "plain span" }],
            },
          ],
        },
      ],
    };

    applyProtect(tree);

    const protectedSpan = findFirstElement(
      tree,
      node => node.tagName === "kd-cite-skip-span"
    );
    expect(protectedSpan).not.toBeNull();
    expect(protectedSpan?.properties).toMatchObject({
      className: ["token"],
      "data-kd-cite-protected": "",
    });

    const paragraphSpan = findFirstElement(
      tree,
      node =>
        node.tagName === "span" &&
        Array.isArray(node.children) &&
        (node.children[0] as Record<string, unknown>)?.value === "plain span"
    );
    expect(paragraphSpan).not.toBeNull();

    applyRestore(tree);

    const restoredSpan = findFirstElement(
      tree,
      node =>
        node.tagName === "span" &&
        Array.isArray(node.children) &&
        (node.children[0] as Record<string, unknown>)?.value === "[@citation]"
    );
    expect(restoredSpan).not.toBeNull();
    expect(restoredSpan?.properties).toMatchObject({ className: ["token"] });
    expect(
      (restoredSpan?.properties as Record<string, unknown>)[
        "data-kd-cite-protected"
      ]
    ).toBeUndefined();
  });
});

describe("rehypePostEnhancements", () => {
  it("adds references/footnotes headings, links reference URLs, and appends TOC links", () => {
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "table-of-contents" },
          children: [{ type: "text", value: "Table of Contents" }],
        },
        {
          type: "element",
          tagName: "ul",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "li",
              properties: {},
              children: [
                {
                  type: "element",
                  tagName: "a",
                  properties: { href: "#intro" },
                  children: [{ type: "text", value: "Intro" }],
                },
              ],
            },
          ],
        },
        {
          type: "element",
          tagName: "h2",
          properties: { id: "intro" },
          children: [{ type: "text", value: "Intro" }],
        },
        {
          type: "element",
          tagName: "section",
          properties: { dataFootnotes: "" },
          children: [
            {
              type: "element",
              tagName: "ol",
              properties: {},
              children: [],
            },
          ],
        },
        {
          type: "element",
          tagName: "div",
          properties: { id: "refs", className: ["references", "csl-bib-body"] },
          children: [
            {
              type: "element",
              tagName: "div",
              properties: { className: ["csl-entry"] },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["csl-right-inline"] },
                  children: [
                    {
                      type: "text",
                      value: "Available: https://example.com/article).",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "text",
              value: "Outside URL should stay plain: https://outside.example.dev.",
            },
          ],
        },
      ],
    };

    applyEnhancements(tree, "/tmp/project/src/data/blog/example/index.md");

    const tocHeading = findElements(
      tree,
      node => node.tagName === "h2" && node.properties?.id === "table-of-contents"
    )[0];
    const tocList = tree.children[tree.children.indexOf(tocHeading) + 1];
    const tocLinks = findElements(tocList, node => node.tagName === "a").map(
      node => node.properties?.href
    );

    expect(tocLinks).toEqual(
      expect.arrayContaining(["#intro", "#footnotes", "#references"])
    );

    const footnotesHeading = findElements(
      tree,
      node => node.tagName === "h2" && node.properties?.id === "footnotes"
    )[0];
    expect(footnotesHeading).toBeDefined();
    expect(getNodeText(footnotesHeading)).toContain("Footnotes");

    const referencesHeading = findElements(
      tree,
      node => node.tagName === "h2" && node.properties?.id === "references"
    )[0];
    expect(referencesHeading).toBeDefined();
    expect(getNodeText(referencesHeading)).toContain("References");

    const cslInlineContainer = findElements(
      tree,
      node => node.tagName === "div" && hasClass(node, "csl-right-inline")
    )[0];
    const linkedReference = findElements(
      cslInlineContainer,
      node =>
        node.tagName === "a" &&
        node.properties?.href === "https://example.com/article"
    )[0];

    expect(linkedReference).toBeDefined();
    expect(linkedReference.properties).toMatchObject({
      target: "_blank",
      rel: ["noopener", "noreferrer"],
    });

    const textFragments = (cslInlineContainer.children as any[])
      .filter(node => node.type === "text")
      .map(node => node.value);
    expect(textFragments).toContain("Available: ");
    expect(textFragments).toContain(").");

    const outsideParagraph = findElements(tree, node => node.tagName === "p")[0];
    expect(outsideParagraph.children[0]).toEqual({
      type: "text",
      value: "Outside URL should stay plain: https://outside.example.dev.",
    });

    const introHeading = findElements(
      tree,
      node => node.tagName === "h2" && node.properties?.id === "intro"
    )[0];
    const introHeadingLink = findElements(
      introHeading,
      node => node.tagName === "a" && hasClass(node, "heading-link")
    );
    expect(introHeadingLink).toHaveLength(1);

    const tocHeadingLink = findElements(
      tocHeading,
      node => node.tagName === "a" && hasClass(node, "heading-link")
    );
    expect(tocHeadingLink).toHaveLength(0);
  });

  it("is a no-op for non-blog files", () => {
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "section",
          properties: { dataFootnotes: "" },
          children: [],
        },
      ],
    };

    const before = structuredClone(tree);
    applyEnhancements(tree, "/tmp/project/src/data/pages/page.md");

    expect(tree).toEqual(before);
  });

  it("does not append duplicate TOC links when a label already exists", () => {
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "table-of-contents" },
          children: [{ type: "text", value: "Table of Contents" }],
        },
        {
          type: "element",
          tagName: "ul",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "li",
              properties: {},
              children: [
                {
                  type: "element",
                  tagName: "a",
                  properties: { href: "#footnotes" },
                  children: [{ type: "text", value: "Footnotes" }],
                },
              ],
            },
          ],
        },
        {
          type: "element",
          tagName: "section",
          properties: { dataFootnotes: "" },
          children: [
            {
              type: "element",
              tagName: "h2",
              properties: { id: "footnote-label" },
              children: [{ type: "text", value: "Footnotes" }],
            },
            {
              type: "element",
              tagName: "ol",
              properties: {},
              children: [],
            },
          ],
        },
      ],
    };

    applyEnhancements(tree, "/tmp/project/src/data/blog/example/index.md");

    const tocList = tree.children[1];
    const tocLinks = findElements(tocList, node => node.tagName === "a").map(
      node => node.properties?.href
    );

    expect(tocLinks).toEqual(["#footnotes"]);
    expect(tocLinks).not.toContain("#footnote-label");
  });

  it("syncs TOC link content with rendered heading markup", () => {
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "table-of-contents" },
          children: [{ type: "text", value: "Table of Contents" }],
        },
        {
          type: "element",
          tagName: "ul",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "li",
              properties: {},
              children: [
                {
                  type: "element",
                  tagName: "a",
                  properties: { href: "#case-1-theta-is-zero" },
                  children: [{ type: "text", value: "Case 1 : \\theta is zero" }],
                },
              ],
            },
          ],
        },
        {
          type: "element",
          tagName: "h3",
          properties: { id: "case-1-theta-is-zero" },
          children: [
            { type: "text", value: "Case 1 : " },
            {
              type: "element",
              tagName: "span",
              properties: { className: ["katex"] },
              children: [{ type: "text", value: "θ" }],
            },
            { type: "text", value: " is zero" },
          ],
        },
      ],
    };

    applyEnhancements(tree, "/tmp/project/src/data/blog/example/index.md");

    const tocLink = findElements(
      tree,
      node =>
        node.tagName === "a" && node.properties?.href === "#case-1-theta-is-zero"
    )[0];

    expect(tocLink).toBeDefined();
    expect(
      (tocLink.children as any[]).some(
        child =>
          child.type === "element" &&
          child.tagName === "span" &&
          hasClass(child, "katex")
      )
    ).toBe(true);
    expect(getNodeText(tocLink)).toContain("Case 1 :");
    expect(getNodeText(tocLink)).toContain("is zero");
  });
});

describe("getReadingStats", () => {
  it("calculates reading time with 200 words per minute", () => {
    const body = Array.from({ length: 880 }, (_, index) => `word${index}`).join(
      " "
    );

    expect(getReadingStats(body)).toEqual({
      wordCount: 880,
      minutes: 5,
    });
  });

  it("ignores fenced code blocks and inline code", () => {
    const body = `
alpha beta
\`\`\`ts
const hidden = "this should not be counted";
\`\`\`
gamma \`delta\`
`;

    expect(getReadingStats(body)).toEqual({
      wordCount: 3,
      minutes: 1,
    });
  });
});

describe("formatReadingStats", () => {
  it("formats the expected label", () => {
    expect(formatReadingStats({ wordCount: 880, minutes: 5 })).toBe(
      "5 min read (880 words)"
    );
  });

  it("formats singular word count correctly", () => {
    expect(formatReadingStats({ wordCount: 1, minutes: 1 })).toBe(
      "1 min read (1 word)"
    );
  });
});

describe("slugify utilities", () => {
  it("slugifies latin text and preserves useful punctuation like dots", () => {
    expect(slugifyStr("TypeScript 5.0")).toBe("typescript-5.0");
  });

  it("preserves non-latin characters", () => {
    expect(slugifyStr("你好 世界")).toBe("你好-世界");
  });

  it("slugifies every item in the list", () => {
    expect(slugifyAll(["E2E Testing", "你好 世界"])).toEqual([
      "e2e-testing",
      "你好-世界",
    ]);
  });
});

describe("getPostsByGroupCondition", () => {
  it("groups posts by the provided grouping function", () => {
    const posts = [
      { id: "post-1", data: { tags: ["astro"] } },
      { id: "post-2", data: { tags: ["rust"] } },
      { id: "post-3", data: { tags: ["astro"] } },
    ];

    const grouped = getPostsByGroupCondition(
      posts as never,
      post => post.data.tags[0] ?? "untagged"
    );

    expect(Object.keys(grouped)).toEqual(["astro", "rust"]);
    expect(grouped.astro.map(post => post.id)).toEqual(["post-1", "post-3"]);
    expect(grouped.rust.map(post => post.id)).toEqual(["post-2"]);
  });
});

describe("getUniqueTags", () => {
  it("filters draft posts, deduplicates tags by slug, and sorts them", () => {
    const posts = [
      makePost(["Zeta", "Alpha"]),
      makePost(["alpha", "beta"]),
      makePost(["draft-only"], true),
    ];

    expect(getUniqueTags(posts as never)).toEqual([
      { tag: "alpha", tagName: "Alpha" },
      { tag: "beta", tagName: "beta" },
      { tag: "zeta", tagName: "Zeta" },
    ]);
  });
});

describe("getLatestCommitHash", () => {
  it("returns undefined for empty input", () => {
    expect(getLatestCommitHash(undefined)).toBeUndefined();
    expect(getLatestCommitHash("")).toBeUndefined();
    expect(getLatestCommitHash("   ")).toBeUndefined();
  });

  it("returns the latest commit hash for a tracked file and caches it", () => {
    const first = getLatestCommitHash("package.json");
    const second = getLatestCommitHash("package.json");

    expect(first).toMatch(/^[a-f0-9]{40}$/);
    expect(second).toBe(first);
  });
});

describe("getRepositoryHeadCommitHash", () => {
  it("returns a valid git commit hash", () => {
    expect(getRepositoryHeadCommitHash()).toMatch(/^[a-f0-9]{40}$/);
  });
});
