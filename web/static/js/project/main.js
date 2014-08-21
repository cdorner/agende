var main = angular.module("main", ['ngRoute', 'agendeTitle', 'agenda', 'configurations', "patients", "ngCookies"])

	.controller('MainController', ["$scope", "$route", "$routeParams", "$location", "$cookieStore", "$title", function($scope, $route, $routeParams, $location, $cookieStore, $title) {
	    $scope.$route = $route;
	    $scope.$location = $location;
	    $scope.$routeParams = $routeParams;
	    $scope.menu = "agenda";

	    if(!$cookieStore.get("userId")){
	    	window.location.href = "/login.html";
	    }
	    
	    var isActiveMenu = function(menu){
	    	return $scope.menu = menu;
	    };
	    
	    $scope.logout = function(){
	    	$cookieStore.remove("userId");
	    	window.location.href = "/";
	    }
	}])
    .controller("TitleController", function($scope, $title){
        $scope.$on('ChangeTitle', function(event, title, menu) {
            $title.setTitle(title);
            $scope.title = $title.get();
            $scope.menu = menu;
        });
    })

    .factory('ServerNotAvailable',['$q','$location',function($q,$location){
        return {
            "responseError": function(rejection){
                if(rejection.status === 503)
                    Message.error("Desculpe parece haver algum problema com o servidor, ele nao esta disponivel.");
                return $q.reject(rejection);
            }
        }
    }])
    //Http Intercpetor to check auth failures for xhr requests
    .config(['$httpProvider',function($httpProvider) {
        $httpProvider.interceptors.push('ServerNotAvailable');
    }])

	.config(function($routeProvider, $locationProvider) {
		$routeProvider
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
            .when('/configuracao', {
                templateUrl: 'configurations.html',
                controller: 'ConfigurationController'
            })
		
		  // configure html5 to get links working on jsfiddle
//		  $locationProvider.html5Mode(true);
	});