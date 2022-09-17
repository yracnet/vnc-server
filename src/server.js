#!/usr/bin/env node
var url = require("url");
var path = require("path");
var fs = require("fs");
var mime = require("mime-types");

// Send an HTTP error response
const http_error = function (response, code, msg) {
  response.writeHead(code, { "Content-Type": "text/plain" });
  response.write(msg + "\n");
  response.end();
  return;
};
const publicDir = "public";
// Process an HTTP static file request
const http_request = function (request, response) {
  if (!publicDir) {
    return http_error(response, 403, "403 Permission Denied");
  }

  var uri = url.parse(request.url).pathname,
    filename = path.join(publicDir, uri);

  fs.exists(filename, function (exists) {
    if (!exists) {
      return http_error(response, 404, "404 Not Found");
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += "/index.html";
    }

    fs.readFile(filename, "binary", function (err, file) {
      if (err) {
        return http_error(response, 500, err);
      }

      var headers = {};
      var contentType = mime.contentType(path.extname(filename));
      if (contentType !== false) {
        headers["Content-Type"] = contentType;
      }

      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
};

module.exports = http_request;
