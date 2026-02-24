import { visit } from "unist-util-visit";

const BLOG_PATH_FRAGMENT = "/src/data/blog/";
const TOC_HEADING_ID = "table-of-contents";
const FOOTNOTES_HEADING_TEXT = "Footnotes";
const REFERENCES_HEADING_TEXT = "References";
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
const URL_LINKIFY_SKIP_TAGS = new Set(["a", "code", "pre", "script", "style"]);
const BRACKET_PAIRS = [
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
];
const HEADING_LINK_CLASSES = [
  "heading-link",
  "ms-2",
  "no-underline",
  "opacity-75",
  "md:opacity-0",
  "md:group-hover:opacity-100",
  "md:focus:opacity-100",
];

const isElementNode = node => node?.type === "element";

const isBlogPostFile = filePath =>
  typeof filePath === "string" &&
  filePath.replaceAll("\\", "/").includes(BLOG_PATH_FRAGMENT);

const isListNode = node =>
  isElementNode(node) && ["ul", "ol"].includes(node.tagName);

const toClassList = classNameValue => {
  if (Array.isArray(classNameValue)) {
    return classNameValue
      .flatMap(value => String(value).split(/\s+/))
      .map(value => value.trim())
      .filter(Boolean);
  }

  if (typeof classNameValue === "string") {
    return classNameValue
      .split(/\s+/)
      .map(value => value.trim())
      .filter(Boolean);
  }

  return [];
};

const setClassList = (node, classList) => {
  if (!node.properties || typeof node.properties !== "object") {
    node.properties = {};
  }

  if (!classList.length) {
    delete node.properties.className;
    return;
  }

  node.properties.className = classList;
};

const hasClass = (node, className) =>
  toClassList(node?.properties?.className ?? node?.properties?.class).includes(
    className
  );

const addClass = (node, className) => {
  const classList = toClassList(node?.properties?.className);
  if (classList.includes(className)) return;
  classList.push(className);
  setClassList(node, classList);
};

const getNodeText = node => {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text" && typeof node.value === "string") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(getNodeText).join("");
};

const getElementId = node =>
  typeof node?.properties?.id === "string" ? node.properties.id : "";

const createTextNode = value => ({
  type: "text",
  value,
});

const collectUsedIds = tree => {
  const usedIds = new Set();
  visit(tree, "element", node => {
    const id = getElementId(node);
    if (id) usedIds.add(id);
  });
  return usedIds;
};

const createUniqueId = (baseId, usedIds) => {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId);
    return baseId;
  }

  let suffix = 2;
  let nextId = `${baseId}-${suffix}`;
  while (usedIds.has(nextId)) {
    suffix += 1;
    nextId = `${baseId}-${suffix}`;
  }
  usedIds.add(nextId);
  return nextId;
};

const ensureElementId = (node, baseId, usedIds) => {
  const existingId = getElementId(node);
  if (existingId) {
    usedIds.add(existingId);
    return existingId;
  }

  if (!node.properties || typeof node.properties !== "object") {
    node.properties = {};
  }

  const nextId = createUniqueId(baseId, usedIds);
  node.properties.id = nextId;
  return nextId;
};

const isFootnotesSection = node => {
  if (!isElementNode(node) || node.tagName !== "section") return false;
  if (hasClass(node, "footnotes")) return true;
  const properties = node.properties ?? {};
  return "data-footnotes" in properties || "dataFootnotes" in properties;
};

const isReferencesSection = node => {
  if (!isElementNode(node)) return false;
  if (!hasClass(node, "references")) return false;

  const id = getElementId(node);
  return id === "refs" || hasClass(node, "csl-bib-body");
};

const isHeadingNode = node =>
  isElementNode(node) &&
  ["h2", "h3", "h4", "h5", "h6"].includes(node.tagName);

const isHeadingLinkNode = node =>
  isElementNode(node) &&
  node.tagName === "a" &&
  hasClass(node, "heading-link");

const hasHeadingLinkChild = heading =>
  Array.isArray(heading.children) &&
  heading.children.some(isHeadingLinkNode);

