var agenda = angular.module("agenda", ["angucomplete-alt", "ui.bootstrap"]).
controller("AgendaController", ["$scope", "$http", "$timeout", "$filter", "$cookieStore", function($scope, $http, $timeout, $filter, $cookieStore){
	this.self = this;

	$scope.$emit('ChangeTitle', "Agenda", "agenda");

	$scope.mapIsoDate = [];

	$scope.Init = function(){
		$("#add").modal({
			backdrop : false, show : false
		});

		$scope.doctor = {};
	    $scope.doctors = {};
		$scope.filter = {};
		$scope.patient = {};
		$scope.autoCompletePatient = {};
		$scope.appointment = {};
		$scope.initDoctors();

        $scope.mapIsoDate["Domingo"] = "0";
        $scope.mapIsoDate["Segunda"] = "1";
        $scope.mapIsoDate["Terça"] = "2";
        $scope.mapIsoDate["Quarta"] = "3";
        $scope.mapIsoDate["Quinta"] = "4";
        $scope.mapIsoDate["Sexta"] = "5";
        $scope.mapIsoDate["Sábado"] = "6";

        $scope.isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function() {
                return ($scope.isMobile.Android() || $scope.isMobile.BlackBerry() || $scope.isMobile.iOS() || $scope.isMobile.Opera() || $scope.isMobile.Windows());
            }
        };
        if($scope.isMobile.any())
            $scope.filter = {lower : new Date(), upper : new Date()};
    };

	$scope.initDoctors = function(){
		$http.get('/api/doctors')
            .success(function(data){
                $scope.doctors = data;
                if($cookieStore.get("profile") == "doctor"){
                    $(data).each(function(index, doctor){
                        if(doctor.user == $cookieStore.get("userId")){
                            $scope.doctor = doctor;
                            return false;
                        }
                    });
                } else{
                    $scope.doctor = $scope.doctors[0];
                }
            });
	};

    $scope.isDoctorDisabled = function(){
        return $cookieStore.get("profile") == "doctor";
    };

	$scope.initOffices = function(doctor){
		$http.get('/api/users/'+$cookieStore.get("userId")+"/offices", {params : {doctor : doctor._id}})
		.success(function(data){
			$scope.office = data.length > 0 ? data[0] : null;
			$scope.offices = data;
			if(data.length == 0){
				Message.show(doctor.sex + " " + doctor.name + " não possue nenhum consultório configurado.");
			}
		});
	};

	$scope.$watch('doctor', function(newDoctor, oldDoctor){
    	if(newDoctor && newDoctor._id != undefined){
    		$scope.agenda = null;
    		$scope.initOffices(newDoctor);
    	}
    }, true);

	$scope.$watch('office', function(newOffice, oldOffice){
    	if(newOffice && newOffice._id){
    		$scope.searchAgenda($scope.doctor, newOffice);
    	}
    }, true);

	$scope.searchAgenda = function(doctor, office){
		if(doctor == undefined) return;
		$scope.filter.office = office._id;
		$http.get("/api/agenda/doctor/"+doctor._id, {params : $scope.filter})
		.success(function(data){
			$scope.agenda = data;
			$scope.agenda.days = [];
			var appointments = [];
			var current = new Date($scope.agenda.lower);
			while(current <= new Date($scope.agenda.upper)){
				$scope.agenda.days.push(current);
				current = new Date(current.getTime());
				current.setDate(current.getDate() + 1);
			}

			for (var int = 0; int < data.hours.length; int++) {
				var hour = moment(data.hours[int]);

				var current = moment($scope.agenda.lower);
				var clients = [];
				while(current.toDate() <= moment($scope.agenda.upper).toDate()) {
					var appointmentDatetime = current.clone();
					appointmentDatetime.hours(hour.hours());
					appointmentDatetime.minutes(hour.minutes());

					var exists = false
					for (var j = 0; j < $scope.agenda.appointments.length; j++) {
						var clientAppointment = $($scope.agenda.appointments[j]);
						var clientAppointmentsDateTime = moment(new Date(clientAppointment.attr("date")));
						if(clientAppointmentsDateTime.isSame(appointmentDatetime)){
							clients.push({
								date : appointmentDatetime.toDate(),
								id : clientAppointment.attr("_id"),
								patientId: $(clientAppointment.attr("patient")).attr("id"),
								name: $(clientAppointment.attr("patient")).attr("name"),
								status : clientAppointment.attr("status")
							});
							exists = true;
							break;
						}
					}
					if(!exists){
						clients.push({date : appointmentDatetime.toDate()});
					}
					current.add(1, "days");
				}
				appointments.push({hour : data.hours[int], clients : clients});
			}
			$scope.agenda.appointments = appointments;
		});
	};

	$scope.notWorkDay = function(date){
		for (var int = 0; int < $scope.office.configuration.weekDays.length; int++) {
			var o = $scope.office.configuration.weekDays[int];
			if(moment(date).day() == $scope.mapIsoDate[o.day]){
				return !o.selected;
			}
		}
		return false;
	};

	$scope.prev = function(days){
		var days = days || 1;

		var lower = new Date($scope.agenda.days[0].getTime());
		lower.setDate(lower.getDate() - days);
		var upper = new Date($scope.agenda.days[$scope.agenda.days.length - 1].getTime());
		upper.setDate(upper.getDate() - days);
		$scope.filter = {lower : lower, upper : upper};
		$scope.searchAgenda($scope.doctor, $scope.office);
	};

	$scope.next = function(days){
		var days = days || 1;

		var lower = new Date($scope.agenda.days[0].getTime());
		lower.setDate(lower.getDate() + days);
		var upper = new Date($scope.agenda.days[$scope.agenda.days.length - 1].getTime());
		upper.setDate(upper.getDate() + days);
		$scope.filter = {lower : lower, upper : upper};
		$scope.searchAgenda($scope.doctor, $scope.office);
	};

	$scope.schedule = function(){
		$scope.appointment.patient = $scope.patient;
		$http.post("/api/agenda/doctor/"+$scope.doctor._id+"/office/"+$scope.office._id+"/appointments", $scope.appointment)
		.success(function(){
			Message.show("Consulta agendada para "+$scope.appointment.patient.name+".");
			$scope.appointment = {};
			$scope.patient = {};
			$("#patient").find("input").val("");
			$scope.searchAgenda($scope.doctor, $scope.office);
			$("#add").modal("hide");
		});
	};

	$scope.activeOffice = function(office){
		$scope.office = office;
	};

	$scope.isActiveOffice = function(office){
		return $scope.office == office;
	};

	$scope.select = function(appointment){
		$scope.appointment = appointment;
		if($scope.appointment.id){
			$http.get('/api/patients/'+appointment.patientId)
			.success(function(data){
				$scope.patient = data;
				$scope.appointment.patient = data;
				$("#add").modal("show");
			});
		} else {
			$("#patient").find("input").val("");
			$("#add").modal("show");
		}
	};

	$scope.cancelAppointment = function(){
		bootbox.confirm("Você está cancelando a consulta de "+$scope.appointment.patient.name+"?", function(result) {
			if(result){
				$http.delete("/api/agenda/doctor/"+$scope.doctor._id+"/appointment/"+$scope.appointment.id)
				.success(function(){
					Message.show("Consulta de "+$scope.appointment.patient.name+" cancelada.");
					$("#add").modal("hide");
					$scope.searchAgenda($scope.doctor, $scope.office);
				});
			}
		});
	};

	$scope.confirmAppointment = function(){
		$http.put("/api/agenda/doctor/"+$scope.doctor._id+"/appointment/"+$scope.appointment.id+"/confirm")
			.success(function(){
				Message.show("Consulta confirmada para "+$scope.appointment.patient.name+".");
				$("#add").modal("hide");
				$scope.searchAgenda($scope.doctor, $scope.office);
			});
	};

	$scope.absentAppointment = function(){
		$http.put("/api/agenda/doctor/"+$scope.doctor._id+"/appointment/"+$scope.appointment.id+"/absent")
			.success(function(){
				Message.show($scope.appointment.patient.name + " faltou a consulta.");
				$("#add").modal("hide");
				$scope.searchAgenda($scope.doctor, $scope.office);
			});
	};

	$scope.setPatient = function(patient){
		$scope.patient = patient.originalObject;
	};

	$scope.newPatient = function(){
		$scope.patient = {};
		$("#new-patient").modal("show");
	};

	$scope.dismissAppointmment = function(){
		$scope.patient = {};
	};

	$scope.dismissPatient = function(){
		if(!$scope.appointment.patient)
			$scope.patient = {};
		$("#patient_value").val("");
	};

	$scope.editPatient = function(){
		$("#new-patient").modal("show");
	};

	$scope.savePatient = function(){
		$http.post("/api/patients", $scope.patient)
		.success(function(){
			$scope.patient = {};
			$("#patient_value").val("");
			Message.show("Paciente salvo com sucesso.");
			$("#new-patient").modal("hide");
		});
	};

	$scope.updatePatient = function(){
        var patient = angular.copy($scope.patient);
        delete patient._id;
		$http.put("/api/patients/"+ $scope.patient._id, patient)
		.success(function(){
			Message.show("Paciente salvo com sucesso.");
			$("#new-patient").modal("hide");
		});
	};

	$scope.askConfirmationByEmail = function(){
		$http.post("/api/agenda/doctor/"+$scope.doctor._id+"/appointment/"+$scope.appointment.id+"/askconfirmation/mail")
			.success(function(){
				Message.show("Pedido de confirmação enviado para "+$scope.appointment.patient.name+".");
				$("#add").modal("hide");
				$scope.searchAgenda($scope.doctor, $scope.office);
			})
			.error(function(data, status, headers, config) {
				Message.error(data);
			})
	};

    $scope.askConfirmationBySMS = function(){
        $http.post("/api/agenda/doctor/"+$scope.doctor._id+"/appointment/"+$scope.appointment.id+"/askconfirmation/sms")
            .success(function(){
                Message.show("Pedido de confirmação enviado para "+$scope.appointment.patient.name+".");
                $("#add").modal("hide");
                $scope.searchAgenda($scope.doctor, $scope.office);
            })
            .error(function(data, status, headers, config) {
                Message.error(data);
            })
    };

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

	$scope.Init();
}]);