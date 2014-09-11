angular.module("patients", ['ngRoute', 'ui.bootstrap', 'angularMoment'])

	.controller('PatientController', function($scope, $route, $routeParams, $location, $http, $timeout) {
	    $scope.$route = $route;
	    $scope.$location = $location;
	    $scope.$routeParams = $routeParams;
        $scope.page = {currentPage : 1, itemsPerPage : 10};
        $scope.filter = {lastAppointment : {}};
        $scope.lastAppointmentOptions = [
            {date : 30, value : "de 30 a 60 dias"},
            {date : 60, value : "de 60 a 90 dias"},
            {date : 90, value : "Mais de 90 dias"}
        ];

	    $scope.$emit('ChangeTitle', "Pacientes", "patients");

	    $scope.Init = function(){
            $scope.filtering();
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

        $scope.filtering = function() {
            $http.get('/api/patients', {params : {name : $scope.filter.name, lastAppointment : $($scope.filter.lastAppointment).attr("date"),
                                    currentPage : $scope.page.currentPage, itemsPerPage : $scope.page.itemsPerPage}})
                .success(function(data){
                    $scope.page = data.page;
                    $scope.patients = data.patients;
                });
        };

        $scope.$watch('filter.name', function(newName, oldName){
            if(newName || "" === newName){
                $scope.page.currentPage = 1;
                $scope.filtering();
            }
        }, true);

	    $scope.Init();
	})
;