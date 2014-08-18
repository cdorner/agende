var express = require('express');
var moment = require("moment");
var uuid = require('node-uuid');
var util = require('util');
var nodemailer = require("nodemailer");
var router = express.Router();
var schemas = require('./agendaSchema');
var Agenda = schemas.Agenda;
var Doctors = schemas.Doctors;
var Patients = schemas.Patients;
var Offices = schemas.Offices;

router.get('/doctor/:id', function(req, response){
	var doctorId = req.param("id");
	var office = req.param("office");
	
	Doctors.findById(doctorId, function(err, doctor){
		if(doctor == undefined){
			response.statusCode = 404;
			return response.end();
		}
		buildAgenda(req, response, doctor);
	});
});

function buildAgenda(req, res, doctor){
	var paramLower = req.param('lower');
	var paramUpper = req.param('upper');
	var officeId = req.param('office');
	Offices.findOne({_id : officeId}, function(err, office){
		var now = (paramLower == null ? moment(new Date()) : moment(paramLower)).startOf("day");
		var forwardSevenDays = now.clone().add(6 , "days").endOf("day");
		if(!office.configuration) office.configuration = schemas.Configurations;
		var startAt = office.configuration.firstAppointmentHour || "09:00";
		var stopAt = office.configuration.lastAppointmentHour || "17:00";
		
		var appointmentDuration = office.configuration.appointmentTime || 30;
		
		var response = {};
		response.lower = now;
		response.upper = forwardSevenDays;
		
		response.hours = [];
		appointmentHours = [];
		Agenda.find({ doctor : doctor._id, office : office._id, date: { $gte: now }, date: { $lte: forwardSevenDays } }, "date", function(err, dates){
			for (var int = 0; int < dates.length; int++) {
				var date = dates[int];
				appointmentHours.push(moment(date.date).date(now.date()).toDate());			
			}
			var firstAppointmentHour = now.clone().startOf("day").hour(startAt.split(":")[0]).minutes(startAt.split(":")[1]);
			var lastAppointmentHour = now.clone().startOf("day").hour(stopAt.split(":")[0]).minutes(stopAt.split(":")[1]);
			while (firstAppointmentHour <= lastAppointmentHour) {
				appointmentHours.push(firstAppointmentHour.clone().toDate());
				firstAppointmentHour.add(appointmentDuration, "minutes");
			}
			appointmentHours.sort();
			response.hours = transformToMoment(eliminateDuplicates(appointmentHours));
			
			response.appointments = [];
			var query = Agenda.find()
			.where('doctor').equals(doctor._id)
			.where('office').equals(office._id)
			.where('date').gte(now).lte(forwardSevenDays)
			.sort('date')
			.exec(function (err, agenda) {
				if (err) return handleError(err);
				response.appointments = agenda;
				res.send(response);
				res.end();
			});
		});
	});
};

function eliminateDuplicates(arr) {
  var i,
      len=arr.length,
      out=[],
      obj={};
 
  for (i=0;i<len;i++) {
    obj[arr[i]]=0;
  }
  for (i in obj) {
    out.push(i);
  }
  return out;
}

function transformToMoment(arr){
	var result = [];
	for (var int = 0; int < arr.length; int++) {
		result.push(moment(arr[int]));
	}
	return result;
}

router.delete('/doctor/:id/appointment/:appId', function(req, res){
	var id = req.param('id');
	var appId = req.param('appId');
	Agenda.findByIdAndRemove(appId, function(err){
		if (err) return handleError(err);
		res.end();
	});
});

router.get('/doctor/:id/appointment/:appId/confirmation/:token', function(req, res){
	var appId = req.param('appId');
	var token = req.param("token");
	console.info(token);
	var status = req.param("status");
	Agenda.findById(appId, function(err, appointment){
		if(token == appointment.confirmationToken){
			var conditions = { _id: appId }
				, update = { status: status}
			;
			Agenda.update(conditions, update, {}, function(err){
				if (err) return handleError(err);
				res.send("Consulta "+status+" com sucesso.");
				res.end();
			});
		} else {
			res.statusCode = 404;
			res.send("Desculpe não foi encontrada sua consulta.");
			res.end();
		}
	});
});

router.put('/doctor/:id/appointment/:appId/confirm', function(req, res){
	changeAppointmentStatus(req, res, "Confirmado");
});

router.put('/doctor/:id/appointment/:appId/absent', function(req, res){
	changeAppointmentStatus(req, res, "Faltou");
});

