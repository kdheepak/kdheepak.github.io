---
title: "Jupyter prelude"
date: 2024-12-15T21:03:04-05:00
tags: ["python"]
keywords: ["python, ibis, pandas, matplotlib, jupyter"]
description: "This is common code I add to all jupyter notebooks"
notebookPath: "src/data/blog/jupyter-prelude/index.ipynb"
---

### uv

``` bash
# This will create a new Python environment in the current directory
uv init --app

# This will add the specified packages to the environment
uv add "ibis-framework[duckdb,geospatial]" ipykernel panel hvplot holoviews matplotlib pandas param lonboard folium
```

### prelude

Copy the following to the top of your Jupyter Notebook to load the
prelude:

``` python

################################################################################

# autoreload all modules every time before executing the Python code
%reload_ext autoreload
%autoreload 2

################################################################################

from IPython.core.interactiveshell import InteractiveShell

# `ast_node_interactivity` is a setting that determines how the return value of the last line in a cell is displayed
# with `last_expr_or_assign`, the return value of the last expression is displayed unless it is assigned to a variable
InteractiveShell.ast_node_interactivity = "last_expr_or_assign"

################################################################################

import pandas as pd

# `copy_on_write` is a performance improvement
# This will be the default in a future version of pandas
# Refer to https://pandas.pydata.org/pandas-docs/stable/user_guide/copy_on_write.html
pd.options.mode.copy_on_write = True
pd.options.future.no_silent_downcasting = True

################################################################################

import matplotlib.pyplot as plt
import matplotlib as mpl

%matplotlib inline

mpl.use("agg")

# `constrained_layout` helps avoid overlapping elements
# Refer to https://matplotlib.org/stable/tutorials/intermediate/constrainedlayout_guide.html
mpl.pyplot.rcParams['figure.constrained_layout.use'] = True

# helper function to create a grid layout for subplots
def make_grid(labels=None, ncols=None, nrows=None, placeholder="."):
    """
    Create a grid layout suitable for matplotlib's subplot_mosaic.

    If `labels` is None, auto-generate labels like 'A1', 'A2', ..., 'B1', 'B2', etc.

    Args:
        labels (list of str or None): Subplot labels. If None, generate from ncols and nrows.
        ncols (int or None): Number of columns in the grid (required).
        nrows (int or None): Number of rows (required if labels is None).
        placeholder (str): Placeholder for empty grid cells.

    Returns:
        list of list of str: A 2D list representing the grid layout.
    """
    import string
    import itertools

    if ncols is None or ncols <= 0:
        raise ValueError("ncols must be a positive integer")

    if labels is None:
        if nrows is None:
            raise ValueError("If labels is None, nrows must be specified.")

        def _excel_style_names():
            for size in itertools.count(1):
                for chars in itertools.product(string.ascii_uppercase, repeat=size):
                    yield "".join(chars)

        row_names = itertools.islice(_excel_style_names(), nrows)
        labels = [f"{row}{col + 1}" for row in row_names for col in range(ncols)]

    grid = [labels[i : i + ncols] for i in range(0, len(labels), ncols)]

    if len(grid[-1]) < ncols:
        grid[-1].extend([placeholder] * (ncols - len(grid[-1])))

    return grid
```
