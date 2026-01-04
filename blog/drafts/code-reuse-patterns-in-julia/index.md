---
title: "Code Reuse Patterns in Python, Rust and Julia: Part 1"
date: 2023-08-19T20:12:13-0500
keywords:
  - julia
  - best practices
  - code reuse
  - inheritance
  - composition
categories: [python, rust, julia]
draft: true
---

Let's say for example we wanted to model traffic lights in Python and Julia.

::: {.panel-tabset group="language"}

## Python

```python
DEFAULT_TRAFFIC_LIGHT_COLOR = "Red"

@dataclass
class TrafficLight:
  color: str = DEFAULT_TRAFFIC_LIGHT_COLOR
```

In Python We can use a `class` and the `dataclass` decorator.

## Julia

```julia
const DEFAULT_TRAFFIC_LIGHT_COLOR = "Red"

@kwdef struct TrafficLight
  color::String = DEFAULT_TRAFFIC_LIGHT_COLOR
end
```

In Julia, we can use a `struct` and the `@kwdef` macro

:::

One of the most common ways to make data re-usable in Python is by using classes and inheritance.
However, Julia doesn't support inheritance and requires the use of composition and delegation.

::: {.panel-tabset group="language"}

## Python

```python
DEFAULT_TRAFFIC_LIGHT_BLINK_SPEED = "Fast"

@dataclass
class BlinkingTrafficLight(TrafficLight):
  blink_speed: str = DEFAULT_TRAFFIC_LIGHT_BLINK_SPEED
```

## Julia

```julia
const DEFAULT_TRAFFIC_LIGHT_BLINK_SPEED = "Fast"

struct BlinkingTrafficLight
  light::TrafficLight
  blink_speed::String
end
BlinkingTrafficLight(; blink_speed, kwargs...) = BlinkingTrafficLight(; light = TrafficLight(; kwargs...), blink_speed)

function Base.getproperty(pcl::BlinkingTrafficLight, sym::Symbol)
  if sym === :color
    return getproperty(pcl.light, sym)
  else
    return getfield(pcl, sym)
  end
end
```

:::

The `BlinkingTrafficLight` struct in Julia is using composition by containing a `TrafficLight`
within it and is using delegation by forwarding requests for the color property to its internal
`TrafficLight` object.

::: {.panel-tabset group="language"}

## Python

```python
DEFAULT_TRAFFIC_LIGHT_SOUND_TYPE = "Ping"

@dataclass
class SoundAlert(TrafficLight):
  sound_type: str = "Ping"

@dataclass
class PedestrianTrafficLight(BlinkingTrafficLight, SoundAlert):
  pass
```

## Julia

```julia
struct SoundAlert
  light::TrafficLight
  sound_type::String
end
SoundAlert(; sound_type, kwargs...) = SoundAlert(; light = TrafficLight(; kwargs...), sound_type)
function Base.getproperty(pcl::SoundAlert, sym::Symbol)
  if sym === :color
    return getproperty(pcl.light, sym)
  else
    return getfield(pcl, sym)
  end
end

struct PedestrianTrafficLight
  blinking_light::BlinkingTrafficLight
  sound_alert::SoundAlert
end
function PedestrianTrafficLight(; blink_speed = DEFAULT_TRAFFIC_LIGHT_BLINK_SPEED, sound_type = DEFAULT_TRAFFIC_LIGHT_SOUND_TYPE, color = DEFAULT_TRAFFIC_LIGHT_COLOR)
  blinking_light = BlinkingTrafficLight(blink_speed = blink_speed, color = color)
  sound_alert = SoundAlert(sound_type = sound_type, color = color)
  PedestrianTrafficLight(blinking_light, sound_alert)
end
function Base.getproperty(pcl::PedestrianTrafficLight, sym::Symbol)
    if sym === :color
        return getproperty(pcl.blinking_light, sym)
    elseif sym === :blink_speed
        return getproperty(pcl.blinking_light, sym)
    elseif sym === :sound_type
        return getproperty(pcl.sound_alert, sym)
    else
        return getfield(pcl, sym)
    end
end
```

:::
