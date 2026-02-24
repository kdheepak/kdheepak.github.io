// @ts-nocheck
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = value =>
  value.replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char] ?? char);

const transformChildren = parent => {
  if (!parent || !Array.isArray(parent.children)) return;

  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];

    if (child?.type === "code" && child.lang === "mermaid") {
      parent.children[index] = {
        type: "html",
        value: `<pre class="mermaid">${escapeHtml(child.value)}</pre>`,
      };
      continue;
    }

    transformChildren(child);
  }
};

export function remarkMermaidFences() {
  return tree => {
    transformChildren(tree);
  };
}
