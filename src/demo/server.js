var http = require("http");
var url = require("url");

function start(route) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var search = url.parse(request.url).search;
    console.log("Request for " + pathname + " received.");

    route(pathname);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Url Pathname " + pathname);
    response.write("\n\rUrl Search   " + search);
    response.end();
  }

  http.createServer(onRequest).listen(1337);
  console.log("Server has started.");
}

exports.start = start;