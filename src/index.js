var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/addtask"] = requestHandlers.addTask;
handle["/tasklist"] = requestHandlers.taskList;
handle["/removetask"] = requestHandlers.removeTask;
handle["/executetask"] = requestHandlers.executeTask;

server.start( router.route, handle );
