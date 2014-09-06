var express = require('express');
var moment = require("moment");
var uuid = require('node-uuid');
var util = require('util');
var async = require('async');
var request = require("request")
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var router = express.Router();
var schemas = require('./agendaSchema');
var Agenda = schemas.Agenda;
var Doctors = schemas.Doctors;
var Patients = schemas.Patients;
var Offices = schemas.Offices;

router.get('/doctor/:id', function(req, res){
	var doctorId = req.param("id");
	var office = req.param("office");

    async.waterfall([
        function findDoctor(callback){
            Doctors.findById(doctorId, function(err, doctor){
                callback(err, doctor);
            });
        },
        function findOfficeOfDoctor(doctor, callback){
            var officeId = req.param('office');
            Offices.findOne({_id : officeId}, function(err, office){
                callback(err, doctor, office);
            });
        },
        function buildAgendaForDoctorOffice(doctor, office, callback){
            var paramLower = req.param('lower');
            var paramUpper = req.param('upper');
            buildAgenda(doctor, office, paramLower, paramUpper, callback);
        }
    ], function end(err, response){
        res.send(response);
        res.end();
    });
});

function buildAgenda(doctor, office, paramLower, paramUpper, callback){
    var now = (paramLower == null ? moment(new Date()) : moment(paramLower)).startOf("day");
    var forwardSevenDays = now.clone().add(6 , "days").endOf("day");
    if(!office.configuration) office.configuration = schemas.Configurations;
    var startAt = onlyHourAndMinutes(office.configuration.firstAppointmentHour) || "09:00";
    var stopAt = onlyHourAndMinutes(office.configuration.lastAppointmentHour) || "17:00";

    var appointmentDuration = office.configuration.appointmentTime || 30;

    var response = {};
    response.lower = now;
    response.upper = forwardSevenDays;

    response.hours = [];
    var appointmentHours = [];
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
            response.appointments = agenda;
            callback(err, response)
        });
    });
};

