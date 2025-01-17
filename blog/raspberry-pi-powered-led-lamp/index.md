---
title: Raspberry Pi powered LED lamp
date: 2016-03-27T19:17:58-06:00
keywords: raspberry, pi, led, flask
categories: [python]
summary: Use your Raspberry Pi to control a desk lamp
references:
  - id: led
    title: LED strip and RGB - LED software Raspberry Pi LED Spectrum Analyzer - Adafruit Learning System
    URL: https://learn.adafruit.com/raspberry-pi-spectrum-analyzer-display-on-rgb-led-strip/led-strip-and-rgb-led-software
  - id: maniacallabs/bibliopixel
    title: BiblioPixel - A pure Python 2 library for programming light animation
    URL: https://github.com/ManiacalLabs/BiblioPixel
---

With a Raspberry Pi, you can control a RGB addressable LED strip.
The instructions are very simple [@led] and the results are pretty cool.
I decided to make a desk lamp with a web interface[![Raspberry Pi Powered LED Desk Lamp](images/raspberrypilamp.gif)]{.aside}.
This post will go through the steps to build your own Pi powered desk lamp.

# Requirements

- Raspberry Pi
- Memory card (greater than 4 GB recommended)
- Power Adapter
- LED Strip (LPD8806)
- Wires
- Lamp shade

# Instructions

Any model of the Raspberry Pi should work for this project.
First we need to set up the Raspberry Pi.

## Hardware

To use SPI on the Raspberry Pi, you need to connect 4 pins.
Adafruit has an excellent image in their tutorial that shows how you can do this, which I've also linked below.

::: column-screen

![Wiring Diagram](images/raspberry_pi_diagram.png)

:::

I've used the same power source to the LED strip to power the Raspberry Pi as well.

I found the lamp shades on [Amazon](https://www.amazon.com/s/field-keywords=puzzle+lamp).
I purchased them in white, since the LEDs are RGB.

I purchased the LED strip from Adafruit.

## Software

Download the latest Raspbian from the [official source](https://www.raspberrypi.com/software/operating-systems/).
I used the image `2016-03-18-raspbian-jessie.img`.
Flash the operating system onto a memory card.

```bash
sudo dd bs=1m if=2016-03-18-raspbian-jessie.img of=/dev/rdisk$DISKNUMBER
```

When using `dd` on OSX, I've found that `rdisk` is much faster than `disk`[^2].

[^2]: Both `rdisk` and `disk` will work fine, but if you are using `disk` be prepared to wait longer - it took about an hour in my case.

(**Optional**) Expand the file system to use all the available space on the memory card.

```bash
sudo raspi-config
```

```
-> Expand File System
-> Save
-> Reboot
```

To control this particular LED strip, we are going to use the SPI bus on the Raspberry Pi.
We need to set up the Pi to use SPI.

```bash
sudo raspi-config
```

```
-> Advanced Options
-> Enable SPI
-> Enable on Boot
-> Save
-> Reboot
```

Next, we need to install some packages to use the SPI bus.
First, let's update the Raspberry Pi.

```bash
sudo apt-get update
sudo apt-get upgrade
```

Then we need to install `python-dev`, [pyspidev](https://github.com/doceme/py-spidev) and [BiblioPixel](https://github.com/ManiacalLabs/BiblioPixel).
These are all required to control the LED strip.

```bash
sudo apt-get install python-dev
sudo pip install spidev
sudo pip install BiblioPixel
```

Instead of installing spidev and BiblioPixel, you can also clone the repositories and add them to your `PYTHONPATH`.
I found that `sudo pip install <package-name>` is easier, however I had to browse through the source code of `BiblioPixel` and found having a local copy accessible was helpful.

Finally, we need `Flask` to set up a server on the Raspberry Pi.

```bash
sudo pip install Flask
```

I've used `sudo` for all the `pip` installations.
It is definitely required for `spidev`, but may not be for the others.
You will need to use `sudo` to run the application, since root access is required to control GPIO pins on the Raspberry Pi.

### BiblioPixel

The tutorial on Adafruit's page links to a library for their LED strip, which the author has deprecated in favour of the excellent BiblioPixel [@maniacallabs/bibliopixel].
I recommend using BiblioPixel as well — if you want to use a different LED strip in the future this will make it very easy to use the same code base.

At this point, you should be able to run a few examples, and see animations on your LED strip.

### Flask

I've set up a simple Flask server and am using a Javascript library called [colorwheel](https://jweir.github.io/colorwheel/) to send a user selected color to the Raspberry Pi.
The code for the Flask server is available on [GitHub](https://github.com/kdheepak/arp) under MIT License.

If you want more information, feel free to ask me any questions in the comments section below!
