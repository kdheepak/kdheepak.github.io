import { visit } from "unist-util-visit";

const EXTERNAL_REL_TOKENS = ["noopener", "noreferrer"];

const toRelArray = relValue => {
  if (Array.isArray(relValue)) {
    return relValue
      .flatMap(value => String(value).split(/\s+/))
      .map(value => value.trim())
      .filter(Boolean);
  }

  if (typeof relValue === "string") {
    return relValue
      .split(/\s+/)
      .map(value => value.trim())
      .filter(Boolean);
  }

  return [];
};

const isExternalHttpLink = (href, siteOrigin) => {
  if (typeof href !== "string") return false;
  const trimmedHref = href.trim();
  if (!trimmedHref || trimmedHref.startsWith("#")) return false;

  const isAbsoluteHttp = /^(https?:)?\/\//i.test(trimmedHref);
  if (!isAbsoluteHttp) return false;

  let parsedUrl;
  try {
    parsedUrl = trimmedHref.startsWith("//")
      ? new URL(`https:${trimmedHref}`)
      : new URL(trimmedHref);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) return false;
  if (!siteOrigin) return true;

  return parsedUrl.origin !== siteOrigin;
};

export function rehypeExternalLinks(options = {}) {
  let siteOrigin = "";
  if (typeof options.site === "string" && options.site.trim().length > 0) {
    try {
      siteOrigin = new URL(options.site).origin;
    } catch {
      siteOrigin = "";
    }
  }

  return tree => {
    visit(tree, "element", node => {
      if (node.tagName !== "a" || typeof node.properties !== "object") return;

      const href = node.properties.href;
      if (!isExternalHttpLink(href, siteOrigin)) return;

      node.properties.target = "_blank";

      const relTokens = new Set(toRelArray(node.properties.rel));
      EXTERNAL_REL_TOKENS.forEach(token => relTokens.add(token));
      node.properties.rel = [...relTokens].join(" ");

      node.properties["data-external-link"] = "";
    });
  };
}
