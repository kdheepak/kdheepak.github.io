// @ts-nocheck
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { visit } from "unist-util-visit";

const CALLOUT_LABELS = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  caution: "Caution",
  warning: "Warning",
  error: "Error",
  info: "Info",
  success: "Success",
  hint: "Hint",
  todo: "Todo",
  exercise: "Exercise",
};

const CALLOUT_ICONS = {
  warning: "❓",
  error: "❗",
  info: "ℹ",
  success: "✓",
  hint: "🔎",
  todo: "🚧",
  tip: "💡",
  note: "📝",
  exercise: "🥋",
};

const CALLOUT_STYLE_OVERRIDES = {
  error: "warning",
  info: "important",
  success: "tip",
  hint: "note",
  todo: "caution",
  exercise: "important",
};

const CALLOUT_TYPES = new Set(Object.keys(CALLOUT_LABELS));
const CALLOUT_TOKENS = [...CALLOUT_TYPES];
const RAW_DIRECTIVE_OPEN_REGEX = /^\s*:::\s*([a-z][a-z0-9-]*)\b[ \t]*/i;
const CALLOUT_NAME_REGEX = new RegExp(
  `^callout-(${CALLOUT_TOKENS.join("|")})$`,
  "i",
);

const BLOCK_TAGS = new Set([
  "article",
  "aside",
  "blockquote",
  "div",
  "figcaption",
  "figure",
  "footer",
  "header",
  "main",
  "nav",
  "section",
]);

const INLINE_TAGS = new Set([
  "abbr",
  "b",
  "cite",
  "code",
  "em",
  "i",
  "mark",
  "small",
  "span",
  "strong",
]);

const IMAGE_ALIGN_STYLES = {
  center: "display:block;margin-left:auto;margin-right:auto",
  left: "display:block;margin-right:auto",
  right: "display:block;margin-left:auto",
};

const normalizeDirectiveAttributes = (attributes = {}) => {
  const properties = { ...attributes };
  const className = [];

  const collectClasses = value => {
    if (typeof value !== "string") return;
    for (const token of value.split(/\s+/)) {
      if (!token) continue;
      className.push(token);
    }
  };

  collectClasses(properties.class);
  collectClasses(properties.className);
  delete properties.class;
  delete properties.className;

  let id;
  if (typeof properties.id === "string" && properties.id.length > 0) {
    id = properties.id;
  }
  delete properties.id;

  return {
    id,
    className,
    properties,
  };
};

const dedupe = values => [...new Set(values.filter(Boolean))];

const mergeStyles = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return `${a};${b}`;
};

