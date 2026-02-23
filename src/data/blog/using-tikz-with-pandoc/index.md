---
title: "Using Tikz with Pandoc"
date: 2022-02-18T20:03:31-06:00
tags: ["pandoc"]
keywords: ["tikz, latex, pandoc, lua, filter"]
description: guide to integrating TikZ diagrams with Pandoc using Lua filters.
notebookPath: "src/data/blog/using-tikz-with-pandoc/index.ipynb"
---

This is a demo of integrating Tikz as part of the blog.

``` tikz
\begin{tikzpicture}

\def \n {5}
\def \radius {3cm}
\def \margin {8} % margin in angles, depends on the radius

\foreach \s in {1,...,\n}
{
  \node[draw, circle] at ({360/\n * (\s - 1)}:\radius) {$\s$};
  \draw[->, >=latex] ({360/\n * (\s - 1)+\margin}:\radius)
    arc ({360/\n * (\s - 1)+\margin}:{360/\n * (\s)-\margin}:\radius);
}
\end{tikzpicture}
```

:::::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.julia .cell-code}
using Markdown
using TikzPictures
tp = TikzPicture(L"""
\def \n {5}
\def \radius {3cm}
\def \margin {8} % margin in angles, depends on the radius

\foreach \s in {1,...,\n}
{
  \node[draw, circle] at ({360/\n * (\s - 1)}:\radius) {$\s$};
  \draw[->, >=latex] ({360/\n * (\s - 1)+\margin}:\radius)
    arc ({360/\n * (\s - 1)+\margin}:{360/\n * (\s)-\margin}:\radius);
}
""")
save(SVG("test"), tp)
md"""![](./test.svg)"""
```

</details>

:::div{.cell-output .cell-output-display}
    [ Info: Precompiling TikzPictures [37f6aa50-8035-52d0-81c2-5a1d08754b2d]
    [ Info: Precompiling Poppler_jll [9c32591e-4766-534b-9725-b71a8799265b]
    ┌ Warning: test.svg already exists, overwriting!
    └ @ TikzPictures ~/.julia/packages/TikzPictures/9WzZq/src/TikzPictures.jl:432
:::

:::div{.cell-output .cell-output-display}
![](./test.svg)
:::
:::::
