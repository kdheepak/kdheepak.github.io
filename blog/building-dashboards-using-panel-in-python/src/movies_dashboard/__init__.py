# -*- coding: utf-8 -*-
import pandas as pd
import panel as pn  # noqa
import holoviews as hv
import hvplot.pandas  # noqa

from . import movies  # noqa

# `copy_on_write` is a performance improvement
# This will be the default in a future version of pandas
# Refer to https://pandas.pydata.org/pandas-docs/stable/user_guide/copy_on_write.html
pd.options.mode.copy_on_write = True
pd.options.future.no_silent_downcasting = True

pn.extension(
    "tabulator",
    sizing_mode="stretch_width",
    throttled=True,
)
hv.extension("bokeh")
