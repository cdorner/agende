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
            $scope.rescueText = null;
            $("#rescue").modal("hide");
            $("#modal").modal("hide");
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

        $scope.$watch('filter.lastAppointment', function(newName, oldName){
            $scope.page.currentPage = 1;
            $scope.filtering();
        }, true);

        $scope.rescue = function(patient){
            $scope.patient = patient;
            $scope.error = null;
            $http.get("/api/rescues").success(function(data){
                $scope.rescueText = data.text;
                if(!$scope.patient.contacts.email) {
                    $scope.error = "Paciente não tem email configurado, a notificação não poderá ser enviada.";
                }
                $("#rescue").modal("show");
            });
        };

        $scope.confirmRescue = function(){
            if(!$scope.patient.contacts.email) {
                return Message.error("Paciente não tem email configurado, a notificação não poderá ser enviada.");
            }
            $http.post("/api/rescues/"+$scope.patient._id, {text : $scope.rescueText}).success(function(data){
                Message.show("Mensagem foi enfileirada e sera enviada ao paciente.");
                $scope.patient = null;
                $scope.error = null;
                $("#rescue").modal("hide");
            });
        };

        $scope.update = function(){
            $http.put("/api/patients/"+ $scope.patient._id, $scope.patient)
                .success(function(){
                    Message.show("Paciente salvo com sucesso.");
                    $("#modal").modal("hide");
                });
        };

        $scope.Init();
	})
;