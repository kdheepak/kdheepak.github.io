const TOC_HEADING_TEXT = "Table of contents";
const TOC_HEADING_PATTERN = /^table[\s-]*of[\s-]*contents?$/i;

const getNodeText = node => {
  if (!node || typeof node !== "object") return "";
  if (typeof node.value === "string") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(getNodeText).join("");
};

const hasTocHeading = tree =>
  Array.isArray(tree?.children) &&
  tree.children.some(
    node =>
      node?.type === "heading" &&
      TOC_HEADING_PATTERN.test(getNodeText(node).trim())
  );

const hasTocCandidates = tree =>
  Array.isArray(tree?.children) &&
  tree.children.some(
    node =>
      node?.type === "heading" &&
      !TOC_HEADING_PATTERN.test(getNodeText(node).trim())
  );

const isTocEnabled = file =>
  file?.data?.astro?.frontmatter?.toc === true;

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

const isBlogPostFile = filePath =>
  typeof filePath === "string" &&
  filePath.replaceAll("\\", "/").includes("/src/data/blog/");

export function remarkPostToc() {
  return (tree, file) => {
    if (!isBlogPostFile(file?.path)) return;
    if (!isTocEnabled(file)) return;
    if (!Array.isArray(tree?.children) || hasTocHeading(tree)) return;
    if (!hasTocCandidates(tree)) return;

    const insertionIndex = getInsertionIndex(tree.children);
    tree.children.splice(insertionIndex, 0, {
      type: "heading",
      depth: 2,
      children: [{ type: "text", value: TOC_HEADING_TEXT }],
    });
  };
}
