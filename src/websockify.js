var argv = require("optimist").argv;
var { log, decodeBuffer } = require("./util");
var net = require("net");
var fs = require("fs");

// Handle new WebSocket client
const new_client = function (client, req) {
  var clientAddr = client._socket.remoteAddress;
  var start_time = new Date().getTime();
  var TARGET = req ? req.url : client.upgradeReq.url;
  log("TARGET: ", TARGET);
  log("WebSocket connection");
  log(
    "Version " + client.protocolVersion + ", subprotocol: " + client.protocol
  );

  if (argv.record) {
    var rs = fs.createWriteStream(
      argv.record + "/" + new Date().toISOString().replace(/:/g, "_")
    );
    rs.write("var VNC_frame_data = [\n");
  } else {
    var rs = null;
  }

  var target_host = "localhost";
  var target_port = "5901";

  if (TARGET.startsWith("/vnc:")) {
    let [_, host, port] = TARGET.split(":");
    target_host = host;
    target_port = port;
  }

  var target = net.createConnection(target_port, target_host, function () {
    log("connected to target to", target_host, target_port);
  });
  target.on("data", function (data) {
    //log("sending message: " + data);

    if (rs) {
      var tdelta = Math.floor(new Date().getTime()) - start_time;
      var rsdata = "'{" + tdelta + "{" + decodeBuffer(data) + "',\n";
      rs.write(rsdata);
    }

    try {
      client.send(data);
    } catch (e) {
      log("Client closed, cleaning up target");
      target.end();
    }
  });
  target.on("end", function () {
    log("target disconnected");
    client.close();
    if (rs) {
      rs.end("'EOF'];\n");
    }
  });
  target.on("error", function () {
    log("target connection error");
    target.end();
    client.close();
    if (rs) {
      rs.end("'EOF'];\n");
    }
  });

  client.on("message", function (msg) {
    //log('got message: ' + msg);

    if (rs) {
      var rdelta = Math.floor(new Date().getTime()) - start_time;
      var rsdata = "'}" + rdelta + "}" + decodeBuffer(msg) + "',\n";
      rs.write(rsdata);
    }

    target.write(msg);
  });
  client.on("close", function (code, reason) {
    log("WebSocket client disconnected: " + code + " [" + reason + "]");
    target.end();
  });
  client.on("error", function (a) {
    log("WebSocket client error: " + a);
    target.end();
  });
};

module.exports = new_client;
