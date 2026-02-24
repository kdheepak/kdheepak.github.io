import slugify from "slugify";

type CitationInput = {
  author: string;
  title: string;
  url: string;
  pubDatetime: Date;
  slug: string;
  lang?: string;
  timeZone?: string;
};

const getDateParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find(part => part.type === "year")?.value ?? "0000";
  const month = parts.find(part => part.type === "month")?.value ?? "01";
  const day = parts.find(part => part.type === "day")?.value ?? "01";

  return { year, month, day };
};

const normalizeKeyPart = (value: string, fallback: string) => {
  const normalized = slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

  const compact = normalized.replaceAll("-", "");
  return compact || fallback;
};

const getPrimaryFamilyName = (author: string) => {
  const firstAuthor = author.split(/\s+and\s+/i)[0]?.trim() ?? "";
  if (!firstAuthor) return "author";

  if (firstAuthor.includes(",")) {
    const family = firstAuthor.split(",")[0]?.trim() ?? "";
    return family || "author";
  }

  const nameParts = firstAuthor.split(/\s+/).filter(Boolean);
  return nameParts.at(-1) ?? "author";
};

const escapeBibtexValue = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}");

export const createBibtexKey = (
  author: string,
  pubDatetime: Date,
  slug: string,
  timeZone = "UTC"
) => {
  const familyName = normalizeKeyPart(getPrimaryFamilyName(author), "author");
  const postSlug = normalizeKeyPart(slug, "post");
  const { year } = getDateParts(pubDatetime, timeZone);
  return `${familyName}${year}${postSlug}`;
};

export const formatLongCitationDate = (
  pubDatetime: Date,
  timeZone = "UTC"
) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(pubDatetime);

export const buildBibtexCitation = ({
  author,
  title,
  url,
  pubDatetime,
  slug,
  lang = "en",
  timeZone = "UTC",
}: CitationInput) => {
  const key = createBibtexKey(author, pubDatetime, slug, timeZone);
  const { year, month, day } = getDateParts(pubDatetime, timeZone);
  const isoDate = `${year}-${month}-${day}`;

  return [
    `@online{${key},`,
    `  author = {${escapeBibtexValue(author)}},`,
    `  title = {${escapeBibtexValue(title)}},`,
    `  year = {${year}},`,
    `  date = {${isoDate}},`,
    `  url = {${escapeBibtexValue(url)}},`,
    `  langid = {${escapeBibtexValue(lang)}},`,
    `}`,
  ].join("\n");
};

export const buildHumanCitation = ({
  author,
  title,
  url,
  pubDatetime,
  timeZone = "UTC",
}: Omit<CitationInput, "slug">) => {
  const fullDate = formatLongCitationDate(pubDatetime, timeZone);
  return `${author}, "${title}", ${fullDate} ${url}.`;
};
