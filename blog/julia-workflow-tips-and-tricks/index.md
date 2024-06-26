---
title: "Julia Workflow Tips and Tricks"
subtitle: "For a Better Developer Experience"
summary: In this blog post, I present some ways you can improve your developer experience using Julia
date: 2023-08-12T21:14:15-0500
keywords: julia, tips, tricks, developer, experience, workflow
categories: [julia]
---

Julia is a high-performance, dynamic programming language designed for technical computing and data science.
The language offers a flexible and expressive syntax, and also delivers the performance benefits of compiled languages like C++.
Like Python, Julia also offers an interactive REPL (Read-Eval-Print Loop) environment for real-time data exploration and rapid prototyping.

If you are fairly new to Julia, here are a few things you might want to know to improve your developer experience.

## `startup.jl`

Every time you start Julia, it looks for a file named `startup.jl` in a `config` directory.

| Operating System | `startup.jl` Location                        |
| ---------------- | -------------------------------------------- |
| Windows          | `C:\Users\USERNAME\.julia\config\startup.jl` |
| macOS            | `/Users/USERNAME/.julia/config/startup.jl`   |
| Linux            | `/home/USERNAME/.julia/config/startup.jl`    |

This file is executed before the REPL starts, allowing you to customize your Julia environment.

For example, if you added the following code to your `startup.jl`, it would ensure that `Revise`, `OhMyREPL` and `BenchmarkTools` are always installed whenever you start Julia.

```julia
# Setup OhMyREPL and Revise
import Pkg
let
  pkgs = ["Revise", "OhMyREPL", "BenchmarkTools"]
  for pkg in pkgs
    if Base.find_package(pkg) === nothing
      Pkg.add(pkg)
    end
  end
end
```

::: callout-note
When adding packages in Julia, they are added by default to what's known as the "global environment".
While these packages can be readily used within the Julia REPL, they won't be available for import within Julia packages.

For those aiming to ensure reproducibility in code execution --- both for themselves and others --- it's essential to use dedicated, per-project local environments. This approach ensures that the same set of package versions are always used.

Personally, I reserve the global environment for packages that enhance my development workflow, such as `Revise`, `BenchmarkTools`, and `OhMyREPL`.
:::

