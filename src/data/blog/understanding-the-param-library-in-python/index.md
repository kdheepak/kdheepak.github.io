---
title: "Understanding the param library in python"
date: 2025-01-11T21:03:04-05:00
tags: ["python"]
keywords: ["python, param, panel, jupyter, holoviews, holoviz"]
description: "hands-on introduction to the Param library in Python."
draft: true
---

:::div{.cell}
<details class="code-fold">
<summary>Code</summary>

``` {.python .cell-code}
################################################################################

# autoreload all modules every time before executing the Python code
%reload_ext autoreload
%autoreload 2

################################################################################

from IPython.core.interactiveshell import InteractiveShell

# `ast_node_interactivity` is a setting that determines how the return value of the last line in a cell is displayed
# with `last_expr_or_assign`, the return value of the last expression is displayed unless it is assigned to a variable
InteractiveShell.ast_node_interactivity = "last_expr_or_assign"
```

</details>
:::

The `holoviz` ecosystem is a powerful set of libraries that can help
build interactive dashboards and UIs. The `param` library is a core
piece of the `holoviz` ecosystem. Understanding how this library
underneath it all works can help you build more interactive, flexible,
and reusable code. In this post, we will build a tiny param library to
understand how things works.

## Background

You may have already heard that in Python, pretty much *everything* is
an object. What this means in practice is that in Python, there exists
an allocated piece of memory which represents some data that has an
address and a label that points to that address.

::::div{.cell}
``` {.python .cell-code}
x = 123456789
```

:::div{.cell-output .cell-output-display}
    123456789
:::
::::

::::div{.cell}
``` {.python .cell-code}
type(x)
```

:::div{.cell-output .cell-output-display}
    int
:::
::::

In this statement above, `x` is a "label" that points to the "memory
address of an object" that contains the value `123456789` and the object
that `x` points to is of type `int`.

``` mermaid
graph TD
    subgraph CPython_Object["CPython Object"]
        typePointer["Type Pointer"]
        refCount["Reference Count"]
        value["Value: 123456789"]
    end

    x["x (Label)"] --> CPython_Object
    CPython_Object --> typePointer
    CPython_Object --> refCount
    CPython_Object --> value
```

In this post you'll see language like "`x` is a"label" to the value
`123456789`", but most commonly, people refer to `x` as a **variable**.

The **address** of a "label" or "variable" can be found using the `id()`
function.

::::div{.cell}
``` {.python .cell-code}
hex(id(x))
```

:::div{.cell-output .cell-output-display}
    '0x105860b90'
:::
::::

Notice that if we create overwrite the `x` label with an assignment to a
*new* object with the same value, the `id()` function will return a
different address.

::::div{.cell}
``` {.python .cell-code}
x = 123456789
```

:::div{.cell-output .cell-output-display}
    123456789
:::
::::

::::div{.cell}
``` {.python .cell-code}
hex(id(x))
```

:::div{.cell-output .cell-output-display}
    '0x105860cb0'
:::
::::

``` mermaid
graph TD
    subgraph CPython_Object1["CPython Object"]
        typePointer1["Type Pointer"]
        refCount1["Reference Count"]
        value1["Value: 123456789"]
    end

    subgraph CPython_Object2["CPython Object"]
        typePointer2["Type Pointer"]
        refCount2["Reference Count"]
        value2["Value: 123456789"]
    end

    x1["x (Label)"] --> CPython_Object1
    CPython_Object1 --> typePointer1
    CPython_Object1 --> refCount1
    CPython_Object1 --> value1

    x2["x (Label)"] --> CPython_Object2
    CPython_Object2 --> typePointer2
    CPython_Object2 --> refCount2
    CPython_Object2 --> value2
```

But if we create a *new* `y` binding to the *same* object, the `id()`
function will return the same address.

::::div{.cell}
``` {.python .cell-code}
y = x
```

:::div{.cell-output .cell-output-display}
    123456789
:::
::::

::::div{.cell}
``` {.python .cell-code}
hex(id(y))
```

:::div{.cell-output .cell-output-display}
    '0x105860cb0'
:::
::::

::::div{.cell}
``` {.python .cell-code}
hex(id(x)) == hex(id(y))
```

:::div{.cell-output .cell-output-display}
    True
