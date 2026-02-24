import { describe, expect, it } from "vitest";
import { formatReadingStats, getReadingStats } from "./readingStats";

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