const normalizeOutputValue = value => {
  if (Array.isArray(value)) return value.join("");
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const parseCellSelection = (rawCells, totalCells) => {
  if (!Number.isInteger(totalCells) || totalCells <= 0) return [];

  if (typeof rawCells !== "string" || rawCells.trim().length === 0) {
    return Array.from({ length: totalCells }, (_, i) => i);
  }

  const selected = [];
  let usesZeroBased = false;

  for (const token of rawCells.split(",")) {
    const part = token.trim();
    if (!part) continue;

    if (part.includes("-")) {
      const [rawStart, rawEnd] = part.split("-").map(value => value.trim());
      const start = Number.parseInt(rawStart, 10);
      const end = Number.parseInt(rawEnd, 10);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      if (start === 0 || end === 0) usesZeroBased = true;

      const from = Math.min(start, end);
      const to = Math.max(start, end);
      for (let i = from; i <= to; i += 1) {
        selected.push(i);
      }
      continue;
    }

    const index = Number.parseInt(part, 10);
    if (!Number.isFinite(index)) continue;
    if (index === 0) usesZeroBased = true;
    selected.push(index);
  }

  if (selected.length === 0) return [];

  const indices = usesZeroBased
    ? selected
    : selected.map(index => index - 1);

  return dedupe(
    indices.filter(index => Number.isInteger(index) && index >= 0 && index < totalCells),
  );
};

const parseNotebookDataFromDirective = (node, filePath, notebookFile) => {
  const notebookDataJson = node?.data?.hProperties?.notebookDataJson;
  if (typeof notebookDataJson === "string" && notebookDataJson.length > 0) {
    return JSON.parse(notebookDataJson);
  }

  if (typeof notebookFile !== "string" || notebookFile.length === 0) {
    return null;
  }

  const baseDir = typeof filePath === "string" ? dirname(filePath) : process.cwd();
  const notebookPath = resolve(baseDir, notebookFile);
  return JSON.parse(readFileSync(notebookPath, "utf-8"));
};

const notebookDirectiveToNodes = (node, file) => {
  if (!node || (node.type !== "containerDirective" && node.type !== "leafDirective")) {
    return null;
  }

  if (node.name !== "notebook") return null;

  const attrs = normalizeDirectiveAttributes(node.attributes);
  const notebookFile =
    typeof attrs.properties.file === "string" ? attrs.properties.file : "";

  let notebookData;
  try {
    notebookData = parseNotebookDataFromDirective(node, file?.path, notebookFile);
  } catch (error) {
    return [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: `Notebook directive failed to load "${notebookFile}": ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      },
    ];
  }

  if (!notebookData || !Array.isArray(notebookData.cells)) {
    return [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Notebook directive did not resolve a valid notebook.",
          },
        ],
      },
    ];
  }

  const cellSpec =
    typeof attrs.properties.cells === "string"
      ? attrs.properties.cells
      : typeof attrs.properties.cell === "string"
        ? attrs.properties.cell
        : "";

  const selectedCellIndices = parseCellSelection(cellSpec, notebookData.cells.length);
  const cellOutputs = [];

  for (const cellIndex of selectedCellIndices) {
    const cell = notebookData.cells[cellIndex];
    if (!cell || cell.cell_type !== "code" || !Array.isArray(cell.outputs)) continue;

    for (const output of cell.outputs) {
      const data = output?.data;
      if (!data || typeof data !== "object") continue;

      const htmlOutput = normalizeOutputValue(data["text/html"]);
      if (htmlOutput) {
        cellOutputs.push(htmlOutput);
      }

      const jsOutput =
        normalizeOutputValue(data["application/javascript"]) ||
        normalizeOutputValue(data["application/vnd.holoviews_load.v0+json"]);
      if (jsOutput) {
        cellOutputs.push(`<script type="application/javascript">\n${jsOutput}\n</script>`);
      }
    }
  }

  if (cellOutputs.length === 0) {
    return [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "No HTML/JavaScript output found for the selected notebook cell(s).",
          },
        ],
      },
    ];
  }

  const replacement = [];
  if (node.type === "containerDirective" && Array.isArray(node.children)) {
    replacement.push(...node.children);
  }
  replacement.push({
    type: "html",
    value: cellOutputs.join("\n\n"),
  });

  return replacement;
};

const parseCalloutDirective = name => {
  if (!name || typeof name !== "string") return null;
  const lower = name.toLowerCase();
  if (CALLOUT_TYPES.has(lower)) {
    return {
      type: lower,
      variant: "legacy",
    };
  }

  const match = lower.match(CALLOUT_NAME_REGEX);
  if (!match) return null;
  return {
    type: match[1],
    variant: "quarto",
  };
};

const toText = node => {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(toText).join("");
};

const findFirstTextIndex = children =>
  children.findIndex(child => child && child.type === "text");

const findLastTextIndex = children => {
  for (let i = children.length - 1; i >= 0; i -= 1) {
    if (children[i] && children[i].type === "text") return i;
  }
  return -1;
};

const parseRawCalloutOpen = text => {
  if (typeof text !== "string") return null;
  const match = text.match(RAW_DIRECTIVE_OPEN_REGEX);
  if (!match) return null;

  const rawDirectiveName = match[1].toLowerCase();
  const isLegacyCallout = CALLOUT_TYPES.has(rawDirectiveName);
  const isQuartoCallout = CALLOUT_NAME_REGEX.test(rawDirectiveName);
  const isCalloutContainer = rawDirectiveName === "callout";

  if (!isLegacyCallout && !isQuartoCallout && !isCalloutContainer) {
    return null;
  }

  return {
    matchedText: match[0],
    directiveName: rawDirectiveName,
  };
};

const hasClassName = (node, className) => {
  const values = node?.data?.hProperties?.className;
  if (Array.isArray(values)) return values.includes(className);
  if (typeof values === "string") return values.split(/\s+/).includes(className);
  return false;
};

const prependIconToFirstParagraph = (children, icon) => {
  if (!icon || !Array.isArray(children) || children.length === 0) return children;

  const nextChildren = [...children];
  const paragraph = nextChildren.find(
    child => child && child.type === "paragraph" && Array.isArray(child.children),
  );

  if (!paragraph) {
    return [
      {
        type: "paragraph",
        children: [{ type: "text", value: `${icon} ` }],
      },
      ...nextChildren,
    ];
  }

  const firstText = paragraph.children.find(
    child => child && child.type === "text" && typeof child.value === "string",
  );
  if (firstText && firstText.value.trimStart().startsWith(icon)) {
    return nextChildren;
  }

  paragraph.children = [{ type: "text", value: `${icon} ` }, ...paragraph.children];
  return nextChildren;
};

const legacyCalloutDirectiveToBlocks = node => {
  const calloutDirective = parseCalloutDirective(node?.name);
  if (!calloutDirective || calloutDirective.variant !== "legacy") {
    return null;
  }

  const attrs = normalizeDirectiveAttributes(node.attributes);
  if (
    attrs.id ||
    attrs.className.length > 0 ||
    Object.keys(attrs.properties).length > 0
  ) {
    return null;
  }

  const icon = CALLOUT_ICONS[calloutDirective.type] ?? null;
  const blocks = prependIconToFirstParagraph(node.children ?? [], icon);
  if (blocks.length > 0) return blocks;

  return [
    {
      type: "paragraph",
      children: icon
        ? [{ type: "text", value: `${icon} ` }]
        : [{ type: "text", value: "" }],
    },
  ];
};

const stripRawCalloutFenceFromParagraph = node => {
  if (!node || node.type !== "paragraph" || !Array.isArray(node.children)) {
    return null;
  }

  const children = node.children.map(child =>
    child && child.type === "text" ? { ...child } : child,
  );

  const firstTextIndex = findFirstTextIndex(children);
  const lastTextIndex = findLastTextIndex(children);

  if (firstTextIndex < 0 || lastTextIndex < 0) return null;

  const firstTextNode = children[firstTextIndex];
  if (!firstTextNode || typeof firstTextNode.value !== "string") return null;

  const rawCalloutOpen = parseRawCalloutOpen(firstTextNode.value);
  if (!rawCalloutOpen) return null;

  firstTextNode.value = firstTextNode.value.slice(rawCalloutOpen.matchedText.length);
  firstTextNode.value = firstTextNode.value.replace(/^\r?\n/, "");

  const lastTextNode = children[lastTextIndex];
  if (!lastTextNode || typeof lastTextNode.value !== "string") return null;

  const withoutCloseFence = lastTextNode.value.replace(/(?:\r?\n)?\s*:::\s*$/, "");
  if (withoutCloseFence === lastTextNode.value) return null;
  lastTextNode.value = withoutCloseFence;

  while (
    children.length > 0 &&
    children[0]?.type === "text" &&
    typeof children[0].value === "string" &&
    children[0].value.trim().length === 0
  ) {
    children.shift();
  }

  while (
    children.length > 0 &&
    children[children.length - 1]?.type === "text" &&
    typeof children[children.length - 1].value === "string" &&
    children[children.length - 1].value.trim().length === 0
  ) {
    children.pop();
  }

  const bodyChildren = children.length > 0 ? children : [{ type: "text", value: "" }];

  const directiveNode = {
    type: "containerDirective",
    name: rawCalloutOpen.directiveName,
    attributes: {},
    children: [
      {
        type: "paragraph",
        children: bodyChildren,
      },
    ],
  };

  return directiveNode;
};

const stripRawCalloutOpenFromParagraph = node => {
  if (!node || node.type !== "paragraph" || !Array.isArray(node.children)) {
    return null;
  }

  const children = node.children.map(child =>
    child && child.type === "text" ? { ...child } : child,
  );

  const firstTextIndex = findFirstTextIndex(children);
  if (firstTextIndex < 0) return null;

  const firstTextNode = children[firstTextIndex];
  if (!firstTextNode || typeof firstTextNode.value !== "string") return null;

  const rawCalloutOpen = parseRawCalloutOpen(firstTextNode.value);
  if (!rawCalloutOpen) return null;

  firstTextNode.value = firstTextNode.value.slice(rawCalloutOpen.matchedText.length);
  firstTextNode.value = firstTextNode.value.replace(/^\r?\n/, "");

  while (
    children.length > 0 &&
    children[0]?.type === "text" &&
    typeof children[0].value === "string" &&
    children[0].value.trim().length === 0
  ) {
    children.shift();
  }

  return {
    directiveName: rawCalloutOpen.directiveName,
    paragraph: { ...node, children },
  };
};

const isRawCalloutCloseParagraph = node =>
  node && node.type === "paragraph" && toText(node).trim() === ":::";

const isRawCalloutOpenOnlyParagraph = node =>
  node &&
  node.type === "paragraph" &&
  typeof toText(node) === "string" &&
  toText(node).trim().toLowerCase() === "::: callout";

const paragraphHasVisibleContent = node =>
  node &&
  node.type === "paragraph" &&
  Array.isArray(node.children) &&
  toText(node).trim().length > 0;

const unwrapLegacyCalloutChildren = tree => {
  visit(tree, node => {
    if (!node || !Array.isArray(node.children) || !hasClassName(node, "callout")) {
      return;
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (!child || child.type !== "containerDirective") continue;

      const calloutDirective = parseCalloutDirective(child.name);
      if (!calloutDirective || calloutDirective.variant !== "legacy") continue;

      const hName = child?.data?.hName;
      const hProperties = child?.data?.hProperties ?? {};
      if (hName !== "div" || Object.keys(hProperties).length > 0) continue;

      const replacement =
        Array.isArray(child.children) && child.children.length > 0
          ? child.children
          : [{ type: "paragraph", children: [{ type: "text", value: "" }] }];

      node.children.splice(i, 1, ...replacement);
      i += replacement.length - 1;
    }
  });
};

const toHastData = (node, hName, hProperties) => {
  node.data = {
    ...(node.data ?? {}),
    hName,
    hProperties,
  };
};

const applyImageAttrs = (attrs, altText) => {
  const props = {};

  if (attrs.id) props.id = attrs.id;
  if (attrs.className.length > 0) props.className = dedupe(attrs.className);

  let alt = altText;
  const styleParts = [];

  for (const [key, rawValue] of Object.entries(attrs.properties)) {
    const value = rawValue == null ? "" : String(rawValue);
    if (!value) continue;

    if (key === "src") continue;
    if (key === "alt" || key === "fig-alt") {
      alt = value;
      continue;
    }
    if (key === "width") {
      styleParts.push(`width:${value}`);
      continue;
    }
    if (key === "align" || key === "fig-align") {
      const alignStyle = IMAGE_ALIGN_STYLES[value.toLowerCase()];
      if (alignStyle) styleParts.push(alignStyle);
      continue;
    }
    if (key === "clickable") continue;

    props[key] = value;
  }

  if (styleParts.length > 0) {
    props.style = mergeStyles(props.style, styleParts.join(";"));
  }

  return { props, alt };
};

const directiveContainerToElement = node => {
  const attrs = normalizeDirectiveAttributes(node.attributes);
  const calloutDirective = parseCalloutDirective(node.name);

  if (calloutDirective) {
    const { type: calloutType, variant } = calloutDirective;
    const icon = CALLOUT_ICONS[calloutType] ?? null;
    const renderAsCalloutAside = variant === "quarto";

    if (variant === "legacy" && !renderAsCalloutAside) {
      node.children = prependIconToFirstParagraph(node.children ?? [], icon);

      const hProperties = { ...attrs.properties };
      if (attrs.id) hProperties.id = attrs.id;
      if (attrs.className.length > 0) hProperties.className = dedupe(attrs.className);

      toHastData(node, "div", hProperties);
      return;
    }

    const styledCalloutType = CALLOUT_STYLE_OVERRIDES[calloutType] ?? calloutType;
    const className = dedupe([
      "callout",
      `callout-${styledCalloutType}`,
      variant === "legacy" ? "callout-legacy" : "",
      styledCalloutType !== calloutType ? `callout-${calloutType}` : "",
      ...attrs.className,
    ]);
    const label = CALLOUT_LABELS[calloutType] ?? "Note";
    const hProperties = {
      ...attrs.properties,
      className,
      "data-callout": calloutType,
      "data-callout-style": styledCalloutType,
      "data-callout-variant": variant,
    };
    if (attrs.id) hProperties.id = attrs.id;

    if (variant === "legacy") {
      node.children = prependIconToFirstParagraph(node.children ?? [], icon);
    } else {
      node.children = [
        {
          type: "paragraph",
          data: {
            hName: "p",
            hProperties: {
              className: ["callout-title"],
            },
          },
          children: [
            {
              type: "text",
              value: label,
            },
          ],
        },
        ...(node.children ?? []),
      ];
    }
    toHastData(node, "aside", hProperties);
    return;
  }

  let hName = "div";
  if (node.name === "div") {
    hName = "div";
  } else if (node.name && BLOCK_TAGS.has(node.name)) {
    hName = node.name;
  }

  const className =
    hName === "div" && node.name && node.name !== "div"
      ? dedupe([node.name, ...attrs.className])
      : dedupe(attrs.className);

  const hProperties = { ...attrs.properties };
  if (attrs.id) hProperties.id = attrs.id;
  if (className.length > 0) hProperties.className = className;

  toHastData(node, hName, hProperties);
};

const directiveLeafOrTextToElement = (node, index, parent) => {
  if (typeof index !== "number" || !parent || !Array.isArray(parent.children)) {
    return;
  }

  const attrs = normalizeDirectiveAttributes(node.attributes);

  if (node.name === "img") {
    const src = attrs.properties.src;
    if (typeof src !== "string" || src.length === 0) return;

    const clickable =
      String(attrs.properties.clickable ?? "").toLowerCase() === "true";
    const { props, alt } = applyImageAttrs(attrs, toText(node));

    const imageNode = {
      type: "image",
      url: src,
      title: null,
      alt,
      data: {
        hProperties: props,
      },
    };

    if (clickable) {
      parent.children[index] = {
        type: "link",
        url: src,
        title: null,
        data: {
          hProperties: {
            className: ["image-link"],
          },
        },
        children: [imageNode],
      };
      return;
    }

    parent.children[index] = imageNode;
    return;
  }

  let hName = "span";
  if (node.name && INLINE_TAGS.has(node.name)) {
    hName = node.name;
  }

  const className =
    hName === "span" && node.name && node.name !== "span"
      ? dedupe([node.name, ...attrs.className])
      : dedupe(attrs.className);

  const hProperties = { ...attrs.properties };
  if (attrs.id) hProperties.id = attrs.id;
  if (className.length > 0) hProperties.className = className;

  toHastData(node, hName, hProperties);
};

export function remarkDirectives() {
  return (tree, file) => {
    visit(tree, (node, index, parent) => {
      if (!node || typeof node.type !== "string") return;

      if (
        (node.type === "containerDirective" || node.type === "leafDirective") &&
        typeof index === "number" &&
        parent &&
        Array.isArray(parent.children)
      ) {
        const notebookNodes = notebookDirectiveToNodes(node, file);
        if (notebookNodes) {
          parent.children.splice(index, 1, ...notebookNodes);
          return index;
        }
      }

      if (node.type === "containerDirective") {
        const legacyBlocks = legacyCalloutDirectiveToBlocks(node);
        if (
          legacyBlocks &&
          typeof index === "number" &&
          parent &&
          Array.isArray(parent.children)
        ) {
          parent.children.splice(index, 1, ...legacyBlocks);
          return index;
        }

        directiveContainerToElement(node);
        return;
      }

      if (node.type === "leafDirective" || node.type === "textDirective") {
        directiveLeafOrTextToElement(node, index, parent);
        return;
      }

      if (
        node.type === "paragraph" &&
        typeof index === "number" &&
        parent &&
        Array.isArray(parent.children)
      ) {
        if (isRawCalloutCloseParagraph(node)) {
          const previous = parent.children[index - 1];
          const previousIsCallout =
            (previous?.type === "containerDirective" &&
              (previous.name === "callout" || Boolean(parseCalloutDirective(previous.name)))) ||
            hasClassName(previous, "callout");
          if (previousIsCallout) {
            parent.children.splice(index, 1);
            return;
          }
        }

        if (isRawCalloutOpenOnlyParagraph(node)) {
          const next = parent.children[index + 1];
          const nextIsCallout =
            (next?.type === "containerDirective" &&
              (next.name === "callout" || Boolean(parseCalloutDirective(next.name)))) ||
            hasClassName(next, "callout");
          if (nextIsCallout) {
            parent.children.splice(index, 1);
            return index;
          }
        }

        const fallbackDirective = stripRawCalloutFenceFromParagraph(node);
        if (fallbackDirective) {
          const legacyBlocks = legacyCalloutDirectiveToBlocks(fallbackDirective);
          if (legacyBlocks) {
            parent.children.splice(index, 1, ...legacyBlocks);
            return index;
          }

          directiveContainerToElement(fallbackDirective);
          parent.children[index] = fallbackDirective;
          return index;
        }

        const fallbackOpen = stripRawCalloutOpenFromParagraph(node);
        if (!fallbackOpen) return;

        let closeIndex = -1;
        let nestedDepth = 0;
        const bodyChildren = [];

        if (paragraphHasVisibleContent(fallbackOpen.paragraph)) {
          bodyChildren.push(fallbackOpen.paragraph);
        }

        for (let i = index + 1; i < parent.children.length; i += 1) {
          const sibling = parent.children[i];

          const nestedOpen =
            sibling && sibling.type === "paragraph"
              ? stripRawCalloutOpenFromParagraph(sibling)
              : null;
          if (nestedOpen) {
            nestedDepth += 1;
            bodyChildren.push(sibling);
            continue;
          }

          if (isRawCalloutCloseParagraph(sibling)) {
            if (nestedDepth === 0) {
              closeIndex = i;
              break;
            }
            nestedDepth -= 1;
            bodyChildren.push(sibling);
            continue;
          }
          bodyChildren.push(sibling);
        }

        if (closeIndex < 0) return;

        const directiveNode = {
          type: "containerDirective",
          name: fallbackOpen.directiveName,
          attributes: {},
          children:
            bodyChildren.length > 0
              ? bodyChildren
              : [{ type: "paragraph", children: [{ type: "text", value: "" }] }],
        };

        const legacyBlocks = legacyCalloutDirectiveToBlocks(directiveNode);
        if (legacyBlocks) {
          parent.children.splice(index, closeIndex - index + 1, ...legacyBlocks);
          return index;
        }

        directiveContainerToElement(directiveNode);
        parent.children.splice(index, closeIndex - index + 1, directiveNode);
        return index;
      }
    });

    unwrapLegacyCalloutChildren(tree);

    // Remove unmatched raw close fences left behind after directive normalization.
    visit(tree, (node, index, parent) => {
      if (
        node &&
        node.type === "paragraph" &&
        typeof index === "number" &&
        parent &&
        Array.isArray(parent.children) &&
        isRawCalloutCloseParagraph(node)
      ) {
        parent.children.splice(index, 1);
        return index;
      }
    });
  };
}