:::
::::

``` mermaid
graph TD
    subgraph CPython_Object["CPython Object"]
        typePointer["Type Pointer"]
        refCount["Reference Count"]
        value["Value: 123456789"]
    end

    x["x (Label)"] --> CPython_Object
    CPython_Object --> typePointer
    CPython_Object --> refCount
    CPython_Object --> value

    y["y (Label)"] --> CPython_Object
```

<div>

::: callout-note

Interestingly, Python caches small integers and strings, so the `id()`
function will return the same address for small integers and strings.

:::: {.cell quarto-private-1="{\"key\":\"execution\",\"value\":{\"iopub.execute_input\":\"2025-01-09T00:39:08.262046Z\",\"iopub.status.busy\":\"2025-01-09T00:39:08.261351Z\",\"iopub.status.idle\":\"2025-01-09T00:39:08.284825Z\",\"shell.execute_reply\":\"2025-01-09T00:39:08.284481Z\",\"shell.execute_reply.started\":\"2025-01-09T00:39:08.262008Z\"}}" execution_count="10"}
``` {.python .cell-code}
x = 42
y = 42
hex(id(x)) == hex(id(x))
```

::: {.cell-output .cell-output-display execution_count="10"}
    True
:::
::::

:::: {.cell quarto-private-1="{\"key\":\"execution\",\"value\":{\"iopub.execute_input\":\"2025-01-09T00:39:17.690814Z\",\"iopub.status.busy\":\"2025-01-09T00:39:17.689729Z\",\"iopub.status.idle\":\"2025-01-09T00:39:17.705109Z\",\"shell.execute_reply\":\"2025-01-09T00:39:17.704767Z\",\"shell.execute_reply.started\":\"2025-01-09T00:39:17.690776Z\"}}" execution_count="11"}
``` {.python .cell-code}
x = 123456789
y = 123456789
hex(id(x)) == hex(id(y))
```

::: {.cell-output .cell-output-display execution_count="11"}
    False
:::
::::

:::

</div>

This example shows integers, because even though they are immutable and
even though they are built-in types and one of most basic units of data,
they are still "objects" in Python. Pretty much everything in python is
an "object".

Most commonly, when people say "object" in Python, they are referring to
"instances of a class".

::::div{.cell}
``` {.python .cell-code}
class Foo:
    ...

f = Foo()
```

:::div{.cell-output .cell-output-display}
    <__main__.Foo at 0x1058654f0>
:::
::::

Python prints the address of the object when you print an instance of a
class.

::::div{.cell}
``` {.python .cell-code}
hex(id(f))
```

:::div{.cell-output .cell-output-display}
    '0x1058654f0'
:::
::::

In Python, classes, modules, functions, and methods are all objects.
They all are "labels" or "variables" that point to an address in memory.

:::div{.cell}
``` {.python .cell-code}
def my_func():
    print("hello world")
```
:::

::::div{.cell}
``` {.python .cell-code}
hex(id(my_func))
```

:::div{.cell-output .cell-output-display}
    '0x105833420'
:::
::::

And in Python, we can assign a new "label" or a new "variable" to the
same function object.

::::div{.cell}
``` {.python .cell-code}
x = my_func
```

:::div{.cell-output .cell-output-display}
    <function __main__.my_func()>
:::
::::

::::div{.cell}
``` {.python .cell-code}
x()
```

:::div{.cell-output .cell-output-display}
    hello world
:::
::::

The other key piece of background information is that in Python, when
calling a function, the arguments are "passed by reference" and assigned
to the variables in the arguments of function. This means that when you
pass an argument to a function, you are passing the address of the
object that the argument points to.

:::div{.cell}
``` {.python .cell-code}
def print_id_of_arg(arg):
    print(hex(id(arg)))
```
:::

::::div{.cell}
``` {.python .cell-code}
print_id_of_arg(my_func)
```

:::div{.cell-output .cell-output-display}
    0x105833420
:::
::::

This is equivalent to executing the following code:

::::div{.cell}
``` {.python .cell-code}
arg = my_func
print(hex(id(arg)))
```

:::div{.cell-output .cell-output-display}
    0x105833420
:::
::::

And it doesn't matter what the name of the label is, only the address of
the object that the label points to, and the object and type of the
object at that address is important.

