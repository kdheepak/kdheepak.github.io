---
title: "The Basic Building blocks of Ratatui - Part 3"
date: 2024-05-16T22:03:04-04:00
tags: ["rust"]
keywords: ["rust, ratatui"]
description: ratatui fundamentals guide to spans, lines, and text rendering.
notebookPath: "src/data/blog/the-basic-building-blocks-of-ratatui-part-3/index.ipynb"
---

Ratatui is a crate for building terminal user interfaces in Rust.

In this post, we'll explore the text primitives of `ratatui`.

:::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.rust .cell-code}
:dep ratatui = "0.26.2"
:dep ratatui-macros = "0.4.0"

fn span_to_html(s: ratatui::text::Span) -> String{
    let mut html = String::new();
    html.push_str("<span style=\"");

    // Set foreground color
    if let Some(color) = &s.style.fg {
        html.push_str(&format!("color: {};", color));
    }

    // Set background color
    if let Some(color) = &s.style.bg {
        html.push_str(&format!("background-color: {};", color));
    }

    // Add modifiers
    match s.style.add_modifier {
        ratatui::style::Modifier::BOLD => html.push_str("font-weight: bold;"),
        ratatui::style::Modifier::ITALIC => html.push_str("font-style: italic;"),
        ratatui::style::Modifier::UNDERLINED => html.push_str("text-decoration: underline;"),
        _ => {}
    }
    html.push_str("\">");
    html.push_str(&s.content);
    html.push_str("</span>");
    html
}

fn buffer_to_html(buf: &ratatui::buffer::Buffer) -> String {
    fn escape_special_html_characters(text: &str) -> String {
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;")
    }

    let mut html = String::from("<pre><code>");

    let w = buf.area.width;
    let h = buf.area.height;

    for y in 0..h {
        for x in 0..w {
            let s = buf.get(x, y).symbol();

            let escaped = escape_special_html_characters(s);

            let style = buf.get(x, y).style();

            let span = ratatui::text::Span::styled(s, style);

            html.push_str(&span_to_html(span));
        }
        html.push('\n');
    }

    html.push_str("</code></pre>");

    html
}