function changeAppointmentStatus(req, res, status){
	var id = req.param('id');
	var appId = req.param('appId');
	var conditions = { _id: appId }
		, update = { status: status}
	;
	Agenda.update(conditions, update, {}, function(err){
		if (err) return handleError(err);
		res.end();
	});
};

router.post('/doctor/:id/appointment/:appId/askconfirmation', function(req, res){
	var id = req.param('id');
	var appId = req.param('appId');
	var token = uuid.v1();
	var conditions = { _id: appId }
		, update = { confirmationToken: token}
	;
	Agenda.update(conditions, update, {}, function(err){
		if (err) return handleError(err);
		Agenda.findById(appId, function(err, appointment){
			Patients.findById(appointment.patient.id, function(err, patient){
				if(!patient.contacts.email){
					res.statusCode = 404;
					res.send(util.format("O paciente %s não tem nenhum email configurado.", patient.name));
					return res.end();
				}
				Doctors.findById(id, function(err, doctor){
					if(!doctor.contacts.email || !doctor.contacts.emailPassword){
						res.statusCode = 404;
						res.send(util.format("Configure o email e senha do %s %s.", doctor.sex, doctor.name));
						return res.end();
					}
					var smtpTransport = smtpProvider(doctor);
					var message = "Oi %s, você tem uma consulta com o %s %s às %s, o que você deseja fazer? " +
					" <a href='http://appointments-web.dornersystems.com.br/api/agenda/doctor/%s/appointment/%s/confirmation/%s?status=Confirmado'>Confirmar</a> ou " +
					" <a href='http://appointments-web.dornersystems.com.br/api/agenda/doctor/%s/appointment/%s/confirmation/%s?status=Cancelado'>Cancelar</a> ";
					var appointmentDateTime = moment(appointment.date).format("D/M/YYYY H:m");
					smtpTransport.sendMail({
						from: doctor.sex + doctor.name + "<"+doctor.contacts.email+">",
						to: patient.name + "<"+patient.contacts.email+">",
						subject: util.format("Confirmação de consulta com %s %s às %s", doctor.sex, doctor.name, appointmentDateTime),
						html: util.format(message, patient.name, doctor.sex, doctor.name, appointmentDateTime, id, appId, token, id, appId, token)
					}, function(error, response){
						if(error){
							console.log("Message error: " + error);
							res.statusCode = 500;
							res.send("Houve algum erro ao enviar o email, verifique se a senha está correta.");
						}
						res.end();
					});
				});
			});
		});
	});
});

function smtpProvider(doctor){
	var smtpTransport = nodemailer.createTransport({
		service: "Gmail",
		port: 465,
		secure : true,
		debug: true,
		auth: {
			user: doctor.contacts.email,
			pass: new Buffer(doctor.contacts.emailPassword, 'base64').toString('ascii')
		}
	});
	return smtpTransport;
};

router.post('/doctor/:doctor/office/:office/appointments', function(req, res){
	var id = req.param('doctor');
	var date = req.param('date');
	var office = req.param("office");
	var json = req.body;
	
	Agenda
		.findOne()
		.where("appointments.date").equals(date)
		.where("doctor").equals(id)
		.where("office").equals(office)
		.exec(function(err, appointment){
			if(appointment == null){
				var appointment = new Agenda({doctor : id, date: date, office : office, patient : {id : json.patient._id, name : json.patient.name}});
				appointment.save(function (err) {
					if (err) return handleError(err);
					sendScheduleSuccessNotification(appointment);
				});
			} else {
				res.statusCode = 400;
				res.send("Já existe uma consulta marcada nesse horário para esse consultório.");
			}
			res.end();
		});
});

function sendScheduleSuccessNotification(appointment){
	Patients.findById(appointment.patient.id, function(err, patient){
		if(patient.contacts.email){
			Doctors.findById(appointment.doctor, function(err, doctor){
				var smtpTransport = smtpProvider(doctor);
				var message = "Oi %s, você tem uma consulta agendada com o %s %s às %s.";
				var appointmentDateTime = moment(appointment.date).format("D/M/YYYY H:m");
				smtpTransport.sendMail({
					from: doctor.sex + doctor.name + "<"+doctor.contacts.email+">",
					to: patient.name + "<"+patient.contacts.email+">",
					subject: util.format("Consulta agendada com %s %s às %s", doctor.sex, doctor.name, appointmentDateTime),
					html: util.format(message, patient.name, doctor.sex, doctor.name, appointmentDateTime)
				}, function(error, response){
					
				});
			});
		};
	});
};

module.exports = router;