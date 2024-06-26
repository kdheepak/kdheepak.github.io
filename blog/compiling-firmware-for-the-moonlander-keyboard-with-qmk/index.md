---
title: Compiling firmware for the Moonlander keyboard with QMK
date: 2022-03-19T20:40:31-06:00
categories: [keyboards]
keywords: moonlander, qmk, keyboard, compile, firmware
summary: Summary of steps to compile firmware for moonlander keyboard using QMK
---

First, clone the `qmk_firmware` GitHub repo, and make a fork to maintain your custom keyboard firmware.
This is what my remotes look like:

```bash
cd qmk_firmware
git remote -v
```

::: cell-output

```
origin	git@github.com:kdheepak/qmk_firmware.git (fetch)
origin	git@github.com:kdheepak/qmk_firmware.git (push)
qmk	git@github.com:qmk/qmk_firmware.git (fetch)
qmk	git@github.com:qmk/qmk_firmware.git (push)
```

:::

Then, compile the firmware using the following from the root of the repository:

```bash
make moonlander:kdheepak:flash
```

The keymaps are located here:

```bash
ls keyboards/moonlander/keymaps/kdheepak
```

::: cell-output

```
Permissions Size Date Modified Git Name
.rw-r--r--   250 21 Mar 03:54   -- config.h
.rw-r--r--  5.7k 21 Mar 03:54   -- keymap.c
.rw-r--r--   292 21 Mar 03:54   -- rules.mk
```

:::

Modify `keymap.c` based on your preferences.
