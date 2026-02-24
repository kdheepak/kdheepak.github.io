import { visit } from "unist-util-visit";

const BLOG_PATH_FRAGMENT = "/src/data/blog/";
const TOC_HEADING_ID = "table-of-contents";
const FOOTNOTES_HEADING_TEXT = "Footnotes";
const REFERENCES_HEADING_TEXT = "References";
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

const hasHeadingLinkChild = heading =>
  Array.isArray(heading.children) &&
  heading.children.some(
    child =>
      isElementNode(child) &&
      child.tagName === "a" &&
      hasClass(child, "heading-link")
  );

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
    addHeadingLinks(tree);
  };
}
