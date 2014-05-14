var http = require('http');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;

function start(route, handle) {
  function onRequest( req, res ) {
  	var postData = "";
  	var pathname = url.parse(req.url).pathname;

  	req.setEncoding("utf8");
    
    req.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+
      postDataChunk + "'.");
    });

    req.addListener("end", function() {
      route(handle, pathname, res, postData);
    });
  }

  http.createServer(onRequest).listen(8080, '127.0.0.1');
  console.log('Server running at http://127.0.0.1:8080/');
}

exports.start = start;