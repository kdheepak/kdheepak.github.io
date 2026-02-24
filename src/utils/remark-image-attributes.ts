// @ts-nocheck
import { visit } from "unist-util-visit";

const dedupe = values => [...new Set(values.filter(Boolean))];

const mergeStyles = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return `${a};${b}`;
};

const toClassList = value => {
  if (Array.isArray(value)) return value.flatMap(toClassList);
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  return [];
};

const parseAttrs = raw => {
  const normalizedRaw = raw
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&ldquo;|&#8220;|&#x201c;/gi, "“")
    .replace(/&rdquo;|&#8221;|&#x201d;/gi, "”")
    .replace(/&lsquo;|&#8216;|&#x2018;/gi, "‘")
    .replace(/&rsquo;|&#8217;|&#x2019;/gi, "’");

  const result = {
    id: undefined,
    className: [],
    properties: {},
  };

  const readIdent = (text, start) => {
    let i = start;
    while (i < text.length && /[A-Za-z0-9_-]/.test(text[i])) i += 1;
    return [text.slice(start, i), i];
  };

  const readKey = (text, start) => {
    let i = start;
    while (i < text.length && /[A-Za-z0-9_:-]/.test(text[i])) i += 1;
    return [text.slice(start, i), i];
  };

  const readValue = (text, start) => {
    if (start >= text.length) return ["", start];
    const quote = text[start];
    const quotePairs = {
      '"': '"',
      "'": "'",
      "“": "”",
      "‘": "’",
    };
    const closingQuote = quotePairs[quote];
    if (closingQuote) {
      let i = start + 1;
      while (i < text.length) {
        if (text[i] === closingQuote && text[i - 1] !== "\\") break;
        i += 1;
      }
      const value = text.slice(start + 1, i);
      return [value, i < text.length ? i + 1 : i];
    }

    let i = start;
    while (i < text.length && !/\s/.test(text[i])) i += 1;
    return [text.slice(start, i), i];
  };

  let i = 0;
  while (i < normalizedRaw.length) {
    while (i < normalizedRaw.length && /\s/.test(normalizedRaw[i])) i += 1;
    if (i >= normalizedRaw.length) break;

    if (normalizedRaw[i] === ".") {
      const [className, next] = readIdent(normalizedRaw, i + 1);
      if (className) result.className.push(className);
      i = next;
      continue;
    }

    if (normalizedRaw[i] === "#") {
      const [id, next] = readIdent(normalizedRaw, i + 1);
      if (id) result.id = id;
      i = next;
      continue;
    }

    const [key, keyEnd] = readKey(normalizedRaw, i);
    if (!key) {
      i += 1;
      continue;
    }
    i = keyEnd;

    while (i < normalizedRaw.length && /\s/.test(normalizedRaw[i])) i += 1;
    let value = "true";
    if (normalizedRaw[i] === "=") {
      i += 1;
      while (i < normalizedRaw.length && /\s/.test(normalizedRaw[i])) i += 1;
      [value, i] = readValue(normalizedRaw, i);
    }

    if (key === "class" || key === "className") {
      result.className.push(...value.split(/\s+/).filter(Boolean));
      continue;
    }
    if (key === "id") {
      result.id = value;
      continue;
    }

    result.properties[key] = value;
  }

  result.className = dedupe(result.className);
  return result;
};

const serializeInlineNode = node => {
  if (!node) return null;
  if (node.type === "text" && typeof node.value === "string") return node.value;
  if (node.type === "inlineCode" && typeof node.value === "string") {
    return `\`${node.value}\``;
  }
  return null;
};

const extractAttrBlock = value => {
  let i = 0;
  while (i < value.length && /\s/.test(value[i])) i += 1;
  if (value[i] !== "{") return null;

  const start = i + 1;
  i = start;
  let quote = null;

  while (i < value.length) {
    const ch = value[i];
    if (quote) {
      if (ch === quote && value[i - 1] !== "\\") quote = null;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      i += 1;
      continue;
    }

    if (ch === "}") {
      return {
        attrs: value.slice(start, i),
        remainder: value.slice(i + 1),
      };
    }

    i += 1;
  }

  return null;
};

const applyAttrsToImage = (image, attrs) => {
  const existing =
    image.data?.hProperties && typeof image.data.hProperties === "object"
      ? { ...image.data.hProperties }
      : {};

  const className = [...toClassList(existing.className), ...attrs.className];
  if (className.length > 0) {
    existing.className = className;
  } else {
    delete existing.className;
  }

  if (attrs.id) existing.id = attrs.id;

  let alt = image.alt ?? "";
  const styleParts = [];
  let clickable = false;

  for (const [key, rawValue] of Object.entries(attrs.properties)) {
    const normalizedKey = key.toLowerCase().replace(/_/g, "-");
    const value = rawValue == null ? "" : String(rawValue);
    if (!value) continue;

    if (normalizedKey === "alt" || normalizedKey === "fig-alt") {
      alt = value;
      continue;
    }
    if (normalizedKey === "width") {
      styleParts.push(`width:${value}`);
      continue;
    }
    if (normalizedKey === "align" || normalizedKey.endsWith("-align")) {
      const align = value.toLowerCase();
      if (align === "center" || align === "left" || align === "right") {
        className.push(`image-align-${align}`);
      }
      continue;
    }
    if (normalizedKey === "clickable") {
      clickable = value.toLowerCase() === "true";
      continue;
    }

    existing[key] = value;
  }

  const uniqueClassName = dedupe(className);
  if (uniqueClassName.length > 0) {
    existing.className = uniqueClassName;
  } else {
    delete existing.className;
  }

  if (styleParts.length > 0) {
    existing.style = mergeStyles(
      typeof existing.style === "string" ? existing.style : "",
      styleParts.join(";"),
    );
  }

  image.alt = alt;
  image.data = {
    ...(image.data ?? {}),
    hProperties: existing,
  };

  return clickable;
};

export function remarkImageAttributes() {
  return tree => {
    visit(tree, node => {
      if (!node || !Array.isArray(node.children)) return;

      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        if (!child || child.type !== "image") continue;

        const attrStart = i + 1;
        if (attrStart >= node.children.length) continue;

        let raw = "";
        let end = attrStart;
        while (end < node.children.length) {
          const serialized = serializeInlineNode(node.children[end]);
          if (serialized == null) break;
          raw += serialized;
          end += 1;
          if (raw.includes("}")) break;
        }

        if (raw.length === 0) continue;
        const parsed = extractAttrBlock(raw);
        if (!parsed) continue;

        const attrs = parseAttrs(parsed.attrs);
        const clickable = applyAttrsToImage(child, attrs);

        const replacement =
          parsed.remainder.length > 0 ? [{ type: "text", value: parsed.remainder }] : [];
        node.children.splice(attrStart, end - attrStart, ...replacement);

        if (clickable && node.type !== "link") {
          node.children[i] = {
            type: "link",
            url: child.url,
            title: null,
            data: {
              hProperties: {
                className: ["image-link"],
              },
            },
            children: [child],
          };
        }
      }
    });
  };
}
