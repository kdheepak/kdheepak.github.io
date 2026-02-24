// @ts-nocheck
import { visit } from "unist-util-visit";

const SKIP_PARENT_TYPES = new Set([
  "inlineCode",
  "code",
  "definition",
  "textDirective",
  "leafDirective",
  "containerDirective",
]);

const createTextNode = value => ({
  type: "text",
  value,
});

const createMarkDirectiveNode = value => ({
  type: "textDirective",
  name: "mark",
  attributes: {},
  children: [createTextNode(value)],
});

const findNextUnescapedPair = (value, fromIndex = 0) => {
  let index = fromIndex;
  while (index < value.length - 1) {
    const isPair = value[index] === "=" && value[index + 1] === "=";
    const isEscaped = index > 0 && value[index - 1] === "\\";
    if (isPair && !isEscaped) return index;
    index += 1;
  }
  return -1;
};

const splitInlineMarkSyntax = value => {
  if (typeof value !== "string" || value.length === 0) return null;

  const nodes = [];
  let cursor = 0;
  let hasMark = false;

  while (cursor < value.length) {
    const markStart = findNextUnescapedPair(value, cursor);
    if (markStart < 0) break;

    const markEnd = findNextUnescapedPair(value, markStart + 2);
    if (markEnd < 0) break;

    const before = value.slice(cursor, markStart);
    if (before.length > 0) {
      nodes.push(createTextNode(before));
    }

    const markedText = value.slice(markStart + 2, markEnd);
    if (markedText.length > 0) {
      nodes.push(createMarkDirectiveNode(markedText));
      hasMark = true;
    } else {
      nodes.push(createTextNode("===="));
    }

    cursor = markEnd + 2;
  }

  if (!hasMark) return null;

  if (cursor < value.length) {
    nodes.push(createTextNode(value.slice(cursor)));
  }

  return nodes;
};

export function remarkInlineMark() {
  return tree => {
    visit(tree, "text", (node, index, parent) => {
      if (
        typeof index !== "number" ||
        !parent ||
        !Array.isArray(parent.children) ||
        SKIP_PARENT_TYPES.has(parent.type)
      ) {
        return;
      }

      const replacementNodes = splitInlineMarkSyntax(node.value);
      if (!replacementNodes) return;

      parent.children.splice(index, 1, ...replacementNodes);
      return index + replacementNodes.length;
    });
  };
}
