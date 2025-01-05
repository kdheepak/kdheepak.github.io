# -*- coding: utf-8 -*-
import pandas as pd
import panel as pn  # noqa
import holoviews as hv
import hvplot.pandas  # noqa
import matplotlib as mpl

from . import movies  # noqa

# `copy_on_write` is a performance improvement
# This will be the default in a future version of pandas
# Refer to https://pandas.pydata.org/pandas-docs/stable/user_guide/copy_on_write.html
pd.options.mode.copy_on_write = True
pd.options.future.no_silent_downcasting = True

mpl.use("agg")

# `constrained_layout` helps avoid overlapping elements
# Refer to https://matplotlib.org/stable/tutorials/intermediate/constrainedlayout_guide.html
mpl.pyplot.rcParams["figure.constrained_layout.use"] = True

pn.extension(
    "tabulator",
    sizing_mode="stretch_width",
    notifications=True,
    throttled=True,
)
hv.extension("bokeh")
