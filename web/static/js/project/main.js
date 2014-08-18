var main = angular.module("main", ['ngRoute', 'agenda', 'configurations', "patients", "ngCookies"])

	.controller('MainController', ["$scope", "$route", "$routeParams", "$location", "$cookieStore", function($scope, $route, $routeParams, $location, $cookieStore) {
	    $scope.$route = $route;
	    $scope.$location = $location;
	    $scope.$routeParams = $routeParams;
	    $scope.title = "Agenda";
	    $scope.menu = "agenda";
	    $scope.$on('ChangeTitle', function(event, title, menu) {
	    	$scope.title = title;
	    	$scope.menu = menu;
	    });
	    
	    if(!$cookieStore.get("userId")){
	    	window.location.href = "/login.html";
	    }
	    
	    isActiveMenu = function(menu){
	    	return $scope.menu = menu;
	    };
	    
	    $scope.logout = function(){
	    	$cookieStore.remove("userId");
	    	window.location.href = "/";
	    }
	}])

	.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/configuracao', {
				templateUrl: 'configurations.html',
				controller: 'ConfigurationController'
			})
			.when('/', {
				templateUrl: 'agenda.html',
				controller: 'AgendaController'
			})
			.when('/agenda', {
				templateUrl: 'agenda.html',
				controller: 'AgendaController'
			})
			.when('/pacientes', {
				templateUrl: 'patientes.html',
				controller: 'PatientController'
			})
		
		  // configure html5 to get links working on jsfiddle
//		  $locationProvider.html5Mode(true);
	});