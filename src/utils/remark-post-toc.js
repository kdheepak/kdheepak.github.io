import { visit } from "unist-util-visit";
import slugify from "slugify";

const TOC_HEADING_TEXT = "Table of contents";
const TOC_HEADING_ID = "table-of-contents";
const TOC_HEADING_PATTERN = /^table[\s-]*of[\s-]*contents?$/i;
const BLOG_PATH_FRAGMENT = "/src/data/blog/";

const getNodeText = node => {
  if (!node || typeof node !== "object") return "";
  if (typeof node.value === "string") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(getNodeText).join("");
};

const isTocEnabled = file =>
  file?.data?.astro?.frontmatter?.toc !== false;

const isBlogPostFile = filePath =>
  typeof filePath === "string" &&
  filePath.replaceAll("\\", "/").includes(BLOG_PATH_FRAGMENT);

const isHeadingNode = node => node?.type === "heading";

const isTocHeadingNode = node =>
  isHeadingNode(node) &&
  TOC_HEADING_PATTERN.test(getNodeText(node).trim());

const getInsertionIndex = nodes => {
  let index = 0;

  while (
    index < nodes.length &&
    ["yaml", "toml", "mdxjsEsm"].includes(nodes[index]?.type)
  ) {
    index += 1;
  }

  if (nodes[index]?.type === "heading" && nodes[index].depth === 1) {
    index += 1;
  }

  return index;
};

const ensureNodeData = node => {
  if (!node.data || typeof node.data !== "object") {
    node.data = {};
  }

  if (!node.data.hProperties || typeof node.data.hProperties !== "object") {
    node.data.hProperties = {};
  }

  return node.data.hProperties;
};

const getHeadingId = node => {
  const properties = node?.data?.hProperties;
  return typeof properties?.id === "string" ? properties.id : "";
};

const setHeadingId = (node, id) => {
  const properties = ensureNodeData(node);
  properties.id = id;
};

const createTocHeadingNode = () => {
  const heading = {
    type: "heading",
    depth: 2,
    children: [{ type: "text", value: TOC_HEADING_TEXT }],
  };
  setHeadingId(heading, TOC_HEADING_ID);
  return heading;
};

const createBaseSlug = value => {
  const normalized = slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

  return normalized || "section";
};

const cloneInlineNode = node => structuredClone(node);

const createUniqueSlugger = existingIds => {
  const usedIds = new Set(existingIds);

  return value => {
    const base = createBaseSlug(value);
    if (!usedIds.has(base)) {
      usedIds.add(base);
      return base;
    }

    let suffix = 2;
    let candidate = `${base}-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    usedIds.add(candidate);
    return candidate;
  };
};

const createTocListItem = entry => ({
  type: "listItem",
  spread: false,
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "link",
          url: `#${entry.id}`,
          children:
            Array.isArray(entry.children) && entry.children.length > 0
              ? entry.children.map(cloneInlineNode)
              : [{ type: "text", value: entry.text }],
        },
      ],
    },
  ],
});

const createEmptyListNode = () => ({
  type: "list",
  ordered: false,
  spread: false,
  children: [],
});

const buildTocList = entries => {
  if (!entries.length) return null;

  const parsedDepths = entries
    .map(entry => Number.parseInt(String(entry.depth), 10))
    .filter(Number.isFinite)
    .map(depth => Math.max(2, Math.min(6, depth)));
  const baseDepth = parsedDepths.length ? Math.min(...parsedDepths) : 2;
  const normalizedDepths = entries.map(entry => {
    let depth = Number.parseInt(String(entry.depth), 10);
    if (!Number.isFinite(depth)) depth = 2;
    depth = Math.max(2, Math.min(6, depth));
    return Math.max(2, Math.min(6, depth - baseDepth + 2));
  });

  const rootList = createEmptyListNode();
  const listStack = [rootList];
  let currentDepth = normalizedDepths[0] ?? 2;

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const depth = normalizedDepths[index];

    while (depth > currentDepth) {
      const parentList = listStack[listStack.length - 1];
      const parentItem = parentList.children[parentList.children.length - 1];
      if (!parentItem || parentItem.type !== "listItem") {
        // No parent exists yet; keep this item at root and reset depth baseline.
        currentDepth = depth;
        break;
      }

      const nestedList = createEmptyListNode();
      parentItem.children.push(nestedList);
      listStack.push(nestedList);
      currentDepth += 1;
    }

    while (depth < currentDepth && listStack.length > 1) {
      listStack.pop();
      currentDepth -= 1;
    }

    if (depth < currentDepth && listStack.length === 1) {
      currentDepth = depth;
    }

    listStack[listStack.length - 1].children.push(createTocListItem(entry));
  }

  return rootList;
};

const collectExistingHeadingIds = tree => {
  const ids = new Set();
  visit(tree, "heading", node => {
    const id = getHeadingId(node);
    if (id) ids.add(id);
  });
  return ids;
};

const collectTocEntries = (tree, createSlug) => {
  const entries = [];

  visit(tree, "heading", node => {
    const text = getNodeText(node).trim();
    if (!text) return;
    if (TOC_HEADING_PATTERN.test(text)) return;
    if (node.depth < 2 || node.depth > 6) return;

    let id = getHeadingId(node);
    if (!id) {
      id = createSlug(text);
      setHeadingId(node, id);
    }

    entries.push({
      id,
      text,
      children: Array.isArray(node.children)
        ? node.children.map(cloneInlineNode)
        : [],
      depth: node.depth,
    });
  });

  return entries;
};

const findTocHeadingIndex = nodes =>
  nodes.findIndex(node => isTocHeadingNode(node));

const removeStaleTocList = (nodes, tocHeadingIndex) => {
  const nextNode = nodes[tocHeadingIndex + 1];
  if (nextNode?.type === "list") {
    nodes.splice(tocHeadingIndex + 1, 1);
  }
};

export function remarkPostToc() {
  return (tree, file) => {
    if (!isBlogPostFile(file?.path)) return;
    if (!isTocEnabled(file)) return;
    if (!Array.isArray(tree?.children)) return;

    const existingIds = collectExistingHeadingIds(tree);
    const createSlug = createUniqueSlugger(existingIds);
    const tocEntries = collectTocEntries(tree, createSlug);
    if (!tocEntries.length) return;

    const nodes = tree.children;
    let tocHeadingIndex = findTocHeadingIndex(nodes);

    if (tocHeadingIndex < 0) {
      tocHeadingIndex = getInsertionIndex(nodes);
      nodes.splice(tocHeadingIndex, 0, createTocHeadingNode());
    } else {
      setHeadingId(nodes[tocHeadingIndex], TOC_HEADING_ID);
    }

    removeStaleTocList(nodes, tocHeadingIndex);

    const tocList = buildTocList(tocEntries);
    if (!tocList) return;
    nodes.splice(tocHeadingIndex + 1, 0, tocList);
  };
}
