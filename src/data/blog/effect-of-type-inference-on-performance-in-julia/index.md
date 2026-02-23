---
title: "Effect of type inference on performance in Julia"
date: 2024-04-21T00:27:32-04:00
tags: ["julia"]
keywords: ["julia"]
description: analysis of how type inference affects performance in Julia.
notebookPath: "src/data/blog/effect-of-type-inference-on-performance-in-julia/index.ipynb"
---

To ensure that the code you write in Julia executes fast and
efficiently, there's a number of general tips and guidelines that you
can follow. You can find a full list of useful tips the [Performance
Tips](https://docs.julialang.org/en/v1/manual/performance-tips/) section
in the official manual.

In this blog post, I want to touch on one specific performance tip:
using containers with concrete type parameters and how type inference
can affect that.

## Toy problem

Let's define a toy problem to work with.

:::div{.cell}
``` {.julia .cell-code}
abstract type Shape end
area(::Shape) = 0.0

@kwdef struct Square <: Shape
    side::Float64 = rand()
end
area(s::Square) = s.side * s.side

@kwdef struct Rectangle <: Shape
    width::Float64 = rand()
    height::Float64 = rand()
end
area(r::Rectangle) = r.width * r.height

@kwdef struct Triangle <: Shape
    base::Float64 = rand()
    height::Float64 = rand()
end
area(t::Triangle) = 1.0/2.0 * t.base * t.height

@kwdef struct Circle <: Shape
    radius::Float64 = rand()
end
area(c::Circle) = π * c.radius^2

nothing #| hide_line
```
:::

We can use the builtin `Test` module to check that the code we wrote is
correct.

::::div{.cell}
``` {.julia .cell-code}
using Test
@testset "Areas" begin
    @test area(Square(2)) == 4
    @test area(Rectangle(2,3)) == 6
    @test area(Triangle(2,3)) == 3
    @test area(Circle(2)) ≈ 4π
end
nothing #| hide_line
```

:::div{.cell-output .cell-output-display}
    Test Summary: | Pass  Total  Time
    Areas         |    4      4  0.1s
:::
::::

Let's build 1 million random shapes:

:::div{.cell}
``` {.julia .cell-code}
using Random
Random.seed!(42)

COUNT = 1_000_000
shapes = [rand((Square,Rectangle,Triangle,Circle))() for _ in 1:COUNT]

nothing #| hide_line
```
:::

::::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.julia .cell-code}
using Format
using Markdown
len = cfmt("%'d", length(shapes))
number_of(T) = cfmt("%'d", count(s->isa(s, T), shapes))