function onlyHourAndMinutes(date){
    if(!date) return date;
    var d = moment(date);
    return d.hours() + ":" + d.minutes();
}

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
    console.info("ok");
	var id = req.param('id');
	var appId = req.param('appId');
	Agenda.findByIdAndRemove(appId, function(err){
		if (err) return handleError(err);
		res.end();
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

router.post('/doctor/:id/appointment/:appId/askconfirmation/sms', function(req, res){
    var id = req.param('id');
    var appId = req.param('appId');
    var token = uuid.v1();

    async.waterfall([
        function updateToken(callback){
            Agenda.findByIdAndUpdate(appId, function(err, appointment){
                callback(err, appointment);
            });
        },
        function validatePatientCellphone(appointment, callback){
            Patients.findById(appointment.patient.id, function(err, patient) {
                if(err) callback(err);
                if (!patient.contacts.cell) {
                    callback({status : 404, message : util.format("O paciente %s não tem nenhum celular configurado.", patient.name)});
                }
                callback(err, appointment, patient);
            });
        },
        function findDoctor(appointment, patient, callback){
            Doctors.findById(appointment.doctor, function(err, doctor) {
                if(err) callback(err);
                callback(err, appointment, patient, doctor)
            });
        },
        function shorterConfirmationURL(appointment, patient, doctor, callback){
            request({
                uri: "https://www.googleapis.com/urlshortener/v1/url",
                method: "POST",
                json: true,
                body: { longUrl: util.format(process.env.CURRENT_DOMAIN+"/api/confirmations/appointment/%s/%s?status=Confirmado", appointment._id, appointment.confirmationToken) }
            }, function(error, response, body) {
                console.info(body);
                callback(error, appointment, patient, doctor, body.id);
            });
        },
        function shorterCancelationURL(appointment, patient, doctor, confirmation, callback){
            request({
                uri: "https://www.googleapis.com/urlshortener/v1/url",
                method: "POST",
                json: true,
                body: { longUrl: util.format(process.env.CURRENT_DOMAIN+"/api/confirmations/appointment/%s/%s?status=Cancelado", appointment._id, appointment.confirmationToken) }
            }, function(error, response, body) {
                callback(error, appointment, patient, doctor, confirmation, body.id);
            });
        },
        function parse(appointment, patient, doctor, confirmation, cancelation, callback){
            var appointmentDateTime = moment(appointment.date).format("D/M/YYYY H:m");
            var message = "Consulta com %s %s as %s, confirmar %s, cancelar %s";
            var parsedMessage = util.format(message, doctor.sex, doctor.smsName, appointmentDateTime, confirmation, cancelation);
            callback(null, parsedMessage, patient.contacts.cell);
        },
        function sendSMS(message, cell, callback){
            request({
                uri: process.env.SMS_HOST,
                method: "POST",
                form: { action: "sendsms", lgn: process.env.SMS_USER, pwd: process.env.SMS_PASSWORD, msg : message, numbers : cell }
            }, function(error, response, body) {
                if(error){
                    callback({status : 500, message: "Houve algum problema ao solicitar a confirmaçao."});
                }else{
                    callback(null, "Solicitaçao de confirmaçao enviada.");
                }
            });
        }
    ], function end(err, message){
        if(err){
            res.statusCode = err.status;
            res.send(err.message);
        }else{
            res.send(message);
        }
        res.end();
    });
});


router.post('/doctor/:id/appointment/:appId/askconfirmation/mail', function(req, res){
	var id = req.param('id');
	var appId = req.param('appId');

    async.waterfall([
        function updateToken(callback){
            Agenda.findById(appId, function(err, appointment){
                callback(err, appointment);
            });
        },
        function validatePatientEmail(appointment, callback){
            Patients.findById(appointment.patient.id, function(err, patient) {
                if(err) callback(err);
                if (!patient.contacts.email) {
                    callback({status : 404, message : util.format("O paciente %s não tem nenhum email configurado.", patient.name)}, appointment);
                }
                callback(err, appointment, patient);
            });
        },
        function findDoctor(appointment, patient, callback){
            Doctors.findById(appointment.doctor, function(err, doctor) {
                if(err) callback(err);
                callback(err, appointment, patient, doctor)
            });
        },
        function sendEmail(appointment, patient, doctor, callback){
            var smtpTransport = smtpProvider();
            var message = "Oi %s, você tem uma consulta com o %s %s às %s, o que você deseja fazer? " +
                "<a href='"+process.env.CURRENT_DOMAIN+"/api/confirmations/appointment/%s/%s?status=Confirmado'>Confirmar</a> ou " +
                "<a href='"+process.env.CURRENT_DOMAIN+"/api/confirmations/appointment/%s/%s?status=Cancelado'>Cancelar</a> ";
            var appointmentDateTime = moment(appointment.date).format("D/M/YYYY H:m");
            smtpTransport.sendMail({
                from: doctor.sex + doctor.name + "<"+process.env.MAIL_USER+">",
                to: patient.name + "<"+patient.contacts.email+">",
                subject: util.format("Confirmação de consulta com %s %s às %s", doctor.sex, doctor.name, appointmentDateTime),
                html: util.format(message, patient.name, doctor.sex, doctor.name, appointmentDateTime, appointment._id, token, appointment._id, appointment.confirmationToken)
            }, function(error, response){
                if(error){
                    callback({status : 500, message: "Houve algum problema ao solicitar a confirmaçao."})
                }
                callback(null, "Solicitaçao de confirmaçao enviada.");
            });
        }
    ], function end(err, message){
        if(err){
            res.statusCode = err.status;
            res.send(err.message);
        }else{
            res.send(message);
        }
        res.end();
    });
});

function smtpProvider(){
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASWORD
        }
    });
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
				var appointment = new Agenda({doctor : id, date: date, office : office, patient : {id : json.patient._id, name : json.patient.name}, confirmationToken : uuid.v1()});
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
                    from: doctor.sex + doctor.name + "<"+process.env.MAIL_USER+">",
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