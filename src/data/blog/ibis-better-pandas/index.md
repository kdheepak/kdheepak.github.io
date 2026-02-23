---
title: "ibis - a better pandas"
date: 2025-06-07T14:22:45-04:00
tags: ["python"]
keywords: ["pandas", "ibis", "method chaining", "data analysis"]
description: "A short showcase of ibis with method chaining"
notebookPath: "src/data/blog/ibis-better-pandas/index.ipynb"
---

:::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.python .cell-code}
from IPython.core.interactiveshell import InteractiveShell

# `ast_node_interactivity` is a setting that determines how the return value of the last line in a cell is displayed
# with `last_expr_or_assign`, the return value of the last expression is displayed unless it is assigned to a variable
InteractiveShell.ast_node_interactivity = "last_expr_or_assign"
```

</details>
:::

There's an excellent blog post on why [Pandas feels clunky for those
coming from R](https://www.sumsar.net/blog/pandas-feels-clunky-when-coming-from-r/).

However in Python, I've found `ibis` as an alternative to `pandas` to be
a much more natural fit for those coming from `R`.

[`ibis`](https://ibis-project.org/) uses duckdb as a backend by default,
and its API is a mix between duckdb and dplyr.

:::div{.cell}
``` {.python .cell-code}
import ibis
```
:::

`_` in ibis is a special variable that refers to the last expression
evaluated this is useful for chaining operations or for using the result
of the last expression in subsequent operations

:::div{.cell}
``` {.python .cell-code}
from ibis import _
```
:::

By default, `ibis` defers execution until you call `execute()`. Using
`ibis.options.interactive = True` will make it so that expressions are
immediately executed when displayed. This is useful for interactive
exploration.

:::div{.cell}
``` {.python .cell-code}