::::div{.cell}
``` {.python .cell-code}
print_id_of_arg(x)
```

:::div{.cell-output .cell-output-display}
    0x105833420
:::
::::

With that background, let's build a tiny param library to understand how
it works.

## Understanding properties and descriptors in Python

In Python, a property is a special kind of attribute that allows you to
define custom behavior when getting or setting the value of an
attribute. Properties are defined using the `property()` function or by
using the `@property` decorator. The `property()` function takes four
arguments: `fget`, `fset`, `fdel`, and `doc`. The first three arguments
are functions that define the behavior of the property when getting,
setting, or deleting the attribute. The fourth argument is a string that
provides documentation for the property.

Let's say you wanted to build a person class:

::::div{.cell}
``` {.python .cell-code}
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Person(name={self.name}, age={self.age})"

person = Person("Alice", 30)

person.age += 1

person
```

:::div{.cell-output .cell-output-display}
    Person(name=Alice, age=31)
:::
::::

But you want to make sure that the `age` attribute is always a positive
integer. You can use a property to enforce this constraint.

::::div{.cell}
``` {.python .cell-code}

class Person:
    def __init__(self, name, age):
        self.name = name
        self._age = None
        self.age = age  # Use the setter to set the initial value

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if not isinstance(value, int) or value < 0:
            raise ValueError("Age must be a positive integer")
        self._age = value

    @age.deleter
    def age(self):
        del self._age
        self._age = None

    def __repr__(self):
        return f"Person(name={self.name}, age={self.age})"
p = Person("Alice", 30)

```

:::div{.cell-output .cell-output-display}
    Person(name=Alice, age=30)
:::
::::

::::div{.cell}
``` {.python .cell-code}
p.age = 35
p
```

:::div{.cell-output .cell-output-display}
    Person(name=Alice, age=35)
:::
::::

::::div{.cell}
``` {.python .cell-code}
p.age = -5
```