fn show_html<D>(content: D) where D: std::fmt::Display {
    println!(r#"EVCXR_BEGIN_CONTENT text/html
<div style="display: flex; justify-content:start; gap: 1em; margin: 1em">
{}
</div>
EVCXR_END_CONTENT"#, content);
}

```

</details>
:::

## Text primitives

In Ratatui, there are 3 fundamental text primitives that you should be
aware of.

### Span

The first is a `Span`.

::::div{.cell}
``` {.rust .cell-code}
use ratatui::text::Span;

let span = Span::raw("hello world");
span
```

:::div{.cell-output .cell-output-display}
    Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }
:::
::::

A `Span` contains two fields.

::::div{.cell}
``` {.rust .cell-code}
span.content
```

:::div{.cell-output .cell-output-display}
    "hello world"
:::
::::

::::div{.cell}
``` {.rust .cell-code}
span.style
```

:::div{.cell-output .cell-output-display}
    Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE }
:::
::::

A `Style` object contains foreground color, background color, and
modifiers for whether the style being applied is **bold**, *italics*,
etc

There are a number of constructors for `Span` that you may use, but
`ratatui` exposes a `Stylize` trait that makes it easy to style content
which I find very useful.

::::div{.cell}
``` {.rust .cell-code}
use ratatui::style::Stylize; // required trait to use style methods

"hello world".bold()
```

:::div{.cell-output .cell-output-display}
    Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: BOLD, sub_modifier: NONE } }
:::
::::

You can even chain these trait methods to add more styles:

::::div{.cell}
``` {.rust .cell-code}
"hello world".bold().yellow().on_black()
```

:::div{.cell-output .cell-output-display}
    Span { content: "hello world", style: Style { fg: Some(Yellow), bg: Some(Black), underline_color: None, add_modifier: BOLD, sub_modifier: NONE } }
:::
::::

::::div{.cell}
``` {.rust .cell-code}
show_html(span_to_html("hello world".bold()))
```

:::div{.cell-output .cell-output-display}
<div style="display: flex; justify-content:start; gap: 1em; margin: 1em">
<span style="font-weight: bold;">hello world</span>
</div>
:::
::::

::::div{.cell}
``` {.rust .cell-code}
show_html(span_to_html("hello world".yellow().bold().on_black()))
```

:::div{.cell-output .cell-output-display}
<div style="display: flex; justify-content:start; gap: 1em; margin: 1em">
<span style="color: Yellow;background-color: Black;font-weight: bold;">hello world</span>
</div>
:::
::::

With `ratatui-macros`, you can even use a `format!` style macro to
create a `Span`

::::div{.cell}
``` {.rust .cell-code}
use ratatui_macros::span;

let world = "world";
span!("hello {}", world)
```

:::div{.cell-output .cell-output-display}
    Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }
:::
::::

### Line

The second primitive to be aware of is a `Line`.

A line consists of one or more spans.

::::div{.cell}
``` {.rust .cell-code}
use ratatui::text::Line;

let line = Line::raw("hello world");
line
```

:::div{.cell-output .cell-output-display}
    Line { spans: [Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }], style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE }, alignment: None }
:::
::::

::::div{.cell}
``` {.rust .cell-code}
line.spans
```

:::div{.cell-output .cell-output-display}
    [Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }]
:::
::::

::::div{.cell}
``` {.rust .cell-code}
line.spans.len()
```

:::div{.cell-output .cell-output-display}
    1
:::
::::

A unique feature of lines is that new lines are removed but the content
is split into multiple spans.

:::div{.cell}
``` {.rust .cell-code}
let line = Line::raw("hello world\ngoodbye world");
```
:::

::::div{.cell}
``` {.rust .cell-code}
line.spans[0]
```

:::div{.cell-output .cell-output-display}
    Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }
:::
::::

::::div{.cell}
``` {.rust .cell-code}
line.spans[1]
```

:::div{.cell-output .cell-output-display}
    Span { content: "goodbye world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }
:::
::::

A line can also be styled with methods from the `Stylize` trait:

::::div{.cell}
``` {.rust .cell-code}
Line::raw("hello world").bold()
```

:::div{.cell-output .cell-output-display}
    Line { spans: [Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }], style: Style { fg: None, bg: None, underline_color: None, add_modifier: BOLD, sub_modifier: NONE }, alignment: None }
:::
::::

In this case, the individual span's styles are left untouched but the
`Line`'s style is updated.

Another unique feature about `Line` is that they can be aligned.

::::div{.cell}
``` {.rust .cell-code}
let centered_line = line.centered();
centered_line
```

:::div{.cell-output .cell-output-display}
    Line { spans: [Span { content: "hello world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }, Span { content: "goodbye world", style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE } }], style: Style { fg: None, bg: None, underline_color: None, add_modifier: NONE, sub_modifier: NONE }, alignment: Some(Center) }
:::
::::

With `ratatui-macros`, you can create a `Line` using the `line!` macro
using a `vec!`-like syntax.

:::div{.cell}
``` {.rust .cell-code}
use ratatui_macros::line;

line!["hello", " ", "world"].yellow().bold().centered();
```
:::

Every element in the `line!` macro is converted to a `Span`.

### Text

Finally there is `Text`, which is a collection of `Line`s.

:::div{.cell}
``` {.rust .cell-code}
use ratatui::text::Text;

Text::from(vec![Line::raw("hello world"), Line::raw("goodbye world")]);
```
:::

With ratatui-macros, you can create a `Text` using `text!` macro using a
`vec!`-like syntax.

:::div{.cell}
``` {.rust .cell-code}
use ratatui_macros::text;

text!["hello world", "goodbye world"];
```
:::

Here, every element in the `text!` macro is converted to a `Line`.

Like `Line`, `Text` can also be aligned. In this case, the alignment
occurs on every `Line` inside the `Text`.

::::div{.cell}
``` {.rust .cell-code}
let t = text!["hello world", "goodbye world"].right_aligned();
t.alignment
```

:::div{.cell-output .cell-output-display}
    Some(Right)
:::
::::

::::div{.cell}
``` {.rust .cell-code}
use ratatui::widgets::Widget;

let (x, y, width, height) = (0, 0, 50, 5);
let area = ratatui::layout::Rect::new(x, y, width, height);
let mut buf = ratatui::buffer::Buffer::empty(area);

text![
    "left aligned bold text".bold(),
    "center aligned italic text".italic().into_centered_line(),
    "right aligned with yellow on black".yellow().on_black().into_right_aligned_line(),
].render(area, &mut buf);

show_html(buffer_to_html(&buf))
```

:::div{.cell-output .cell-output-display}
<div style="display: flex; justify-content:start; gap: 1em; margin: 1em">
<pre><code><span style="color: Reset;background-color: Reset;font-weight: bold;">l</span><span style="color: Reset;background-color: Reset;font-weight: bold;">e</span><span style="color: Reset;background-color: Reset;font-weight: bold;">f</span><span style="color: Reset;background-color: Reset;font-weight: bold;">t</span><span style="color: Reset;background-color: Reset;font-weight: bold;"> </span><span style="color: Reset;background-color: Reset;font-weight: bold;">a</span><span style="color: Reset;background-color: Reset;font-weight: bold;">l</span><span style="color: Reset;background-color: Reset;font-weight: bold;">i</span><span style="color: Reset;background-color: Reset;font-weight: bold;">g</span><span style="color: Reset;background-color: Reset;font-weight: bold;">n</span><span style="color: Reset;background-color: Reset;font-weight: bold;">e</span><span style="color: Reset;background-color: Reset;font-weight: bold;">d</span><span style="color: Reset;background-color: Reset;font-weight: bold;"> </span><span style="color: Reset;background-color: Reset;font-weight: bold;">b</span><span style="color: Reset;background-color: Reset;font-weight: bold;">o</span><span style="color: Reset;background-color: Reset;font-weight: bold;">l</span><span style="color: Reset;background-color: Reset;font-weight: bold;">d</span><span style="color: Reset;background-color: Reset;font-weight: bold;"> </span><span style="color: Reset;background-color: Reset;font-weight: bold;">t</span><span style="color: Reset;background-color: Reset;font-weight: bold;">e</span><span style="color: Reset;background-color: Reset;font-weight: bold;">x</span><span style="color: Reset;background-color: Reset;font-weight: bold;">t</span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span>
<span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;font-style: italic;">c</span><span style="color: Reset;background-color: Reset;font-style: italic;">e</span><span style="color: Reset;background-color: Reset;font-style: italic;">n</span><span style="color: Reset;background-color: Reset;font-style: italic;">t</span><span style="color: Reset;background-color: Reset;font-style: italic;">e</span><span style="color: Reset;background-color: Reset;font-style: italic;">r</span><span style="color: Reset;background-color: Reset;font-style: italic;"> </span><span style="color: Reset;background-color: Reset;font-style: italic;">a</span><span style="color: Reset;background-color: Reset;font-style: italic;">l</span><span style="color: Reset;background-color: Reset;font-style: italic;">i</span><span style="color: Reset;background-color: Reset;font-style: italic;">g</span><span style="color: Reset;background-color: Reset;font-style: italic;">n</span><span style="color: Reset;background-color: Reset;font-style: italic;">e</span><span style="color: Reset;background-color: Reset;font-style: italic;">d</span><span style="color: Reset;background-color: Reset;font-style: italic;"> </span><span style="color: Reset;background-color: Reset;font-style: italic;">i</span><span style="color: Reset;background-color: Reset;font-style: italic;">t</span><span style="color: Reset;background-color: Reset;font-style: italic;">a</span><span style="color: Reset;background-color: Reset;font-style: italic;">l</span><span style="color: Reset;background-color: Reset;font-style: italic;">i</span><span style="color: Reset;background-color: Reset;font-style: italic;">c</span><span style="color: Reset;background-color: Reset;font-style: italic;"> </span><span style="color: Reset;background-color: Reset;font-style: italic;">t</span><span style="color: Reset;background-color: Reset;font-style: italic;">e</span><span style="color: Reset;background-color: Reset;font-style: italic;">x</span><span style="color: Reset;background-color: Reset;font-style: italic;">t</span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span>
<span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Yellow;background-color: Black;">r</span><span style="color: Yellow;background-color: Black;">i</span><span style="color: Yellow;background-color: Black;">g</span><span style="color: Yellow;background-color: Black;">h</span><span style="color: Yellow;background-color: Black;">t</span><span style="color: Yellow;background-color: Black;"> </span><span style="color: Yellow;background-color: Black;">a</span><span style="color: Yellow;background-color: Black;">l</span><span style="color: Yellow;background-color: Black;">i</span><span style="color: Yellow;background-color: Black;">g</span><span style="color: Yellow;background-color: Black;">n</span><span style="color: Yellow;background-color: Black;">e</span><span style="color: Yellow;background-color: Black;">d</span><span style="color: Yellow;background-color: Black;"> </span><span style="color: Yellow;background-color: Black;">w</span><span style="color: Yellow;background-color: Black;">i</span><span style="color: Yellow;background-color: Black;">t</span><span style="color: Yellow;background-color: Black;">h</span><span style="color: Yellow;background-color: Black;"> </span><span style="color: Yellow;background-color: Black;">y</span><span style="color: Yellow;background-color: Black;">e</span><span style="color: Yellow;background-color: Black;">l</span><span style="color: Yellow;background-color: Black;">l</span><span style="color: Yellow;background-color: Black;">o</span><span style="color: Yellow;background-color: Black;">w</span><span style="color: Yellow;background-color: Black;"> </span><span style="color: Yellow;background-color: Black;">o</span><span style="color: Yellow;background-color: Black;">n</span><span style="color: Yellow;background-color: Black;"> </span><span style="color: Yellow;background-color: Black;">b</span><span style="color: Yellow;background-color: Black;">l</span><span style="color: Yellow;background-color: Black;">a</span><span style="color: Yellow;background-color: Black;">c</span><span style="color: Yellow;background-color: Black;">k</span>
<span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span>
<span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span><span style="color: Reset;background-color: Reset;"> </span>
</code></pre>
</div>
:::
::::

## Conclusion

In the next post, we'll examine the a few commonly used widgets.
