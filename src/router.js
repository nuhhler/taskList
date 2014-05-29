

function route( handle, pathname, response, postData, cookie ) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
  	var sessionId = cookie ? JSON.parse(cookie).sessionId : null;
    handle[pathname]( response, postData, sessionId );
  } else {
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;