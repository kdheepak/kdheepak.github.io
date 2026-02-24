// @ts-nocheck
import { visit } from "unist-util-visit";

const PROTECTED_CODE_SPAN_TAG = "kd-cite-skip-span";
const PROTECTED_MARKER_ATTR = "data-kd-cite-protected";

const isElementNode = node => node?.type === "element";

const protectCodeSpans = node => {
  if (!isElementNode(node)) return;

  if (node.tagName === "span") {
    node.tagName = PROTECTED_CODE_SPAN_TAG;
    if (!node.properties || typeof node.properties !== "object") {
      node.properties = {};
    }
    node.properties[PROTECTED_MARKER_ATTR] = "";
  }

  if (!Array.isArray(node.children)) return;
  for (const child of node.children) {
    protectCodeSpans(child);
  }
};

export function rehypeProtectCodeCitations() {
  return tree => {
    visit(tree, "element", node => {
      if (node.tagName !== "pre" || !Array.isArray(node.children)) return;

      for (const child of node.children) {
        if (!isElementNode(child) || child.tagName !== "code") continue;
        protectCodeSpans(child);
      }
    });
  };
}

export function rehypeRestoreCodeCitations() {
  return tree => {
    visit(tree, "element", node => {
      if (node.tagName !== PROTECTED_CODE_SPAN_TAG) return;

      node.tagName = "span";

      if (!node.properties || typeof node.properties !== "object") return;
      delete node.properties[PROTECTED_MARKER_ATTR];
    });
  };
}
