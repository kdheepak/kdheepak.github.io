---
title: Building TUI apps in rust
date: 2023-05-30T22:21:30-0400
categories: [rust, tui]
keywords: TUI Rust
draft: true
---

My favourite way to build TUI apps is using [ratatui](https://github.com/tui-rs-revival/ratatui).

Here's a number of crates I typically end up depending on:

```
cargo add ratatui log log4rs crossterm termwiz chrono better-panic anyhow clap dirs versions regex serde serde_json unicode-segmentation unicode-width unicode-truncate uuid shellexpand shlex rand futures itertools
```