display(Markdown.md"The total number of shapes we have in the array is $len. In this array, there's $(number_of(Square)) squares, $(number_of(Rectangle)) rectangles,
$(number_of(Triangle)) triangles, and $(number_of(Circle)) circles.")
```

</details>

:::div{.cell-output .cell-output-display}
The total number of shapes we have in the array is 1,000,000. In this
array, there's 249,740 squares, 249,980 rectangles, 249,831 triangles,
and 250,449 circles.
:::
::::

## Type inference

Here's the type trees for the `Shape`:

::::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.julia .cell-code}
for s in subtypes(Shape)
    println(join(string.(supertypes(s)), " <: "))
end
```

</details>

:::div{.cell-output .cell-output-display}
    Circle <: Shape <: Any
    Rectangle <: Shape <: Any
    Square <: Shape <: Any
    Triangle <: Shape <: Any
:::
::::

By default, Julia will infer the generic type for a container as close
to the bottom of the tree that fits all the data in that container.

For example, if we just built a vector with the just `Square`s, Julia
will infer the container to be `Vector{Square}`. But if there are
different elements Julia will infer the generic type parameter as a
`Shape`.

::::div{.cell}
``` {.julia .cell-code}
@show typeof([Square() for _ in 1:COUNT])
@show typeof([rand((Square,Rectangle))() for _ in 1:COUNT])
nothing #| hide_line
```

:::div{.cell-output .cell-output-display}
    typeof([Square() for _ = 1:COUNT]) = Vector{Square}
    typeof([(rand((Square, Rectangle)))() for _ = 1:COUNT]) = Vector{Shape}
:::
::::

Let's filter out shapes of a specific kind so that each array contains
data of the same type. You might think to write this function like so:

:::div{.cell}
``` {.julia .cell-code}
bad_shapes_by_type(::Type{T}, shapes) where T<:Shape = filter(s -> isa(s, T), shapes)
nothing #| hide_line
```
:::

However, while this function works, it has a subtle issue. It returns a
type of `Vector{Shape}`.

Julia is a dynamic language. And it can be easy to accidentally
construct a container with an abstract type for the type parameter of a
generic type, even if there is only one type in container.

::::div{.cell}
``` {.julia .cell-code}
shape_arr1 = bad_shapes_by_type(Square, shapes)
shape_arr2 = bad_shapes_by_type(Rectangle, shapes)
shape_arr3 = bad_shapes_by_type(Triangle, shapes)
shape_arr4 = bad_shapes_by_type(Circle, shapes)

@show typeof(shape_arr1)
@show typeof(shape_arr2)
@show typeof(shape_arr3)
@show typeof(shape_arr4)

nothing #| hide_line
```

:::div{.cell-output .cell-output-display}
    typeof(shape_arr1) = Vector{Shape}
    typeof(shape_arr2) = Vector{Shape}
    typeof(shape_arr3) = Vector{Shape}
    typeof(shape_arr4) = Vector{Shape}
:::
::::

This can happen if the Julia compiler cannot infer the types at the
"compile time" of the function.

Here, `Shape` is an abstract type, even if `Vector{Shape}` is concrete.

::::div{.cell}
``` {.julia .cell-code}
@show isconcretetype(Shape)
@show isconcretetype(Vector{Shape})
nothing #| hide_line
```

:::div{.cell-output .cell-output-display}
    isconcretetype(Shape) = false
    isconcretetype(Vector{Shape}) = true
:::
::::

For better performance in Julia, it helps to have concrete types in the
generic parameters for a container. We can do this by helping the
compiler by in this case explicitly listing the generic type parameter
before the brackets for constructing the array, i.e. `T[...]`.

:::div{.cell}
``` {.julia .cell-code}
good_shapes_by_type(::Type{T}, shapes) where T<:Shape = T[shape for shape in filter(s -> isa(s, T), shapes)]
nothing #| hide_line
```
:::

With this function, we get `Vector{Square}` for an array with only
squares in it.

::::div{.cell}
``` {.julia .cell-code}
square_arr = good_shapes_by_type(Square, shapes)
rectangle_arr = good_shapes_by_type(Rectangle, shapes)
triangle_arr = good_shapes_by_type(Triangle, shapes)
circle_arr = good_shapes_by_type(Circle, shapes)

@show typeof(square_arr)
@show typeof(rectangle_arr)
@show typeof(triangle_arr)
@show typeof(circle_arr)

nothing #| hide_line
```

:::div{.cell-output .cell-output-display}
    typeof(square_arr) = Vector{Square}
    typeof(rectangle_arr) = Vector{Rectangle}
    typeof(triangle_arr) = Vector{Triangle}
    typeof(circle_arr) = Vector{Circle}
:::
::::

As we'll see in the next section, this can have significant impacts on
performance.

## Benchmarks

Let's combine these arrays back into different vectors that have
different type parameters for illustration purposes:

::::div{.cell}
``` {.julia .cell-code}
sorted_shapes_shape = vcat(square_arr, rectangle_arr, triangle_arr, circle_arr);
sorted_shapes_any = Any[s for s in sorted_shapes_shape];
sorted_shapes_union = Union{Square, Rectangle, Triangle, Circle}[s for s in sorted_shapes_shape];

@show typeof(sorted_shapes_shape)
@show typeof(sorted_shapes_any)
@show typeof(sorted_shapes_union)

nothing #| hide_line
```

:::div{.cell-output .cell-output-display}
    typeof(sorted_shapes_shape) = Vector{Shape}
    typeof(sorted_shapes_any) = Vector{Any}
    typeof(sorted_shapes_union) = Vector{Union{Circle, Rectangle, Square, Triangle}}
:::
::::

We can benchmark the performance of these different types using
`BenchmarkTools`:

:::div{.cell}
``` {.julia .cell-code}
using BenchmarkTools
```
:::

Let's define a `main1` function that calculates the sum over all the
`area`s of every element in an array.

::::div{.cell}
``` {.julia .cell-code}
main1(arr) = sum(area, arr)
```

:::div{.cell-output .cell-output-display}
    main1 (generic function with 1 method)
:::
::::

And let's run a benchmark for `sorted_shapes_shape` and
`sorted_shapes_any`.

:::::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.julia .cell-code}
@show typeof(sorted_shapes_shape)
@benchmark main1($sorted_shapes_shape)
```

</details>

:::div{.cell-output .cell-output-display}
    typeof(sorted_shapes_shape) = Vector{Shape}
:::

:::div{.cell-output .cell-output-display}
    BenchmarkTools.Trial: 149 samples with 1 evaluation.
     Range (min … max):  30.965 ms … 39.555 ms  ┊ GC (min … max): 0.00% … 15.18%
     Time  (median):     31.960 ms              ┊ GC (median):    0.00%
     Time  (mean ± σ):   33.628 ms ±  3.074 ms  ┊ GC (mean ± σ):  5.43% ±  7.30%

      █▇ ▁ ▁
      ██▆███▆▆▆▄▇▃▃▃▁▁▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃▁▃▃▁▅▆▅▆▄█▄▃▃▁▃▁▃ ▃
      31 ms           Histogram: frequency by time        39.5 ms <

     Memory estimate: 30.52 MiB, allocs estimate: 1999999.
:::
:::::

:::::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.julia .cell-code}
@show typeof(sorted_shapes_any)
@benchmark main1($sorted_shapes_any)
```

