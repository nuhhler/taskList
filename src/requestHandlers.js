var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

function addTask(response, postData) {
  console.log("Request handler 'addtask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  var newTask =  {
    name : postData,
    isDone : false
  };

  MongoClient.connect("mongodb://localhost:27017/taskListDb", function(err, db) {
    if(err) {
      console.log("Error: Can not connect to database");
    }
    var collection = db.collection('taskListDB');
    collection.insert( newTask, {w:1}, function(err, result ) {
      if(err) {
        console.log("Error: Can not add new task: " + postData);   
      }
      response.write(JSON.stringify(result[0]));
      response.end();
    } );
  });
}

function taskList(response, postData) {
  console.log("Request handler 'tasklist' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  MongoClient.connect("mongodb://localhost:27017/taskListDb", function(err, db) {
    if(err) {
      console.log("Error: Can not connect to database");
    }
    var collection = db.collection('taskListDB');
    collection.find().toArray(function(err, docs) {
      response.write(JSON.stringify( docs ));
      response.end();
    });
  });
}

function removeTask(response, postData) {
  console.log("Request handler 'removetask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  MongoClient.connect("mongodb://localhost:27017/taskListDb", function(err, db) {
    if(err) {
      console.log("Error: Can not connect to database");
    }
    var collection = db.collection('taskListDB');
    collection.remove( {"_id":ObjectID(postData)}, {w:1}, function(err, nmbOfRemovedDocs) {
      if(err) {
        console.log("Error: Can not remove task");
      }
      response.end();
    });
  });
}

function executeTask(response, postData) {
  console.log("Request handler 'executeTask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  var targetTask = JSON.parse( postData );
  MongoClient.connect("mongodb://localhost:27017/taskListDb", function(err, db) {
    if(err) {
      console.log("Error: Can not connect to database");
    }
    var collection = db.collection('taskListDB');
    collection.update( {"_id":ObjectID(targetTask._id)} , {$set:{isDone:targetTask.isDone}}, function(err, nmbOfUpdatedDocs ) {
      if(err) {
        console.log("Error: Can not add new task: " + postData);   
      }
      response.end();
    } );
  });
}

exports.addTask = addTask;
exports.taskList = taskList;
exports.removeTask = removeTask;
exports.executeTask = executeTask;
