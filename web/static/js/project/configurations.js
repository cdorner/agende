var configurations = angular.module("configurations", ['ngRoute'])

	.controller('ConfigurationController', function($scope, $route, $routeParams, $location, $http, $timeout) {
	    $scope.$route = $route;
	    $scope.$location = $location;
	    $scope.$routeParams = $routeParams;
	    $scope.$emit('ChangeTitle', "Configuração do sistema", "configurations");

        $scope.hstep = 1;
        $scope.mstep = 1;
	    
	    $scope.doctor = {};
	    $scope.doctors = {};
	    $scope.newDoctor = {};
	    $scope.weekDays = [{day : "Segunda", selected : true}, 
	                       {day : "Terça", selected : true},
	                       {day : "Quarta", selected : true},
	                       {day : "Quinta", selected : true},
	                       {day : "Sexta", selected : true},
	                       {day : "Sábado", selected : false},
	                       {day : "Domingo", selected : false}];
	    
	    $scope.Init = function(){
	    	$http.get('/api/doctors')
			.success(function(data){
				$scope.doctors = data;
			});
	    };
	    
	    $scope.initOffices = function(){
	    	if($scope.doctor){
	    		$http.get('/api/doctors/'+$scope.doctor._id+"/offices", {params : {doctor : $scope.doctor._id}})
				.success(function(data){
                    angular.forEach(data, function(value, key){
                        value.configuration.firstAppointmentHour = moment(value.configuration.firstAppointmentHour).toDate();
                        value.configuration.lastAppointmentHour = moment(value.configuration.lastAppointmentHour).toDate();
                    });
					$scope.offices = data;
				});
	    	}
	    };
	    
	    $scope.$watch('doctor', function(newDoctor, oldDoctor){
            $scope.office = {};
	    	if(newDoctor && newDoctor._id != undefined)
	    		$scope.change(newDoctor);
	    }, true);
	    
	    $scope.change = function(doctor){
	    	$scope.initOffices();
	    };
	    
	    $scope.save = function(){
            if($scope.office.configuration.firstAppointmentHour > $scope.office.configuration.lastAppointmentHour){
                Message.error("A primeira consulta deve ser apos a ultima consulta.");
                return;
            }
	    	if(!$scope.office.configuration.weekDays) {$scope.office.configuration.weekDays = $scope.weekDays}
	    	var request = {doctor : $scope.doctor, office : $scope.office};
	    	$http.put("/api/doctors/"+$scope.doctor._id+"/offices/"+$scope.office._id, request)
				.success(function(){
					Message.show("Informações do consultório "+$scope.doctor.name+" alteradas.");
					$scope.office = {};
					$("#new-office").modal("hide");
				});
	    };
	    
	    $scope.openNewDoctorModal = function(){
	    	$("#new-doctor").modal("show");
	    };
	    
	    $scope.openNewOfficeModal = function(){
	    	$("#new-office").modal("show");
	    };
	    
	    $scope.editDoctorModal = function(){
	    	angular.copy($scope.doctor, $scope.newDoctor);
	    	$("#new-doctor").modal("show");
	    };
	    
	    $scope.editOfficeModal = function(){
	    	$("#new-office").modal("show");
	    };
	    
	    $scope.saveDoctor = function(){
	    	$http.post("/api/doctors", $scope.newDoctor)
				.success(function(){
					Message.show("Médico "+$scope.newDoctor.name+" salvo.");
					$scope.doctor = {};
					$scope.newDoctor = {};
					$scope.Init();
					$("#new-doctor").modal("hide");
				});
	    };
	    
	    $scope.editDoctor = function(){
	    	$http.put("/api/doctors/"+$scope.newDoctor._id, $scope.newDoctor)
				.success(function(){
					Message.show("Informações do médico "+$scope.newDoctor.name+" alteradas.");
					$scope.doctor = {};
					$scope.newDoctor = {};
					$scope.Init();
					$("#new-doctor").modal("hide");
				});
	    };
	    
	    $scope.saveOffice = function(){
	    	$scope.office.configuration = {};
	    	$scope.office.configuration.weekDays = $scope.weekDays;
	    	var request = {doctor : $scope.doctor, office : $scope.office};
	    	$http.post("/api/doctors/"+$scope.doctor._id+"/offices", request)
				.success(function(data){
					Message.show("Consultório "+$scope.office.name+" salvo.");
					$scope.initOffices();
					$("#new-office").modal("hide");
				});
	    };
	    
	    $scope.editOffice = function(){
	    	if(!$scope.office.configuration.weekDays){
	    		$scope.office.configuration.weekDays = $scope.weekDays;
	    	}
	    	var request = {doctor : $scope.doctor, office : $scope.office};
	    	$http.post("/api/doctors/"+$scope.doctor._id+"/offices", request)
				.success(function(data){
					Message.show("Consultório "+$scope.office.name+" salvo.");
					$scope.initOffices();
					$("#new-office").modal("hide");
				});
	    };
	    
	    $scope.Init();
	})
;