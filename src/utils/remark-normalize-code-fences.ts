// @ts-nocheck
const LANGUAGE_ALIASES = {
  default: "plaintext",
  dot: "plaintext",
  render_svgbob: "svgbob",
  sourcecode: "plaintext",
  text: "plaintext",
  tikz: "tex",
  tmux: "bash",
  txt: "plaintext",
};

const IGNORED_CLASS_TOKENS = new Set([
  "cell-code",
  "code-annotation-code",
  "code-with-copy",
  "numberLines",
  "sourceCode",
]);

const normalizeLanguage = value => {
  if (!value || typeof value !== "string") return null;

  let normalized = value.trim();
  if (!normalized) return null;

  if (normalized.startsWith("{") && normalized.endsWith("}")) {
    normalized = normalized.slice(1, -1).trim();
  }

  if (normalized.startsWith(".")) {
    normalized = normalized.slice(1);
  }

  if (!normalized) return null;

  const lower = normalized.toLowerCase();
  return LANGUAGE_ALIASES[lower] ?? lower;
};

const extractLanguageFromFenceInfo = (lang, meta) => {
  const langText = typeof lang === "string" ? lang.trim() : "";
  const metaText = typeof meta === "string" ? meta.trim() : "";
  const fullInfo = [langText, metaText].filter(Boolean).join(" ").trim();

  if (!fullInfo.startsWith("{")) {
    return normalizeLanguage(langText);
  }

  const inner = fullInfo.replace(/^\{/, "").replace(/\}$/, "").trim();
  if (!inner) return null;

  const tokens = inner
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith(".")) {
      const cls = token.slice(1).replace(/[},]$/g, "");
      if (!cls || IGNORED_CLASS_TOKENS.has(cls)) continue;
      const normalized = normalizeLanguage(cls);
      if (normalized) return normalized;
      continue;
    }

    if (token.includes("=")) continue;

    const cleaned = token.replace(/[},]$/g, "");
    const normalized = normalizeLanguage(cleaned);
    if (normalized) return normalized;
  }

  return null;
};

const transformChildren = parent => {
  if (!parent || !Array.isArray(parent.children)) return;

  for (const child of parent.children) {
    if (child?.type === "code") {
      const normalized = extractLanguageFromFenceInfo(child.lang, child.meta);
      if (normalized) {
        child.lang = normalized;
      }
    }
    transformChildren(child);
  }
};

export function remarkNormalizeCodeFences() {
  return tree => {
    transformChildren(tree);
  };
}
