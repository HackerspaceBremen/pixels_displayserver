# pixels_displayserver

A simple display server for LED pixels.

## Overview

This display server manages an LED pixel display, driven by a Teensy 3.1 microcontroller via a serial protocol.

Clients access the display server using a network socket. A simple protocol is used to update the framebuffer.

## Protocol

### Message format

A message sent to the display server consists of one or more properties, terminated by an empty newline.
Binary payloads can be sent using a base64 encoded properties.

### Connect

Connect to the socket. The display server will respond with a "connect" message.

Request: (none)

Success Response:

    connect: ok\n
    session-id: <session-id>\n
    \n

Error Response:

    connect: error\n
    error-message: <error-message>\n
    \n

### Query display parameters

Use this to query various parameters of the connected LED display.

Request:

    info: ?\n
    \n

Response:

    info-geometry: <width>,<height>\n
    \n


### Blit

Blits pixels to an area of the display.

Request:

    blit: <x>,<y>,<width>,<height>\n
    data: <rgb data, base64>\n
    \n

Response:

    blit: ok\n
    \n

Error Response:

    blit: error\n
    error-message: <error-message>\n
    \n

### Disconnect

Just close the socket.

## Credits
- Kris Temmerman (@neuroprod) for the original idea of an LED display based game.
