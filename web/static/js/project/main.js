var main = angular.module("main", ['ngRoute', 'agendeTitle', 'agenda', 'configurations', "patients", "ngCookies"])

	.controller('MainController', ["$scope", "$route", "$routeParams", "$location", "$cookieStore", "$title", "$http", function($scope, $route, $routeParams, $location, $cookieStore, $title, $http) {
	    $scope.$route = $route;
	    $scope.$location = $location;
	    $scope.$routeParams = $routeParams;
	    $scope.menu = "agenda";

        $scope.$on('ChangeTitle', function(event, title, menu) {
            $scope.title = title;
            $scope.menu = menu;
        });

	    if(!$cookieStore.get("userId")){
	    	window.location.href = "/login.html";
	    }
	    
	    var isActiveMenu = function(menu){
	    	return $scope.menu = menu;
	    };

        $scope.initUser = function(){
            var userId = $cookieStore.get("userId")
            $http.get('/api/users/'+userId).success(function(user){
                $scope.user = user;
            });
        };

        $scope.showMenu = function(){
            var show = false;
            angular.forEach(arguments, function(arg){
               if(arg == $cookieStore.get("profile")){
                   show = true;
               }
            });
            return show;
        };

	    $scope.logout = function(){
	    	$cookieStore.remove("userId");
	    	window.location.href = "/";
	    };

        $scope.userProfile = function(){
            $("#modal-user-profile").show();
        };

        $scope.dismissUser = function(){
            $("#modal-user-profile").hide();
        };

        $scope.updateUser = function(){
            var userId = $cookieStore.get("userId");
            $http.put('/api/users/'+userId, $scope.user)
                .success(function(user){
                    $scope.user = user;
                    Message.show("Alteraçao realizada com sucesso.");
                    $("#modal-user-profile").hide();
                })
                .error(function(data, status, headers, config){
                    Message.error(data);
                });
        };


        $scope.initUser();
	}])
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
	})

;