const createHeadingLink = id => ({
  type: "element",
  tagName: "a",
  properties: {
    className: HEADING_LINK_CLASSES,
    href: `#${id}`,
  },
  children: [
    {
      type: "element",
      tagName: "span",
      properties: { ariaHidden: "true" },
      children: [{ type: "text", value: "#" }],
    },
  ],
});

const createHeading = (text, id) => ({
  type: "element",
  tagName: "h2",
  properties: { id },
  children: [{ type: "text", value: text }],
});

const getPreviousElementSibling = (siblings, currentIndex) => {
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    if (isElementNode(siblings[index])) return siblings[index];
  }
  return null;
};

const getNextElementSibling = (siblings, currentIndex) => {
  for (let index = currentIndex + 1; index < siblings.length; index += 1) {
    if (isElementNode(siblings[index])) return siblings[index];
  }
  return null;
};

const normalizeHeadingText = node => getNodeText(node).trim().toLowerCase();

const ensureFootnotesHeading = (section, usedIds) => {
  if (!Array.isArray(section.children)) return;

  const headingIndex = section.children.findIndex(
    node => isElementNode(node) && node.tagName === "h2"
  );

  if (headingIndex >= 0) {
    const heading = section.children[headingIndex];
    ensureElementId(heading, "footnotes", usedIds);

    const classes = toClassList(heading.properties?.className).filter(
      className => className !== "sr-only"
    );
    setClassList(heading, classes);
    return;
  }

  const headingId = createUniqueId("footnotes", usedIds);
  section.children.unshift(createHeading(FOOTNOTES_HEADING_TEXT, headingId));
};

const ensureReferencesHeadings = (node, usedIds) => {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    if (!isElementNode(child)) continue;

    if (isReferencesSection(child)) {
      const previousElement = getPreviousElementSibling(node.children, index);
      const hasReferencesHeading =
        previousElement?.tagName === "h2" &&
        normalizeHeadingText(previousElement) === "references";

      if (hasReferencesHeading) {
        ensureElementId(previousElement, "references", usedIds);
      } else {
        const headingId = createUniqueId("references", usedIds);
        node.children.splice(index, 0, createHeading(REFERENCES_HEADING_TEXT, headingId));
        index += 1;
      }
    }

    ensureReferencesHeadings(child, usedIds);
  }
};

const countToken = (value, token) => value.split(token).length - 1;

const trimTrailingPunctuation = rawUrl => {
  let url = rawUrl;
  let trailingText = "";

  while (/[.,;:!?]/.test(url.at(-1) ?? "")) {
    trailingText = `${url.at(-1)}${trailingText}`;
    url = url.slice(0, -1);
  }

  for (const [opening, closing] of BRACKET_PAIRS) {
    while (
      url.endsWith(closing) &&
      countToken(url, opening) < countToken(url, closing)
    ) {
      trailingText = `${closing}${trailingText}`;
      url = url.slice(0, -1);
    }
  }

  return { url, trailingText };
};

const createExternalLinkNode = urlText => ({
  type: "element",
  tagName: "a",
  properties: {
    href: urlText.toLowerCase().startsWith("www.")
      ? `https://${urlText}`
      : urlText,
    target: "_blank",
    rel: ["noopener", "noreferrer"],
    dataExternalLink: "",
  },
  children: [createTextNode(urlText)],
});

const splitTextNodeByUrls = value => {
  if (typeof value !== "string" || value.length === 0) return null;

  URL_PATTERN.lastIndex = 0;
  if (!URL_PATTERN.test(value)) return null;

  URL_PATTERN.lastIndex = 0;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_PATTERN.exec(value)) !== null) {
    const matchStart = match.index;
    const matchedUrl = match[0];

    if (matchStart > lastIndex) {
      nodes.push(createTextNode(value.slice(lastIndex, matchStart)));
    }

    const { url, trailingText } = trimTrailingPunctuation(matchedUrl);
    if (url.length > 0) {
      nodes.push(createExternalLinkNode(url));
    } else {
      nodes.push(createTextNode(matchedUrl));
    }

    if (trailingText.length > 0) {
      nodes.push(createTextNode(trailingText));
    }

    lastIndex = matchStart + matchedUrl.length;
  }

  if (lastIndex < value.length) {
    nodes.push(createTextNode(value.slice(lastIndex)));
  }

  return nodes;
};