[This thread on the JuliaLang Discourse](https://discourse.julialang.org/t/what-is-in-your-startup-jl/18228) has some neat examples of things you may want to add to your `startup.jl`.

If you wish to go one step further, you can create a Julia package called [Startup.jl](https://github.com/kdheepak/Startup.jl), place it anywhere on your computer and load it in `startup.jl` using the following code:

```julia
if Base.isinteractive()
  push!(LOAD_PATH, joinpath(ENV["HOME"], "gitrepos", "Startup.jl"))
  using Startup
end
```

The advantage of this approach is that the contents of `Startup.jl` can be precompiled and your Julia REPL starts up very quickly.

With the `Startup.jl` package approach, your root environment can be empty and you can still use functionality exposed by `Startup.jl`:

![Using `Startup.jl` to load `BenchmarkTools` with an empty root environment.](https://user-images.githubusercontent.com/1813121/260273629-af4095d5-81cf-4a28-aa64-f720def4a9d6.png){fig-align="center" width=75% clickable=true}

::: callout-tip
You can use `julia --startup-file=no` to _not_ execute the contents for `startup.jl`, i.e. get a clean Julia REPL.
:::

## `OhMyREPL`

[`OhMyREPL.jl`](https://github.com/KristofferC/OhMyREPL.jl) is a package that provides syntax highlighting, bracket highlighting, rainbow brackets, and more for the Julia REPL.
Once installed, it can enhance your REPL experience dramatically, making it more visually appealing and easier to work with.

::: {layout-ncol=2}

![](https://user-images.githubusercontent.com/1813121/260273560-ef15e720-6e45-4b16-8332-3d79d6fa1a56.png){width=50% align="center" clickable=true}

![](https://user-images.githubusercontent.com/1813121/260273561-bebffa42-3331-4ce4-a3ee-81df1dfa6d8e.png){width=51% align="center" clickable=true}

:::

## `Revise.jl`

[`Revise.jl`](https://github.com/timholy/Revise.jl) is a game-changer for Julia development.
It automatically reloads modified source files without restarting the Julia session.
This makes iterative development much smoother.

Once set up, any changes you make to your code files are immediately available in your active Julia session.

Revise can "track" changes in single files if you include them using `includet`:

![](https://user-images.githubusercontent.com/1813121/260360485-07d3e4bd-a4e3-406e-b513-7693d0cede01.gif){fig-align="center" width=75% clickable=true}

If you want `Revise` to track changes in a package you are developing locally, simply run `using Revise` before you load the package for the first time.

::: callout-note
If you use VSCode and start a REPL using the `Julia: Start REPL` command, `Revise` is automatically loaded by default.

![](https://user-images.githubusercontent.com/1813121/260358935-ccb1a3fb-3b7e-4219-a2f4-12f5c922c7da.png){fig-align="center" width=75% clickable=true}
:::

See [Revise's documentation](https://timholy.github.io/Revise.jl/stable/config/) for how to set this up to happen automatically all the time by adding setup code to your `startup.jl` file.

One of the issues with `Revise` is that it cannot deal with changes in `struct`.
Let's say I wanted to make a change like this:

```diff
  struct Foo
-   x::Int
+   y::Float64
  end
```

`Revise` throws an error and warning because it is unable to make that change; and `Revise` changes the color of the Julia prompt:

![](https://user-images.githubusercontent.com/1813121/260318027-906d7506-0c98-417f-9ef3-008d39097117.gif){fig-align="center" width=75% clickable=true}

There are some [workarounds](https://timholy.github.io/Revise.jl/stable/limitations/) for this but the easiest thing to do is to **restart the Julia session** after you are make changes to any `struct`.

::: callout-note
Watch for the `Revise` warnings and errors and keep an eye out for the color of your Julia REPL prompt. If you see the prompt in "yellow", you know `Revise` wasn't able to track a change you made.
:::

## `Infiltrator`

[`Infiltrator.jl`](https://github.com/JuliaDebug/Infiltrator.jl) is a debugger and code inspection tool for Julia.
It allows you to insert breakpoints in your code and inspect the current scope's variables.

When Julia hits the `@infiltrate` macro, it'll pause execution, and drop you into a Julia REPL that allows you to inspect the current scope.

![](https://user-images.githubusercontent.com/1813121/260319341-8f1d5ca9-f192-4277-abc3-be4f89dd8610.gif){fig-align="center" width=75% clickable=true}

You can also use `@infiltrate i == 3` and that'll drop you into a Julia REPL only in the third iteration of the `for` loop.

When using `@infiltrate conditional_expression` with `Revise`, you can jump into any function at any point of the execution to inspect values of variables in a Julia REPL.
You can even load additional packages like `DataFrames` or `Plots` to explore your data in the scope of any function interactively while debugging.
This combination can make for a versatile and productive debugging experience.

## `PrecompileTools`

[PrecompileTools](https://julialang.github.io/PrecompileTools.jl/stable/) is a package that allows package developers to specify which parts of the package should be precompiled.
From the official documentation:

> `PrecompileTools` can force precompilation of specific workloads; particularly with Julia 1.9 and higher, the precompiled code can be saved to disk, so that it doesn't need to be compiled freshly in each Julia session.
> You can use `PrecompileTools` as a package developer, to reduce the latency experienced by users of your package for "typical" workloads; you can also use `PrecompileTools` as a user, creating custom "Startup" package(s) that precompile workloads important for your work.

Precompiling Julia packages can significantly reduce the loading times for you and your users, providing a much more responsive experience.

For example, I have the following in my `Startup.jl` to reduce Julia REPL startup times:

```julia
module Startup

using PrecompileTools

@setup_workload begin
  @compile_workload begin
    using Pkg
    using Revise
    using OhMyREPL
  end
end

end
```

## `BenchmarkTools`

[BenchmarkTools.jl](https://github.com/JuliaCI/BenchmarkTools.jl) is an essential package to help quantify the performance of your code.
It provides utilities to benchmark code snippets, giving insights into their run-time and memory allocations.

The `@benchmark` macro runs a number of trials of a function and plots a histogram in the terminal showing what kind of performance you are getting out of that particular function.
As an example, we can compare the performance of a custom `sum` function without and with the `@simd` macro:

::: {layout-ncol=2}

![](https://user-images.githubusercontent.com/1813121/260319654-904e72cb-633d-490f-8fbc-fbef61fabb4f.png){ clickable=true }

![](https://user-images.githubusercontent.com/1813121/260319610-309b43b8-1476-43a3-a279-ab3c0158bc74.png){ clickable=true }

:::

## `Cthulhu`

Delving deep into Julia's compiler optimizations and type inference can sometimes feel daunting and that's where [`Cthulhu.jl`](https://github.com/JuliaDebug/Cthulhu.jl) comes to the rescue.
`Cthulhu` is an interactive terminal user interface that is an alternative to `@code_lowered` and `@code_typed`, and allows developers to interactively "descend" into the lowered and optimized versions of their Julia code, making it easier to debug performance issues and understand how Julia's JIT compiler optimizes code.

For example, if we examine the `mysum` function from the previous section, we can see that `a` is being inferred as a `Int64` or a `Float64`, i.e. `Union{Float64, Int64}`.

![](https://user-images.githubusercontent.com/1813121/260274805-ea3dcdbd-a750-4b4a-8869-ea7ee9d92e8b.png){fig-align="center" width=75% clickable=true}

In this particular case, by changing `a = 0` to `a = 0.0`, we can make the code generated by Julia more optimized, i.e. `a` is now being inferred only as a `Float64`.

![](https://user-images.githubusercontent.com/1813121/260308464-07577d0f-e577-40a7-bb96-3a109f53a815.png){fig-align="center" width=75% clickable=true}

Here's the benchmark results with `a = 0` (left) and `a = 0.0` (right), with the latter being almost 3 times faster.

::: {layout-ncol=2}

![](https://user-images.githubusercontent.com/1813121/260308638-a34e64bd-0ed4-4a5c-a9d1-51710a005699.png){fig-alt="`a = 0`" width=50% clickable=true}

![](https://user-images.githubusercontent.com/1813121/260308548-b8667f60-5caf-4974-9d5d-cfc7280a0ed2.png){fig-alt="`a = 0.0`" width=50% clickable=true}

:::

## `ReTest` and `InlineTests`

Julia has a built-in package `Test` for unit testing.
This requires writing tests in a separate folder, i.e. in `test/runtests.jl`; and these tests are run in a separate process when you can `Pkg.test()`.
There's also no out of the box solution to run a subset of tests.

Using `InlineTests` allows you to write tests directly in your source files, and you can also choose to run a subset of tests.
If you choose to run it with `retest`, you can make changes that are tracked with `Revise`, allowing faster iteration using a test driven development workflow.

In the screenshot below, I have shown an example of having a `@testset` as part of the package itself, i.e. in `./src/layout.jl`:

![`InlineTests` allows co-locating tests along with the implementation.](https://user-images.githubusercontent.com/1813121/260308140-a1b24006-3495-4d3a-8534-c6bb24a621c8.png){ clickable=true }

You'll also notice from the screenshot that `ReTest` contains a function called `retest` which allows running a subset of tests by passing in a pattern as the second argument.

::: callout-tip

You may also be interested in [`TestEnv.jl`](https://github.com/JuliaTesting/TestEnv.jl), which lets you activate the test environment of a given package.

:::

## `PkgTemplates`

Julia has a built-in way to create a new package, using `Pkg.generate()`.
However, [`PkgTemplates.jl`](https://github.com/invenia/PkgTemplates.jl) is a package that makes the process of creating new packages as easy and customizable at the same time.
`PkgTemplates` can generate new Julia packages with numerous features out-of-the-box that follow best practices (e.g. GitHub Actions, Documenter, etc).

Creating a new package then becomes as straightforward as running the following:

```julia
using PkgTemplates
t = Template()
t("MyNewPackage")
```

You can customize the template too:

```julia
using PkgTemplates
t = Template(
  dir = "~/gitrepos/",
  julia = v"1.10",
  plugins = [
    Git(; ssh = true, manifest = true),
    GitHubActions(),
    Documenter{GitHubActions}(),
  ],
)
t("MyNewPackage")
```

## `JET`

[`JET.jl`](https://github.com/aviatesk/JET.jl) is a powerful static code analyzer tailored for the Julia programming language.
`JET` serves as a "linter" – identifying potential runtime errors without actually executing the code.
It works by simulating the Julia compiler's type inference process.

```julia
fib(n) = n ≤ 2 ? n : fib(n-1) + fib(n-2)

fib(1000)   # => never terminates
fib(m)      # => ERROR: UndefVarError: `m` not defined
fib("1000") # => ERROR: MethodError: no method matching isless(::String, ::Int64)
```

You can see the other kinds of warnings that `JET` can produce in the [`demo.jl file`](https://github.com/aviatesk/JET.jl/blob/master/demo.jl).

## `LiveServer`

[`LiveServer.jl`](https://github.com/tlienart/LiveServer.jl) allows developers to serve static sites locally and refreshes your browser automatically as you edit source files.
You can even use it to view or update documentation.

```julia
# serve contents of any folder
LiveServer.serve(; dir, launch_browser = true)

# serve documentation of any package
Pkg.activate("./docs")
LiveServer.servedocs(; launch_browser = true)
```

## `Comonicon`

[Comonicon.jl](https://github.com/comonicon/Comonicon.jl) is a rich tool for building command-line applications.
Comonicon allows you to easily convert your Julia scripts and packages into command-line tools with minimal effort.

Using Comonicon, you can:

- Parse command-line arguments
- Generate help messages
- Handle subcommands
- And more

For example, I've added into my [`Startup.jl/src/jl.jl`](https://github.com/kdheepak/Startup.jl/blob/d1959b2d08868b04d3f33911b6260275bb22a34b/src/jl.jl) some helper subcommands that I can access from that command line in any folder.

![](https://user-images.githubusercontent.com/1813121/260335151-77fd4892-ae97-49e2-ab54-7b2fee44bda0.png){ clickable=true }

## Conclusion

Julia's ecosystem is filled with tools designed to optimize the developer's workflow, making it easier and more efficient to write, test, and deploy code.
