var configurations = angular.module("patients", ['ngRoute', 'ui.bootstrap'])

	.controller('PatientController', function($scope, $route, $routeParams, $location, $http, $timeout) {
	    $scope.$route = $route;
	    $scope.$location = $location;
	    $scope.$routeParams = $routeParams;
	    $scope.$emit('ChangeTitle', "Pacientes", "patients");
	    
	    $scope.Init = function(){
	    	$http.get('/api/patients')
			.success(function(data){
				$scope.patients = data;
			});
	    };
	    
	    $scope.openEdit = function(patient){
	    	$scope.patient = patient;
	    	$("#modal").modal("show");
	    };
	    
	    $scope.update = function(){
	    	$http.put("/api/patients/"+ $scope.patient._id, $scope.patient)
			.success(function(){
				Message.show("Paciente salvo com sucesso.");
				$("#modal").modal("hide");
			});
	    };
	    
	    $scope.dismiss = function(){
	    	$scope.patient = null;
	    };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

	    $scope.Init();
	})
;