const linkifyUrlsInNode = node => {
  if (!isElementNode(node) || !Array.isArray(node.children)) return;

  const nextChildren = [];
  for (const child of node.children) {
    if (child?.type === "text") {
      const replacementNodes = splitTextNodeByUrls(child.value);
      if (replacementNodes) {
        nextChildren.push(...replacementNodes);
      } else {
        nextChildren.push(child);
      }
      continue;
    }

    if (isElementNode(child) && !URL_LINKIFY_SKIP_TAGS.has(child.tagName)) {
      linkifyUrlsInNode(child);
    }

    nextChildren.push(child);
  }

  node.children = nextChildren;
};

const linkifyReferenceUrls = tree => {
  visit(tree, "element", node => {
    if (!isReferencesSection(node)) return;

    const inlineContainers = [];
    visit(node, "element", child => {
      if (child !== node && hasClass(child, "csl-right-inline")) {
        inlineContainers.push(child);
      }
    });

    if (inlineContainers.length > 0) {
      for (const container of inlineContainers) {
        linkifyUrlsInNode(container);
      }
      return;
    }

    linkifyUrlsInNode(node);
  });
};

const getHeadingLabel = heading => {
  if (!isHeadingNode(heading) || !Array.isArray(heading.children)) return "";

  return heading.children
    .filter(
      child =>
        !(
          isElementNode(child) &&
          child.tagName === "a" &&
          hasClass(child, "heading-link")
        )
    )
    .map(getNodeText)
    .join("")
    .trim();
};

const getHeadingLinkHashes = tocList => {
  const headingLinkHashes = new Set();
  visit(tocList, "element", node => {
    if (node.tagName !== "a") return;
    const href =
      typeof node?.properties?.href === "string" ? node.properties.href : "";
    if (href.startsWith("#")) {
      headingLinkHashes.add(href);
    }
  });
  return headingLinkHashes;
};

const getHeadingLinkLabels = tocList => {
  const headingLinkLabels = new Set();
  visit(tocList, "element", node => {
    if (node.tagName !== "a") return;
    const label = getNodeText(node).trim().toLowerCase();
    if (label) {
      headingLinkLabels.add(label);
    }
  });
  return headingLinkLabels;
};

const appendTocHeadingLink = (
  tocList,
  heading,
  headingLinkHashes,
  headingLinkLabels
) => {
  if (!isListNode(tocList) || !isHeadingNode(heading)) return;

  const headingId = getElementId(heading);
  if (!headingId) return;

  const headingHash = `#${headingId}`;
  const label = getHeadingLabel(heading);
  if (!label) return;
  const normalizedLabel = label.toLowerCase();

  if (
    headingLinkHashes.has(headingHash) ||
    headingLinkLabels.has(normalizedLabel)
  ) {
    return;
  }

  if (!Array.isArray(tocList.children)) {
    tocList.children = [];
  }

  tocList.children.push({
    type: "element",
    tagName: "li",
    properties: {},
    children: [
      {
        type: "element",
        tagName: "a",
        properties: { href: headingHash },
        children: [createTextNode(label)],
      },
    ],
  });

  headingLinkHashes.add(headingHash);
  headingLinkLabels.add(normalizedLabel);
};

const cloneNode = node => structuredClone(node);

