const WORDS_PER_MINUTE = 200;

const FENCED_CODE_BLOCK_RE = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
const INLINE_CODE_RE = /`[^`\n]+`/g;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;
const HTML_TAG_RE = /<[^>]+>/g;
const IMAGE_RE = /!\[([^\]]*)\]\([^)]+\)/g;
const LINK_RE = /\[([^\]]+)\]\((?:\\.|[^)])+\)/g;
const REFERENCE_LINK_RE = /\[([^\]]+)\]\[[^\]]*\]/g;
const FOOTNOTE_REF_RE = /\[\^[^\]]+\]/g;
const CITATION_RE = /\[@[^\]]+\]/g;
const WORD_RE = /[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu;

const numberFormatter = new Intl.NumberFormat("en-US");

export type ReadingStats = {
  wordCount: number;
  minutes: number;
};

const sanitizeMarkdown = (raw = ""): string =>
  raw
    .replace(FENCED_CODE_BLOCK_RE, " ")
    .replace(INLINE_CODE_RE, " ")
    .replace(HTML_COMMENT_RE, " ")
    .replace(HTML_TAG_RE, " ")
    .replace(IMAGE_RE, "$1")
    .replace(LINK_RE, "$1")
    .replace(REFERENCE_LINK_RE, "$1")
    .replace(FOOTNOTE_REF_RE, " ")
    .replace(CITATION_RE, " ");

export const getReadingStats = (raw?: string): ReadingStats => {
  const text = sanitizeMarkdown(raw);
  const wordCount = text.match(WORD_RE)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  return { wordCount, minutes };
};

export const formatReadingStats = ({ wordCount, minutes }: ReadingStats) =>
  `${minutes} min read (${numberFormatter.format(wordCount)} ${
    wordCount === 1 ? "word" : "words"
  })`;
