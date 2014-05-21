var querystring = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var taskListCol = null;
MongoClient.connect("mongodb://localhost:27017/taskListDb", function(err, db) {
  if(err) {
    console.error("Error: Can not connect to database");
    return;
  }
  taskListCol = db.collection('taskListCol');
  userCol = db.collection('userCol');
});

function addTask(response, postData, theUserId) {
  console.log("Request handler 'addtask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  var newTask =  {
    name : postData,
    isDone : false,
    userId : new ObjectID(theUserId)
  };

  taskListCol.insert( newTask, {w:1}, function(err, result ) {
    if(err) {
      console.error("Error: Can not add new task: " + postData);   
    }
    response.write(JSON.stringify(result[0]));
    response.end();
  } );
}

function taskList(response, postData, theUserId) {
  console.log("Request handler 'tasklist' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  taskListCol.find( {userId:ObjectID(theUserId)} ).toArray(function(err, docs) {
    if(err) {
      console.error("Can't get list of tasks" + err);
    }
    response.write(JSON.stringify( docs ));
    response.end();
  });
}

function removeTask(response, postData, theUserId) {
  console.log("Request handler 'removetask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  taskListCol.remove( {_id:ObjectID(postData), userId:ObjectID(theUserId) }, {w:1}, function(err, nmbOfRemovedDocs) {
    if(err) {
      console.error("Error: Can not remove task");
    }
    response.end();
  });
}

function executeTask(response, postData, theUserId) {
  console.log("Request handler 'executeTask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  var targetTask = JSON.parse( postData );
  taskListCol.update( {_id:ObjectID(targetTask._id), userId:ObjectID(theUserId)} , {$set:{isDone:targetTask.isDone}}, function(err, nmbOfUpdatedDocs ) {
    if(err) {
      console.error("Error: Can not mark as executed the task: " + postData);   
    }
    response.end();
  });
}

function login(response, postData, userId) {
  console.log("Request handler 'login' was called.");
  var credentials = JSON.parse( postData );

  if( userId != null ){
    console.log("User already autorized");  
    response.end();
    return;
  }

  // find user or create new
  userCol.findOne( credentials, function(err, document) {
    var userId = null;
    if( document == null ) {
      console.log("user is not registered");
      credentials._id = userId = new ObjectID();
      userCol.insert( credentials, function(err, result ) {
        if(err) {
          console.error("Error: Can not add new user: " + postData);   
        }
      } );
    }
    else {
      console.log("user is registered");
      userId = document._id;
    }

    // make user session and put id to cookie
    var cookie = JSON.stringify( { userId: userId.toHexString() } );
    console.log(userId.toHexString());
    response.writeHead(200, { "Set-Cookie": cookie ,"Content-Type": "text/plain"});
    
    response.end();
  });
}

exports.addTask = addTask;
exports.taskList = taskList;
exports.removeTask = removeTask;
exports.executeTask = executeTask;
exports.login = login;
