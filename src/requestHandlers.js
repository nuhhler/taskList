var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");

function start(response, postData) {
  console.log("Request handler 'start' was called.");

  /*var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '</body>'+
    '</html>';
*/
    var body = "<html>" +
               "<head>" +
                '<meta charset="utf-8">'+
                '<script src="/home/sdv/work/www/app_node/frontentd/todolist.js"></script>' +
               "</head>" +
               "<body>"+
              '<script>count_rabbits()</script>' +
              "</body>" +
              "</html>";


    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function addTask(response, postData) {
  console.log("Request handler 'addtask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  var file = "/home/sdv/work/www/app_node/src/tasks/taskList.json";
  fs.readFile( file, 'utf-8', function(err, data) {
    if( err ) {
      console.log( "Error : " + err );
      // todo process error
    }
    var taskList = JSON.parse(data);

    // find new index of the task
    var newId = -1;
    for( var i=0; i<taskList.length; i++ ) {
      newId = newId > taskList[i].id ? newId : taskList[i].id;
    }
    newId++;
    
    var newTask =  { 
      id : newId,
      name : postData,
      isDone : false
    };

    taskList.push(newTask);
    var data = JSON.stringify(taskList, null, 4);

    fs.writeFile(file, data, 'utf-8', function(err, data) {
      if( err ) {
        console.log( "Error : " + err );
        // todo process error. In this case it would be good to send response before writing file
      }
      response.write(JSON.stringify(newTask));
      response.end();
    } );
  } );
}

function taskList(response, postData) {
  console.log("Request handler 'tasklist' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  var file = "/home/sdv/work/www/app_node/src/tasks/taskList.json";
  fs.readFile(file, 'utf-8', function(err, data) {
    if( err ) {
      console.log( "Error : " + err );
    }
    response.write(data);
    response.end();
  } );
}

function removeTask(response, postData) {
  console.log("Request handler 'removetask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  var file = "/home/sdv/work/www/app_node/src/tasks/taskList.json";
  fs.readFile( file, 'utf-8', function(err, data) {
    if( err ) {
      console.log( "Error : " + err );
      // todo process error
    }
    var taskList = JSON.parse(data);

    // remove task with given index
    for( var i=0; i<taskList.length; i++ ) {
      if( taskList[i].id == postData ) {
        break;
      }
    }
    taskList.splice(i, 1);

    var data = JSON.stringify(taskList, null, 4);
    fs.writeFile(file, data, 'utf-8', function(err, data) {
      if( err ) {
        console.log( "Error : " + err );
        // todo process error. In this case it would be good to send response before writing file
      }
      response.end();
    } );
  } );
}

function executeTask(response, postData) {
  console.log("Request handler 'executeTask' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});

  var file = "/home/sdv/work/www/app_node/src/tasks/taskList.json";
  fs.readFile( file, 'utf-8', function(err, data) {
    if( err ) {
      console.log( "Error : " + err );
      // todo process error
    }
    var taskList = JSON.parse(data);

    // process task with given index
    for( var i=0; i<taskList.length; i++ ) {
      if( taskList[i].id == postData ) {
        taskList[i].isDone = !taskList[i].isDone;
        break;
      }
    }

    var data = JSON.stringify(taskList, null, 4);
    fs.writeFile(file, data, 'utf-8', function(err, data) {
      if( err ) {
        console.log( "Error : " + err );
        // todo process error. In this case it would be good to send response before writing file
      }
      response.end();
    } );
  } );
}

exports.start = start;
exports.addTask = addTask;
exports.taskList = taskList;
exports.removeTask = removeTask;
exports.executeTask = executeTask;
