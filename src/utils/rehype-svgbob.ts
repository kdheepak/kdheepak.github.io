// @ts-nocheck
import remarkSvgbob from "remark-svgbob";
import { fromHtml } from "hast-util-from-html";

const SVGBOB_LANGUAGE_CLASS_NAMES = new Set([
  "language-render_svgbob",
  "language-svgbob",
]);

const normalizeClassName = value =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getClassNames = node => {
  const className = node?.properties?.className;

  if (Array.isArray(className)) {
    return className.map(normalizeClassName).filter(Boolean);
  }

  if (typeof className === "string") {
    return className
      .split(/\s+/)
      .map(normalizeClassName)
      .filter(Boolean);
  }

  return [];
};

const hasSvgbobLanguage = node =>
  getClassNames(node).some(className =>
    SVGBOB_LANGUAGE_CLASS_NAMES.has(className)
  );

const extractText = node => {
  if (!node) return "";

  if (node.type === "text") {
    return String(node.value ?? "");
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  return node.children.map(extractText).join("");
};

const renderSvgbob = async (ascii, transformWithSvgbob) => {
  const scratchTree = {
    type: "root",
    children: [{ type: "code", lang: "svgbob", value: ascii }],
  };

  await transformWithSvgbob(scratchTree);

  const renderedNode = scratchTree.children?.[0];
  if (renderedNode?.type !== "html" || typeof renderedNode.value !== "string") {
    return null;
  }

  return renderedNode.value;
};

const parseSvgFragment = svgMarkup => {
  const fragment = fromHtml(svgMarkup, { fragment: true });
  return Array.isArray(fragment?.children) ? fragment.children : [];
};

const transformChildren = async (parent, transformWithSvgbob) => {
  if (!parent || !Array.isArray(parent.children)) return;

  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];

    if (child?.type === "element" && child.tagName === "pre") {
      const codeNode =
        Array.isArray(child.children) &&
        child.children.find(
          node => node?.type === "element" && node.tagName === "code"
        );

      if (codeNode && hasSvgbobLanguage(codeNode)) {
        const ascii = extractText(codeNode);
        const renderedSvg = await renderSvgbob(ascii, transformWithSvgbob);
        if (renderedSvg) {
          const svgNodes = parseSvgFragment(renderedSvg);
          if (svgNodes.length > 0) {
            parent.children.splice(index, 1, ...svgNodes);
            index += svgNodes.length - 1;
          }
        }
        continue;
      }
    }

    await transformChildren(child, transformWithSvgbob);
  }
};

export function rehypeSvgbob() {
  return async tree => {
    const transformWithSvgbob = remarkSvgbob();
    await transformChildren(tree, transformWithSvgbob);
  };
}
