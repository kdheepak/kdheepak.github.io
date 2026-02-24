import { describe, expect, it } from "vitest";
import {
  getLatestCommitHash,
  getRepositoryHeadCommitHash,
} from "./getLatestCommitHash";
import getPostsByGroupCondition from "./getPostsByGroupCondition";
import getUniqueTags from "./getUniqueTags";
import { slugifyAll, slugifyStr } from "./slugify";

const makePost = (tags: string[], draft = false) => ({
  data: {
    draft,
    tags,
    pubDatetime: new Date("2024-01-01T00:00:00.000Z"),
  },
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
      { id: "post-1", data: { category: "astro" } },
      { id: "post-2", data: { category: "rust" } },
      { id: "post-3", data: { category: "astro" } },
    ];

    const grouped = getPostsByGroupCondition(
      posts as never,
      post => post.data.category
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
