'use strict';

var taskListControllers = angular.module('taskListControllers', []);

taskListControllers.controller("TaskListCtrl", ['$scope', '$http', '$location', function($scope, $http, $location) {
	$http.get("/tasklist").
		success(function(data) {
			$scope.taskList = angular.fromJson(data);
		}).
		error( function(data, status, headers, config ) {
			if( status == 401 ) {
				$location.path('/login');
			}
		});

	$scope.addTask = function() {
		console.log($scope.newTaskName);
		$http.post("/addtask", $scope.newTaskName).
			success(function(data) {
				$scope.taskList.push( angular.fromJson(data) );
			}).
			error( function(data, status, headers, config ){
				if( status == 401 ) {
					$location.path('/login');
				}
			});
	};

	$scope.executeTask = function(taskId, taskIsDone) {
		console.log("task is modified: " + taskId);
		$http.post("/executetask", angular.toJson({_id:taskId, isDone:taskIsDone})).
			success(function(data) {
				;//$scope.taskList.push( angular.fromJson(data) );
			}).
			error( function(data, status, headers, config ){
				if( status == 401 ) {
					$location.path('/login');
				}
			});
	};

	$scope.removeTask = function(taskId) {
		console.log("task is removed: " + taskId);
		$http.post("/removetask", taskId).
			success(function(data) {
				// remove task from taskList
				for( var i=0; i<$scope.taskList.length; i++ ) {
      				if( $scope.taskList[i]._id == taskId ) {
	        			break;
    	  			}
    			}
    			$scope.taskList.splice(i, 1);
			}).
			error( function(data, status, headers, config ){
				if( status == 401 ) {
					$location.path('/login');
				}
			});
	};	
}]);

taskListControllers.controller("LoginCtrl", ['$scope', '$http', '$location', function($scope, $http, $location) {
	$scope.login = function(credentials) {
		console.log("login: " + credentials.username + " " + credentials.password);
		$http.post("/login", angular.toJson( credentials )).success(function(data) {
			$location.path('/tasklist');
	 	});
	};
}]);