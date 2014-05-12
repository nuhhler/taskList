'use strict';

var taskListApp = angular.module('taskListApp', []);

taskListApp.controller("TaskListCtrl", ['$scope', '$http', function($scope, $http) {
	$http.get("/tasklist").success(function(data) {
		$scope.taskList = angular.fromJson(data);
	});

	$scope.addTask = function() {
		console.log($scope.newTaskName);
		$http.post("/addtask", $scope.newTaskName).success(function(data) {
			$scope.taskList.push( angular.fromJson(data) );
		});
	};

	$scope.executeTask = function(taskId) {
		console.log("task is modified: " + taskId);
		$http.post("/executetask", taskId).success(function(data) {
			//$scope.taskList.push( angular.fromJson(data) );
			;
		});
	};

	$scope.removeTask = function(taskId) {
		console.log("task is removed: " + taskId);
		$http.post("/removetask", taskId).success(function(data) {
			// remove task from taskList
			for( var i=0; i<$scope.taskList.length; i++ ) {
      			if( $scope.taskList[i].id == taskId ) {
        			break;
      			}
    		}
    		$scope.taskList.splice(i, 1);
		});
	};	

}]);