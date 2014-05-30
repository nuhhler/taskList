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
		console.log("add task: "+ $scope.newTaskName);
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
	
	$scope.logout = function() {
		console.log("logout");
		$http.post("/logout", $scope.newTaskName).
			success(function(data) {
				$location.path('/login');
			}).
			error( function(data){
				$location.path('/login');
			});
	};

}]);

taskListControllers.controller("LoginCtrl", ['$scope', '$http', '$location', function($scope, $http, $location) {
	$http.get("/login").
		success(function(data) {
			$scope.credentials = angular.fromJson(data);
		});

	$scope.authorize = function(credentials) {
		console.log("authorize: " + credentials.username + " " + credentials.password);
		$http.post("/authorize", angular.toJson( credentials )).success(function(data) {
			$location.path('/tasklist');
	 	});
	};
}]);