ibis.options.interactive = True
```
:::

Let's also import `pandas` to compare the two libraries.

:::div{.cell}
``` {.python .cell-code}
import pandas as pd
```
:::

Here's the equivalent code in `pandas` and `ibis` for the example
provided in the blog post:

::::div{.cell}
``` {.python .cell-code}
pandas_df = pd.read_csv("purchases.csv")
pandas_df.head()
```

:::div{.cell-output .cell-output-display}
|  | country | amount | discount |
| --- | --- | --- | --- |
| 0 | USA | 2000 | 10 |
| 1 | USA | 3500 | 15 |
| 2 | USA | 3000 | 20 |
| 3 | Canada | 120 | 12 |
| 4 | Canada | 180 | 18 |
:::
::::

::::div{.cell}
``` {.python .cell-code}
df = ibis.read_csv("purchases.csv")
df.head()
```

:::div{.cell-output .cell-output-display}
<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">┏━━━━━━━━━┳━━━━━━━━┳━━━━━━━━━━┓
┃<span style="font-weight: bold"> country </span>┃<span style="font-weight: bold"> amount </span>┃<span style="font-weight: bold"> discount </span>┃
┡━━━━━━━━━╇━━━━━━━━╇━━━━━━━━━━┩
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">string</span>  │ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">int64</span>  │ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">int64</span>    │
├─────────┼────────┼──────────┤
│ <span style="color: #008000; text-decoration-color: #008000">USA    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">2000</span> │       <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">10</span> │
│ <span style="color: #008000; text-decoration-color: #008000">USA    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">3500</span> │       <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">15</span> │
│ <span style="color: #008000; text-decoration-color: #008000">USA    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">3000</span> │       <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">20</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Canada </span> │    <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">120</span> │       <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">12</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Canada </span> │    <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">180</span> │       <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">18</span> │
└─────────┴────────┴──────────┘
</pre>
:::
::::

## "How much do we sell..? Let's take the total sum!"

### pandas

::::div{.cell}
``` {.python .cell-code}
pandas_df.amount.sum()
```

:::div{.cell-output .cell-output-display}
    np.int64(17210)
:::
::::

### ibis

::::div{.cell}
``` {.python .cell-code}
df.amount.sum().execute()
```

:::div{.cell-output .cell-output-display}
    17210
:::
::::

## "Ah, they wanted it by country..."

### pandas

::::div{.cell}
``` {.python .cell-code}
(
    pandas_df
    .groupby("country")
    .agg(total=("amount", "sum"))
    .reset_index()
)
```

:::div{.cell-output .cell-output-display}
|  | country | total |
| --- | --- | --- |
| 0 | Australia | 600 |
| 1 | Brazil | 460 |
| 2 | Canada | 3400 |
| 3 | France | 500 |
| 4 | Germany | 570 |
| 5 | India | 720 |
| 6 | Italy | 630 |
| 7 | Japan | 690 |
| 8 | Spain | 660 |
| 9 | UK | 480 |
| 10 | USA | 8500 |
:::
::::

### ibis

::::div{.cell}
``` {.python .cell-code}
(
    df
    .group_by("country")
    .aggregate(total=_.amount.sum())
    .order_by("country") # optional, to align with the pandas output
)
```

:::div{.cell-output .cell-output-display}
<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">┏━━━━━━━━━━━┳━━━━━━━┓
┃<span style="font-weight: bold"> country   </span>┃<span style="font-weight: bold"> total </span>┃
┡━━━━━━━━━━━╇━━━━━━━┩
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">string</span>    │ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">int64</span> │
├───────────┼───────┤
│ <span style="color: #008000; text-decoration-color: #008000">Australia</span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">600</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Brazil   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">460</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Canada   </span> │  <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">3400</span> │
│ <span style="color: #008000; text-decoration-color: #008000">France   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">500</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Germany  </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">570</span> │
│ <span style="color: #008000; text-decoration-color: #008000">India    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">720</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Italy    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">630</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Japan    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">690</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Spain    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">660</span> │
│ <span style="color: #008000; text-decoration-color: #008000">UK       </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">480</span> │
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span>         │     <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span> │
└───────────┴───────┘
</pre>
:::
::::

Calling `.execute()` will run the query and return the result as a
pandas DataFrame.

::::div{.cell}
``` {.python .cell-code}
type(
  (
    df
    .group_by("country")
    .aggregate(total=_.amount.sum())
    .order_by("country") # optional, to align with the pandas output
  ).execute()
)
```

:::div{.cell-output .cell-output-display}
    pandas.core.frame.DataFrame
:::
::::

## "And I guess I should deduct the discount."

### pandas

::::div{.cell}
``` {.python .cell-code}
(
    pandas_df
    .groupby("country")[["amount", "discount"]]
    .apply(lambda df: (df["amount"] - df["discount"]).sum())
    .reset_index()
    .rename(columns={0: "total"})
)
```

:::div{.cell-output .cell-output-display}
|  | country | total |
| --- | --- | --- |
| 0 | Australia | 540 |
| 1 | Brazil | 414 |
| 2 | Canada | 3349 |
| 3 | France | 450 |
| 4 | Germany | 513 |
| 5 | India | 648 |
| 6 | Italy | 567 |
| 7 | Japan | 621 |
| 8 | Spain | 594 |
| 9 | UK | 432 |
| 10 | USA | 8455 |
:::
::::

### ibis

::::div{.cell}
``` {.python .cell-code}
(
    df
    .group_by("country")
    .aggregate(total=(_.amount - _.discount).sum())
    .order_by("country")
)
```

:::div{.cell-output .cell-output-display}
<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">┏━━━━━━━━━━━┳━━━━━━━┓
┃<span style="font-weight: bold"> country   </span>┃<span style="font-weight: bold"> total </span>┃
┡━━━━━━━━━━━╇━━━━━━━┩
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">string</span>    │ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">int64</span> │
├───────────┼───────┤
│ <span style="color: #008000; text-decoration-color: #008000">Australia</span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">540</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Brazil   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">414</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Canada   </span> │  <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">3349</span> │
│ <span style="color: #008000; text-decoration-color: #008000">France   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">450</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Germany  </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">513</span> │
│ <span style="color: #008000; text-decoration-color: #008000">India    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">648</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Italy    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">567</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Japan    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">621</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Spain    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">594</span> │
│ <span style="color: #008000; text-decoration-color: #008000">UK       </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">432</span> │
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span>         │     <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span> │
└───────────┴───────┘
</pre>
:::
::::

## "Oh, and Maria asked me to remove any outliers."

### pandas

::::div{.cell}
``` {.python .cell-code}
(
    pandas_df
    .query("amount <= amount.median() * 10")
    .groupby("country")[["amount", "discount"]]
    .apply(lambda df: (df["amount"] - df["discount"]).sum())
    .reset_index()
    .rename(columns={0: "total"})
)
```

:::div{.cell-output .cell-output-display}
|  | country | total |
| --- | --- | --- |
| 0 | Australia | 540 |
| 1 | Brazil | 414 |
| 2 | Canada | 270 |
| 3 | France | 450 |
| 4 | Germany | 513 |
| 5 | India | 648 |
| 6 | Italy | 567 |
| 7 | Japan | 621 |
| 8 | Spain | 594 |
| 9 | UK | 432 |
| 10 | USA | 1990 |
:::
::::

### ibis

::::div{.cell}
``` {.python .cell-code}
(
    df
    .mutate(median=_.amount.median())
    .filter(_.amount <= _.median * 10)
    .group_by("country")
    .aggregate(total=(_.amount - _.discount).sum())
    .order_by("country")
)
```

:::div{.cell-output .cell-output-display}
<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">┏━━━━━━━━━━━┳━━━━━━━┓
┃<span style="font-weight: bold"> country   </span>┃<span style="font-weight: bold"> total </span>┃
┡━━━━━━━━━━━╇━━━━━━━┩
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">string</span>    │ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">int64</span> │
├───────────┼───────┤
│ <span style="color: #008000; text-decoration-color: #008000">Australia</span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">540</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Brazil   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">414</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Canada   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">270</span> │
│ <span style="color: #008000; text-decoration-color: #008000">France   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">450</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Germany  </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">513</span> │
│ <span style="color: #008000; text-decoration-color: #008000">India    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">648</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Italy    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">567</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Japan    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">621</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Spain    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">594</span> │
│ <span style="color: #008000; text-decoration-color: #008000">UK       </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">432</span> │
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span>         │     <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span> │
└───────────┴───────┘
</pre>
:::
::::

## "I probably should use the median within each country"

### pandas

::::div{.cell}
``` {.python .cell-code}
(
    pandas_df
    .assign(country_median=lambda df:
        df.groupby("country")["amount"].transform("median")
    )
    .query("amount <= country_median * 10")
    .groupby("country")[["amount", "discount"]]
    .apply(lambda df: (df["amount"] - df["discount"]).sum())
    .reset_index()
    .rename(columns={0: "total"})
)
```

:::div{.cell-output .cell-output-display}
|  | country | total |
| --- | --- | --- |
| 0 | Australia | 540 |
| 1 | Brazil | 414 |
| 2 | Canada | 270 |
| 3 | France | 450 |
| 4 | Germany | 513 |
| 5 | India | 648 |
| 6 | Italy | 567 |
| 7 | Japan | 621 |
| 8 | Spain | 594 |
| 9 | UK | 432 |
| 10 | USA | 8455 |
:::
::::

### ibis

For this last example, we have to resort to calculating the median after
a group by operation over each country and then join it back to the
original DataFrame to replace the outliers. This is similar to the
pandas approach.

::::div{.cell}
``` {.python .cell-code}
df.group_by("country").aggregate(median=_.amount.median())
```

:::div{.cell-output .cell-output-display}
<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">┏━━━━━━━━━━━┳━━━━━━━━━┓
┃<span style="font-weight: bold"> country   </span>┃<span style="font-weight: bold"> median  </span>┃
┡━━━━━━━━━━━╇━━━━━━━━━┩
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">string</span>    │ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">float64</span> │
├───────────┼─────────┤
│ <span style="color: #008000; text-decoration-color: #008000">USA      </span> │  <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">3000.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Germany  </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">200.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">India    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">250.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Spain    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">230.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Japan    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">240.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Italy    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">220.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Brazil   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">230.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Australia</span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">210.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">UK       </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">160.0</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Canada   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">180.0</span> │
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span>         │       <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span> │
└───────────┴─────────┘
</pre>
:::
::::

Here's how you can do it in a single expression in `ibis`:

::::div{.cell}
``` {.python .cell-code}
(
    df
    .join(
        df.group_by("country").aggregate(median=_.amount.median()),
        predicates=["country"],
    )
    .filter(_.amount <= _.median * 10)
    .group_by("country")
    .aggregate(total=(_.amount - _.discount).sum())
    .order_by("country")
)
```

:::div{.cell-output .cell-output-display}
<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">┏━━━━━━━━━━━┳━━━━━━━┓
┃<span style="font-weight: bold"> country   </span>┃<span style="font-weight: bold"> total </span>┃
┡━━━━━━━━━━━╇━━━━━━━┩
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">string</span>    │ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">int64</span> │
├───────────┼───────┤
│ <span style="color: #008000; text-decoration-color: #008000">Australia</span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">540</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Brazil   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">414</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Canada   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">270</span> │
│ <span style="color: #008000; text-decoration-color: #008000">France   </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">450</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Germany  </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">513</span> │
│ <span style="color: #008000; text-decoration-color: #008000">India    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">648</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Italy    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">567</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Japan    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">621</span> │
│ <span style="color: #008000; text-decoration-color: #008000">Spain    </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">594</span> │
│ <span style="color: #008000; text-decoration-color: #008000">UK       </span> │   <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">432</span> │
│ <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span>         │     <span style="color: #7f7f7f; text-decoration-color: #7f7f7f">…</span> │
└───────────┴───────┘
</pre>
:::
::::
