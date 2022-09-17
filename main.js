#!/usr/bin/env node

// A WebSocket to TCP socket proxy
// Copyright 2012 Joel Martin
// Licensed under LGPL version 3 (see docs/LICENSE.LGPL-3)

const http_request = require("./src/server");
const new_client = require("./src/websockify");

// Known to work with node 0.8.9
// Requires node modules: ws and optimist
//     npm install ws optimist

var argv = require("optimist").argv;
var http = require("http");
var https = require("https");
var fs = require("fs");
var WebSocketServer = require("ws").Server;
var webServer;
var wsServer;
var source_host;
var source_port;

// parse source and target arguments into parts
try {
  let source_arg = argv._[0];
  source_arg = source_arg ? source_arg.toString() : "3000";

  var idx;
  idx = source_arg.indexOf(":");
  if (idx >= 0) {
    source_host = source_arg.slice(0, idx);
    source_port = parseInt(source_arg.slice(idx + 1), 10);
  } else {
    source_host = "0.0.0.0";
    source_port = parseInt(source_arg, 10);
  }

  if (isNaN(source_port)) {
    throw "illegal port";
  }
} catch (e) {
  console.error(
    "websockify.js [--cert cert.pem [--key key.pem]] [source_addr:]source_port"
  );
  process.exit(2);
}

console.log("WebSocket settings: ");
console.log("    - proxying from " + source_host + ":" + source_port);

if (argv.cert) {
  argv.key = argv.key || argv.cert;
  var cert = fs.readFileSync(argv.cert);
  var key = fs.readFileSync(argv.key);
  console.log(
    "    - Running in encrypted HTTPS (wss://) mode using: " +
      argv.cert +
      ", " +
      argv.key
  );
  webServer = https.createServer({ cert: cert, key: key }, http_request);
} else {
  console.log("    - Running in unencrypted HTTP (ws://) mode");
  webServer = http.createServer(http_request);
}

webServer.listen(source_port, function () {
  wsServer = new WebSocketServer({ server: webServer });
  wsServer.on("connection", new_client);
});
