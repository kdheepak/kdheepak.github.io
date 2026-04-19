---
title: matplotlib cheatsheet
date: 2026-04-19 10:22:45-04:00
tags:
- python
keywords:
- matplotlib
description: >-
  cheatsheet for matplotlib
draft: true
marimo-version: 0.23.1
pyproject: |-
  requires-python = ">=3.14"
  dependencies = [
      "matplotlib==3.10.8",
  ]
---

```python {.marimo}
import marimo as mo
```

`matplotlib` can be used without every importing `pyplot`.

This is the only import you never need:

```python {.marimo}
import matplotlib as mpl
```

Some global settings are preferable:

- Call `mpl.use("Agg")` before creating figures when generating static images.
- Set `mpl.rcParams["figure.constrained_layout.use"] = True` before figure creation to avoid needing to use tight layout

```python {.marimo}
mpl.use("Agg")
mpl.rcParams["figure.constrained_layout.use"] = True
```

Generating a figure and a single axes:

```python {.marimo}
_fig = mpl.figure.Figure()
_ax = _fig.add_subplot()
_fig
```

```python {.marimo}
_fig = mpl.figure.Figure()
_ax = _fig.add_subplot(2, 1, 1)
_ax = _fig.add_subplot(2, 1, 2)
_fig
```

```python {.marimo}

```
