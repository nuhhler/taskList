var querystring = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var redis = require("redis");

var taskListCol = null;
MongoClient.connect("mongodb://localhost:27017/taskListDb", function(err, db) {
  if(err) {
    console.error("Error: Can not connect to database");
    return;
  }
  taskListCol = db.collection('taskListCol');
  userCol = db.collection('userCol');
});

var redisClient = redis.createClient();
redisClient.on("error", function (err) {
    console.error("Error " + err);
});

/* Returns the ObjectId of a user which is associated with given sessionId
 * In a case, when session is not exists the function puts to response a 401 error.
 */
function checkSession( response, theSessionId, callback ) {
   var aUserId = null;
   var err = null;
   redisClient.get(theSessionId, function( err, reply) {
      if(err) {
        console.error( "Can't check sessionId: " + err );
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.end();
      } 
      else if( reply == null ) {
        console.log( "Can't find sessionId");
        err = "HTTP Error 401 Unauthorized";
        response.writeHead(401, {"Set-Cookie": "" ,"Content-Type": "text/plain"});
        response.end();
      }
      else {
        response.writeHead(200, {"Content-Type": "text/plain"});
        aUserId = new ObjectID(reply);
      }
      callback( err, aUserId );
   } );
}

function taskList(response, postData, theSessionId) {
  console.log("Request handler 'tasklist' was called.");
  checkSession( response, theSessionId, function( err, aUserId ) {
    if(err) {
      return;
    }
    
    taskListCol.find( {userId:aUserId} ).toArray(function(err, docs) {
      if(err) {
        console.error("Can't get list of tasks" + err);
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err);
      } else {
        response.write(JSON.stringify( docs ));  
      }
      response.end();
    });
  }); 
}

function addTask(response, postData, theSessionId) {
  console.log("Request handler 'addtask' was called.");
  checkSession( response, theSessionId, function( err, aUserId ) {
    if(err) {
      return;
    } 
  
    var newTask =  {
      name : postData,
      isDone : false,
      userId : aUserId
    };

    taskListCol.insert( newTask, {w:1}, function(err, result ) {
      if(err) {
        console.error("Error: Can not add new task: " + postData);
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err);   
      }
      else {
        response.write(JSON.stringify(result[0]));
      }
      response.end();
    } );
  }); 
}

function removeTask(response, postData, theSessionId) {
  console.log("Request handler 'removetask' was called.");
  checkSession( response, theSessionId, function( err, aUserId ) {
    if(err) {
      return;
    }
    

    taskListCol.remove( {_id:ObjectID(postData), userId:aUserId }, {w:1}, function(err, nmbOfRemovedDocs) {
      if(err) {
        console.error("Error: Can not remove task");
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err);
      } 
      response.end();
    });
  }); 
}

function executeTask(response, postData, theSessionId) {
  console.log("Request handler 'executeTask' was called.");
  checkSession( response, theSessionId, function( err, aUserId ) {
    if(err) {
      return;
    }

    var targetTask = JSON.parse( postData );
    taskListCol.update( {_id:ObjectID(targetTask._id), userId:aUserId} , {$set:{isDone:targetTask.isDone}}, function(err, nmbOfUpdatedDocs ) {
      if(err) {
        console.error("Error: Can not mark as executed the task: " + postData);
        response.writeHead(500, {"Content-Type": "text/plain"}); 
        response.write(err);  
      }
      response.end();
    });
  });
}

function login(response, postData, theSessionId) {
  console.log("Request handler 'login' was called.");
  redisClient.get(theSessionId, function( err, reply) {
    if( err ) { // internal error
      console.error( "Can't check sessionId: " + err );
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.end();
    } 
    else if( reply == null ) { // user is not authorized
      // find user with given credentials or create new
      var credentials = JSON.parse( postData );
      
      if( !credentials.username || !credentials.password ) {
        console.error("Credentials is not correct: " + postData);
        response.writeHead(401, {"Set-Cookie": "", "Content-Type": "text/plain"});
        response.end();   
        return;
      }

      userCol.findOne( credentials, function(err, document) {
        var userId = null;
        if( document == null ) {
          console.log("user does not exists: " + postData);
          credentials._id = userId = new ObjectID();
          userCol.insert( credentials, function(err, result ) {
            if(err) {
              console.error("Error: Can not add new user: " + postData);
              response.writeHead(500, {"Set-Cookie": "", "Content-Type": "text/plain"});
              response.end();   
              return;
            }
          } );
        }
        else {
          console.log("user is registered: " + postData);
          userId = document._id;
        }
        
        // make user session and put id to cookie
        var aSessionId = new ObjectID().toHexString();
        redisClient.set( aSessionId, userId.toHexString() );
        redisClient.expire( aSessionId, 30*60);
        var cookie = JSON.stringify( { sessionId: aSessionId } );
        console.log( "set cookie: " + cookie );
        response.writeHead(200, { "Set-Cookie": cookie, "Content-Type": "text/plain"});
        response.end();
      });
    }
    else { // user alredy authorized
      // todo
      // check that login/password is correct
      response.writeHead(200, { "Content-Type": "text/plain"});
      response.end();
    }
  } );
}

exports.addTask = addTask;
exports.taskList = taskList;
exports.removeTask = removeTask;
exports.executeTask = executeTask;
exports.login = login;
