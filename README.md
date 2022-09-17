# vnc-server

NodeJS VNC Server

## vnc-server

Is a simple compilation based on websockify-js (SW) and noVNC (UI) for vnc-lite interface

## Repositories:

> https://github.com/novnc/noVNC

Copy the html and js client to public

> https://github.com/novnc/websockify-js

Copy the websockify/websockify.js to src/ directory and split content

## Run

### Terminal

> node .\main.js 3000

### Browser

> http://localhost:3000/?path=vnc:vncserver:5901&password=vncpassword

path=vnc:[vnc-host]:[vnc-port]
