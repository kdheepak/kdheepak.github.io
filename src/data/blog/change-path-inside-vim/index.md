---
title: Change `$PATH` inside vim
date: 2015-09-19T09:05:36-06:00
description: guide to updating PATH from inside Vim.
tags:
  - neovim
  - osx
keywords: neovim, vim, osx, change path, set path,
---

Save the following script in `/usr/local/bin/cpvim`

```zsh
#!/bin/zsh
source ~/.zshrc > /dev/null 2>&1
PATH=$VIM_PATH
exec nvim "$@"
```

Add the following to your .zshrc

```zsh
alias vim=/usr/local/bin/cpvim
```