</details>

:::div{.cell-output .cell-output-display}
    typeof(sorted_shapes_any) = Vector{Any}
:::

:::div{.cell-output .cell-output-display}
    BenchmarkTools.Trial: 145 samples with 1 evaluation.
     Range (min … max):  31.421 ms … 41.560 ms  ┊ GC (min … max): 0.00% … 15.62%
     Time  (median):     32.909 ms              ┊ GC (median):    0.00%
     Time  (mean ± σ):   34.479 ms ±  3.233 ms  ┊ GC (mean ± σ):  5.20% ±  7.07%

      ▇██ ▂▃ ▂▄ ▃
      ███▅██▄██▆█▆▅▅▃▁▃▁▃▄▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▄▇▁▄▅▄▇▇▃▁▃▅▃▃▁▅▄▄▁▄▁▄ ▃
      31.4 ms         Histogram: frequency by time        41.3 ms <

     Memory estimate: 30.52 MiB, allocs estimate: 1999999.
:::
:::::

Both benchmarks for `Vector{Shape}` and `Vector{Any}` are similar in
performance to each other.

The Julia manual has the following to say:

> If you cannot avoid containers with abstract value types, it is
> sometimes better to parametrize with `Any` to avoid runtime type
> checking. E.g. `IdDict{Any, Any}` performs better than
> `IdDict{Type, Vector}`

What is interesting is that `Union{Circle, Rectangle, Square, Triangle}`
can perform better than `Shape` or `Any` when used as a concrete type
parameter.

You can see difference show up clearly in the performance benchmark:

:::::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.julia .cell-code}
@show typeof(sorted_shapes_union)
@benchmark main1($sorted_shapes_union)
```

</details>

:::div{.cell-output .cell-output-display}
    typeof(sorted_shapes_union) = Vector{Union{Circle, Rectangle, Square, Triangle}}
:::

:::div{.cell-output .cell-output-display}
    BenchmarkTools.Trial: 5289 samples with 1 evaluation.
     Range (min … max):  928.875 μs …  1.078 ms  ┊ GC (min … max): 0.00% … 0.00%
     Time  (median):     940.084 μs              ┊ GC (median):    0.00%
     Time  (mean ± σ):   942.846 μs ± 10.779 μs  ┊ GC (mean ± σ):  0.00% ± 0.00%

           ▂▄▆██▇█▆▃▃▂ ▁                                           ▂
      ▅▅▆▇████████████████████▇█▇▇▇▆▆▇▆▅▆▆▅▅▅▅▆▆▆▅▃▅▆▅▆▅▅▇▇▆▃▅▅▄▅▄ █
      929 μs        Histogram: log(frequency) by time       995 μs <

     Memory estimate: 0 bytes, allocs estimate: 0.
:::
:::::

::::div{.cell}
:::div{.cell-output .cell-output-display}
`Vector{Union{Circle, Rectangle, Square, Triangle}}` is faster than
`Vector{Shape}` by roughly a factor of 36 times.
:::
::::

It's possible to get even better performance by calculating the `sum`s
for the individual arrays and summing them up at the end.

::::div{.cell}
``` {.julia .cell-code}
main2(arrs...) = sum(main1, arrs)

@benchmark main2($square_arr, $rectangle_arr, $triangle_arr, $circle_arr)
```

:::div{.cell-output .cell-output-display}
    BenchmarkTools.Trial: 10000 samples with 1 evaluation.
     Range (min … max):  273.625 μs … 357.208 μs  ┊ GC (min … max): 0.00% … 0.00%
     Time  (median):     279.583 μs               ┊ GC (median):    0.00%
     Time  (mean ± σ):   281.245 μs ±   5.297 μs  ┊ GC (mean ± σ):  0.00% ± 0.00%

              ▂▇█▇▄▂▄▅▄▂ ▁▁                                         ▂
      ▂▂▂▂▄▄▆▆█████████████▇▇▇█▇▇▆▆▆▆▆▇▇▆▆▆▇▇▆▇▇▇▆▆▆▆▆▆▅▄▆▇▅▆▆▄▅▅▅▄ █
      274 μs        Histogram: log(frequency) by time        307 μs <

     Memory estimate: 0 bytes, allocs estimate: 0.
:::
::::

This performance is almost equivalent to having a uniform type
(e.g. just `Square`s).

::::div{.cell}
``` {.julia .cell-code}
squares = [Square() for _ in 1:COUNT]