const copyHeadingMarkupToTocLinks = tree => {
  const tocList = findTocList(tree);
  if (!tocList) return;

  const headingsById = new Map();
  visit(tree, "element", node => {
    if (!isHeadingNode(node)) return;
    const headingId = getElementId(node);
    if (!headingId || headingId === TOC_HEADING_ID) return;
    headingsById.set(headingId, node);
  });

  visit(tocList, "element", node => {
    if (!isElementNode(node) || node.tagName !== "a") return;

    const href =
      typeof node?.properties?.href === "string" ? node.properties.href : "";
    if (!href.startsWith("#")) return;

    const headingId = href.slice(1);
    if (!headingId) return;

    const heading = headingsById.get(headingId);
    if (!heading || !Array.isArray(heading.children)) return;

    const clonedHeadingChildren = heading.children
      .filter(child => !isHeadingLinkNode(child))
      .map(cloneNode);

    if (!clonedHeadingChildren.length) return;
    node.children = clonedHeadingChildren;
  });
};

const findTocList = node => {
  if (!node || !Array.isArray(node.children)) return null;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (
      isHeadingNode(child) &&
      getElementId(child) === TOC_HEADING_ID
    ) {
      const nextElement = getNextElementSibling(node.children, index);
      if (isListNode(nextElement)) {
        return nextElement;
      }
    }

    const nestedResult = findTocList(child);
    if (nestedResult) {
      return nestedResult;
    }
  }

  return null;
};

const findFootnotesHeading = tree => {
  let footnotesHeading = null;

  visit(tree, "element", node => {
    if (footnotesHeading || !isFootnotesSection(node)) return;
    if (!Array.isArray(node.children)) return;

    const heading = node.children.find(isHeadingNode);
    if (isHeadingNode(heading)) {
      footnotesHeading = heading;
    }
  });

  return footnotesHeading;
};

const findReferencesHeading = node => {
  if (!node || !Array.isArray(node.children)) return null;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    if (!isElementNode(child)) continue;

    if (isReferencesSection(child)) {
      const previousElement = getPreviousElementSibling(node.children, index);
      if (
        isHeadingNode(previousElement) &&
        normalizeHeadingText(previousElement) === "references"
      ) {
        return previousElement;
      }
    }

    const nestedResult = findReferencesHeading(child);
    if (nestedResult) {
      return nestedResult;
    }
  }

  return null;
};

const ensureReferencesAndFootnotesInToc = tree => {
  const tocList = findTocList(tree);
  if (!tocList) return;

  const existingHashesInTree = new Set();
  visit(tree, "element", node => {
    if (node.tagName !== "a") return;
    const href =
      typeof node?.properties?.href === "string" ? node.properties.href : "";
    if (href.startsWith("#")) {
      existingHashesInTree.add(href);
    }
  });

  const headingLinkHashes = getHeadingLinkHashes(tocList);
  const headingLinkLabels = getHeadingLinkLabels(tocList);
  if (!existingHashesInTree.has("#footnotes")) {
    appendTocHeadingLink(
      tocList,
      findFootnotesHeading(tree),
      headingLinkHashes,
      headingLinkLabels
    );
  }

  if (!existingHashesInTree.has("#references")) {
    appendTocHeadingLink(
      tocList,
      findReferencesHeading(tree),
      headingLinkHashes,
      headingLinkLabels
    );
  }
};

const addHeadingLinks = tree => {
  visit(tree, "element", node => {
    if (!isHeadingNode(node)) return;

    const headingId = getElementId(node);
    if (!headingId || headingId === TOC_HEADING_ID) return;
    if (hasHeadingLinkChild(node)) return;

    addClass(node, "group");
    node.children = Array.isArray(node.children) ? node.children : [];
    node.children.push(createHeadingLink(headingId));
  });
};

export function rehypePostEnhancements() {
  return (tree, file) => {
    if (!isBlogPostFile(file?.path)) return;

    const usedIds = collectUsedIds(tree);

    visit(tree, "element", node => {
      if (isFootnotesSection(node)) {
        ensureFootnotesHeading(node, usedIds);
      }
    });

    ensureReferencesHeadings(tree, usedIds);
    linkifyReferenceUrls(tree);
    ensureReferencesAndFootnotesInToc(tree);
    copyHeadingMarkupToTocLinks(tree);
    addHeadingLinks(tree);
  };
}