:::div{.cell-output .cell-output-display}
    ValueError: Age must be a positive integer
    [0;31m---------------------------------------------------------------------------[0m
    [0;31mValueError[0m                                Traceback (most recent call last)
    Cell [0;32mIn[36], line 1[0m
    [0;32m----> 1[0m [43mp[49m[38;5;241;43m.[39;49m[43mage[49m [38;5;241m=[39m [38;5;241m-[39m[38;5;241m5[39m  [38;5;66;03m# Raises ValueError: Age must be a positive integer[39;00m

    Cell [0;32mIn[35], line 14[0m, in [0;36mPerson.age[0;34m(self, value)[0m
    [1;32m     11[0m [38;5;129m@age[39m[38;5;241m.[39msetter
    [1;32m     12[0m [38;5;28;01mdef[39;00m[38;5;250m [39m[38;5;21mage[39m([38;5;28mself[39m, value):
    [1;32m     13[0m     [38;5;28;01mif[39;00m [38;5;129;01mnot[39;00m [38;5;28misinstance[39m(value, [38;5;28mint[39m) [38;5;129;01mor[39;00m value [38;5;241m<[39m [38;5;241m0[39m:
    [0;32m---> 14[0m         [38;5;28;01mraise[39;00m [38;5;167;01mValueError[39;00m([38;5;124m"[39m[38;5;124mAge must be a positive integer[39m[38;5;124m"[39m)
    [1;32m     15[0m     [38;5;28mself[39m[38;5;241m.[39m_age [38;5;241m=[39m value

    [0;31mValueError[0m: Age must be a positive integer
:::
::::

This can also be done using a descriptor. A descriptor is an object that
defines the behavior of an attribute when it is accessed or modified.
Descriptors are defined by creating a class that implements the
`__set_name__`, `__get__`, `__set__`, and `__delete__` methods.

In this case, we can create a `PositiveInteger` descriptor that enforces
the constraint that the value is always a positive integer. The
`__get__` method is called when the attribute is accessed, and the
`__set__` method is called when the attribute is modified. The
`__delete__` method is called when the attribute is deleted. The
`__set_name__` method is called when the descriptor is created, and it
allows us to set the name of the attribute in the class.

::::div{.cell}
``` {.python .cell-code}
class PositiveInteger:
    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        return instance.__dict__[self.name]

    def __set__(self, instance, value):
        if not isinstance(value, int) or value < 0:
            raise ValueError(f"{self.name} must be a positive integer")
        instance.__dict__[self.name] = value

    def __delete__(self, instance):
        del instance.__dict__[self.name]

class Person:
    age = PositiveInteger()

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Person(name={self.name}, age={self.age})"


p = Person("Alice", 30)

p.age = 35

p
```

:::div{.cell-output .cell-output-display}
    Person(name=Alice, age=35)
:::
::::

::::div{.cell}
``` {.python .cell-code}

p.age = -5
```

:::div{.cell-output .cell-output-display}
    ValueError: age must be a positive integer
    [0;31m---------------------------------------------------------------------------[0m
    [0;31mValueError[0m                                Traceback (most recent call last)
    Cell [0;32mIn[47], line 1[0m
    [0;32m----> 1[0m [43mp[49m[38;5;241;43m.[39;49m[43mage[49m [38;5;241m=[39m [38;5;241m-[39m[38;5;241m5[39m

    Cell [0;32mIn[46], line 10[0m, in [0;36mPositiveInteger.__set__[0;34m(self, instance, value)[0m
    [1;32m      8[0m [38;5;28;01mdef[39;00m[38;5;250m [39m[38;5;21m__set__[39m([38;5;28mself[39m, instance, value):
    [1;32m      9[0m     [38;5;28;01mif[39;00m [38;5;129;01mnot[39;00m [38;5;28misinstance[39m(value, [38;5;28mint[39m) [38;5;129;01mor[39;00m value [38;5;241m<[39m [38;5;241m0[39m:
    [0;32m---> 10[0m         [38;5;28;01mraise[39;00m [38;5;167;01mValueError[39;00m([38;5;124mf[39m[38;5;124m"[39m[38;5;132;01m{[39;00m[38;5;28mself[39m[38;5;241m.[39mname[38;5;132;01m}[39;00m[38;5;124m must be a positive integer[39m[38;5;124m"[39m)
    [1;32m     11[0m     instance[38;5;241m.[39m[38;5;18m__dict__[39m[[38;5;28mself[39m[38;5;241m.[39mname] [38;5;241m=[39m value

    [0;31mValueError[0m: age must be a positive integer
:::
::::

Descriptors are a powerful feature of Python that allows you to define
custom behavior for attributes. They are used in many built-in types and
libraries, including the `param` library.

## Callbacks

::::div{.cell}
``` {.python .cell-code}
class Parameter:
  """Base class for all parameters in our tiny param library."""

  def __init__(self, default=None, doc=None, bounds=None, readonly=False):
    self.default = default
    self.name = None  # Will be set when the parameter is added to a parameterized class
    self._callbacks = []

  def __set_name__(self, owner, name):
    """Called when the parameter is defined in a class."""
    self.name = name

  def __get__(self, instance, owner):
    """Get the parameter value from the instance."""
    return instance._param_values.get(self.name, self.default)

  def __set__(self, instance, value):
    """Set the parameter value on the instance."""
    if self.readonly:
      raise ValueError(f"Parameter '{self.name}' is readonly")

    # Store the old value for callbacks
    old_value = instance._param_values.get(self.name, self.default)

    # Set the value
    instance._param_values[self.name] = value

    # Trigger callbacks if value changed
    if old_value != value:
      for callback in self._callbacks:
        callback(instance, self.name, old=old_value, new=value)

  def watch(self, callback):
    """Add a callback to be called when this parameter changes."""
    self._callbacks.append(callback)
    return callback

class Number(Parameter):
  """A numeric parameter with optional bounds."""

  def validate(self, value):
    """Ensure the value is a number and within bounds."""
    if not isinstance(value, (int, float)):
      raise ValueError(f"Parameter '{self.name}' must be a number")

    if self.bounds is not None:
      min_val, max_val = self.bounds
      if value < min_val or value > max_val:
        raise ValueError(f"Parameter '{self.name}' must be between {min_val} and {max_val}")

    return value

class String(Parameter):
  """A string parameter."""

  def validate(self, value):
    """Ensure the value is a string."""
    if not isinstance(value, str):
      raise ValueError(f"Parameter '{self.name}' must be a string")
    return value

class Parameterized:
  """Base class for objects with parameters."""

  def __init__(self, **kwargs):
    # Store parameter values
    self._param_values = {}

    # Set parameters from kwargs
    for name, value in kwargs.items():
      setattr(self, name, value)

  @classmethod
  def param(cls):
    """Get a dict of all parameters defined on this class."""
    params = {}
    for name, value in cls.__dict__.items():
      if isinstance(value, Parameter):
        params[name] = value
    return params

# Example usage
class Person(Parameterized):
  name = String(default="John", doc="Person's name")
  age = Number(default=30, bounds=(0, 120), doc="Person's age")

  def __repr__(self):
    return f"Person(name={self.name}, age={self.age})"

# Demonstrate the library
person = Person(name="Alice", age=25)
print(person)

# Change the age
person.age = 26

```

:::div{.cell-output .cell-output-display}
    ValueError: Parameter 'name' is readonly
    [0;31m---------------------------------------------------------------------------[0m
    [0;31mValueError[0m                                Traceback (most recent call last)
    Cell [0;32mIn[27], line 94[0m
    [1;32m     91[0m     [38;5;28;01mreturn[39;00m [38;5;124mf[39m[38;5;124m"[39m[38;5;124mPerson(name=[39m[38;5;132;01m{[39;00m[38;5;28mself[39m[38;5;241m.[39mname[38;5;132;01m}[39;00m[38;5;124m, age=[39m[38;5;132;01m{[39;00m[38;5;28mself[39m[38;5;241m.[39mage[38;5;132;01m}[39;00m[38;5;124m)[39m[38;5;124m"[39m
    [1;32m     93[0m [38;5;66;03m# Demonstrate the library[39;00m
    [0;32m---> 94[0m person [38;5;241m=[39m [43mPerson[49m[43m([49m[43mname[49m[38;5;241;43m=[39;49m[38;5;124;43m"[39;49m[38;5;124;43mAlice[39;49m[38;5;124;43m"[39;49m[43m,[49m[43m [49m[43mage[49m[38;5;241;43m=[39;49m[38;5;241;43m25[39;49m[43m)[49m
    [1;32m     95[0m [38;5;28mprint[39m(person)
    [1;32m     97[0m [38;5;66;03m# Change the age[39;00m

    Cell [0;32mIn[27], line 74[0m, in [0;36mParameterized.__init__[0;34m(self, **kwargs)[0m
    [1;32m     72[0m [38;5;66;03m# Set parameters from kwargs[39;00m
    [1;32m     73[0m [38;5;28;01mfor[39;00m name, value [38;5;129;01min[39;00m kwargs[38;5;241m.[39mitems():
    [0;32m---> 74[0m   [38;5;28;43msetattr[39;49m[43m([49m[38;5;28;43mself[39;49m[43m,[49m[43m [49m[43mname[49m[43m,[49m[43m [49m[43mvalue[49m[43m)[49m

    Cell [0;32mIn[27], line 23[0m, in [0;36mParameter.__set__[0;34m(self, instance, value)[0m
    [1;32m     21[0m [38;5;250m[39m[38;5;124;03m"""Set the parameter value on the instance."""[39;00m
    [1;32m     22[0m [38;5;28;01mif[39;00m [38;5;28mself[39m[38;5;241m.[39mreadonly:
    [0;32m---> 23[0m   [38;5;28;01mraise[39;00m [38;5;167;01mValueError[39;00m([38;5;124mf[39m[38;5;124m"[39m[38;5;124mParameter [39m[38;5;124m'[39m[38;5;132;01m{[39;00m[38;5;28mself[39m[38;5;241m.[39mname[38;5;132;01m}[39;00m[38;5;124m'[39m[38;5;124m is readonly[39m[38;5;124m"[39m)
    [1;32m     25[0m [38;5;66;03m# Store the old value for callbacks[39;00m
    [1;32m     26[0m old_value [38;5;241m=[39m instance[38;5;241m.[39m_param_values[38;5;241m.[39mget([38;5;28mself[39m[38;5;241m.[39mname, [38;5;28mself[39m[38;5;241m.[39mdefault)

    [0;31mValueError[0m: Parameter 'name' is readonly
:::
::::