@benchmark main1($squares)
```

:::div{.cell-output .cell-output-display}
    BenchmarkTools.Trial: 10000 samples with 1 evaluation.
     Range (min … max):  236.958 μs … 342.708 μs  ┊ GC (min … max): 0.00% … 0.00%
     Time  (median):     237.542 μs               ┊ GC (median):    0.00%
     Time  (mean ± σ):   239.297 μs ±   4.834 μs  ┊ GC (mean ± σ):  0.00% ± 0.00%

      ▆█▅▃▂▁▁▅▄▂   ▁                                                ▁
      ███████████▇▇██▆▆▆▆▇█▇▇▅▆▆▆▆▆▅▅▅▅▄▄▆▇██▇▇▆▇▆▆▅▆▅▅▅▄▅▄▄▅▃▄▅▄▄▅ █
      237 μs        Histogram: log(frequency) by time        262 μs <

     Memory estimate: 0 bytes, allocs estimate: 0.
:::
::::

Keep in mind that we would only get this kind of performance if the type
parameter is concrete. If we used `Vector{Shape}` values instead, we'd
get poor performance results:

::::div{.cell}
``` {.julia .cell-code}
@benchmark main2($shape_arr1, $shape_arr2, $shape_arr3, $shape_arr4)
```

:::div{.cell-output .cell-output-display}
    BenchmarkTools.Trial: 111 samples with 1 evaluation.
     Range (min … max):  41.965 ms … 54.020 ms  ┊ GC (min … max): 0.00% … 15.22%
     Time  (median):     43.359 ms              ┊ GC (median):    0.00%
     Time  (mean ± σ):   45.287 ms ±  3.798 ms  ┊ GC (mean ± σ):  4.51% ±  6.46%

      █▄  ▁▅  ▁
      ██▆▅███▇█▃▅▁▃▅▄▃▃▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃▁▄▃▄▁▅▁▅▄▄▃▁▁▃▄▅▁▄▄▄▁▃ ▃
      42 ms           Histogram: frequency by time        53.2 ms <

     Memory estimate: 30.52 MiB, allocs estimate: 2000002.
:::
::::

## Struct with type parameters

In Julia, `struct`s can have untyped fields.

:::div{.cell}
``` {.julia .cell-code}
struct Foo
    a
end

# is equivalent to this

struct Foo
    a::Any
end
```
:::

If you want performant code, you have to ensure fields are specified
with concrete types, like so:

:::div{.cell}
``` {.julia .cell-code}
struct FooSpecialized
    a::Float64
end
```
:::

`struct`s can also have generic type parameters

:::div{.cell}
``` {.julia .cell-code}
struct Bar{T}
    a::T
end
```
:::

In this case, when constructing the type, you want to ensure that
concrete types are used to instantiate the type.
e.g. `Bar{AbstractFloat}(1.0)` is going to perform less efficiently
compared to `Bar{Float64}(1.0)`.

`Bar(x)` will use type inference to decide what the value of the type
parameter should be.

::::div{.cell}
``` {.julia .cell-code}
@show typeof(Bar(sorted_shapes_shape))
@show typeof(Bar(sorted_shapes_any))
@show typeof(Bar(sorted_shapes_union))

nothing #| hide_line
```

:::div{.cell-output .cell-output-display}
    typeof(Bar(sorted_shapes_shape)) = Bar{Vector{Shape}}
    typeof(Bar(sorted_shapes_any)) = Bar{Vector{Any}}
    typeof(Bar(sorted_shapes_union)) = Bar{Vector{Union{Circle, Rectangle, Square, Triangle}}}
:::
::::

There's a lot more useful information in [Type
Declarations](https://docs.julialang.org/en/v1/manual/performance-tips/#Type-declarations)
section of the performance tips.

## Conclusion

The key takeaway is that if you care about performance in Julia, you
have to be mindful of types and type inference! Keeping types as
concrete as possible is important because when type inference fails, it
can propogate through your program. Even small changes to your code can
improve performance significantly.

Many thanks to the helpful [Julia community on
Discourse](https://discourse.julialang.org/t/unusual-non-deterministic-benchmark-results/113273/)
for always offering insightful comments and advice.
