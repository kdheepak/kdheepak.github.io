# -*- coding: utf-8 -*-
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "altair==5.5.0",
#     "duckdb==1.2.2",
#     "matplotlib==3.10.1",
#     "nbformat==5.10.4",
#     "numpy==2.2.5",
#     "openai==1.76.0",
#     "polars[pyarrow]==1.28.0",
#     "pytest==8.3.5",
#     "sqlglot==26.16.2",
#     "vegafusion==2.0.2",
#     "vl-convert-python==1.7.0",
# ]
# ///

import marimo

__generated_with = "0.13.2"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _(mo):
    mo.md(
        r"""
        $V$ and $I$ are used to indicate phasor representations of sinusoidal voltages and currents.

        Voltage and current be expressed by:

        $v_{an} = V_{max} \cos(\omega t + \theta)$

        $i_{an} = I_{max} \cos\omega t$

        Instantaneous power is calculated by $p_{a} = v_{an} \times i_{an}$.
        If we plot the above equations, we get the following.
        """
    )
    return


@app.cell
def _(mo):
    import numpy as np

    θ = mo.ui.slider(-np.pi, np.pi, 0.01, 0, label="θ", full_width=True)

    θ
    return np, θ


@app.cell
def _(np, θ):
    import matplotlib.pyplot as plt
    import matplotlib as mpl

    f0 = 60  # Hz (frequency)

    Av = 10 * np.sqrt(2)  # voltage peak
    Ai = 5 * np.sqrt(2)  # current peak

    fs = 4000  # steps
    t = np.arange(0.000, 1 / f0, 1.0 / fs)  # plot from 0 to .02 secs

    v = Av * np.cos(2 * np.pi * f0 * t + θ.value)
    i = Ai * np.cos(2 * np.pi * f0 * t)

    fig = mpl.figure.Figure(figsize=(8, 5), layout="constrained")

    axs = fig.subplot_mosaic(
        [["voltage_current", "legend1"], ["power", "legend2"]],
        width_ratios=[1, 0.2],
        sharex=True,
    )

    ax = axs["voltage_current"]

    ax.axhline(linewidth=0.25, color="black")
    ax.axvline(linewidth=0.25, color="black")

    ax.plot(t, v, label="Voltage in phase A")
    ax.plot(t, i, label="Current in phase A")
    ax.set_ylabel("Voltage and Current")

    ax.axis([0, 1 / f0, -20, 20])

    axs["legend1"].legend(*ax.get_legend_handles_labels(), loc="center")
    axs["legend1"].axis("off")

    ax = axs["power"]

    ax.axhline(linewidth=0.25, color="black")
    ax.axvline(linewidth=0.25, color="black")

    ax.plot(t, v * i, label="Power in phase A", color="g")

    ax.set_ylabel("Power")
    ax.set_xlabel("Time (s)")
    ax.set_xticks([])

    axs["legend2"].legend(*ax.get_legend_handles_labels(), loc="center")
    axs["legend2"].axis("off")

    ax.axis([0, 1 / f0, -120, 120])

    fig.suptitle(
        r"$\theta = " + f"{θ.value * 180 / np.pi:0.0f}" + r"°$",
    )
    fig
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
