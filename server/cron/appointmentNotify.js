require("time");

var nodemailer = require("nodemailer");
var moment = require("moment");
var async = require('async');
var schemas = require('../routes/agendaSchema');
var Agenda = schemas.Agenda;
var Patients = schemas.Patients;
var Doctors = schemas.Doctors;
var util = require('util');

var CronJob = require('cron').CronJob;
new CronJob('0 0 15 * * *', function(){
    console.log('Iniciando processo de confirmaçao em background.');

    async.waterfall([
        function findTomorrowAppointments(callback){
            var tomorrowStartOfDay = moment().add(1, 'days').startOf("day");
            var tomorrowEndOfDay = moment().add(1, 'days').endOf("day");
            Agenda.find({date: {$gte: tomorrowStartOfDay, $lt: tomorrowEndOfDay}}, function(err, appointments){
                callback(err, appointments);
            });
        },
        function sendNotification(appointments, callback){
            if(!appointments || appointments.length == 0){
                console.info("Nenhum agendamento encontrado.");
                return callback(null);
            }
            async.each(appointments, function(appointment){
                Patients.findById(appointment.patient.id, function(err, patient) {
                    if(err) {console.error("Problema ao enviar email em background "+ err);return;}
                    if (patient.contacts.email) {
                        Doctors.findById(appointment.doctor, function(err, doctor){
                            sendEmail(appointment, patient, doctor);
                        });
                    }
                });
            }, function(err){
                callback(err);
            });
        }
    ], function end(err, response){
        if(err) {console.error("Problema ao enviar email em background "+ err);return;}
        console.info("Confirmaçoes enviadas com sucesso.");
    });

    console.log('Terminando processo de confirmaçao em background.');
}, null, true, "America/Sao_Paulo");

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
        html: util.format(message, patient.name, doctor.sex, doctor.name, appointmentDateTime, appointment._id, appointment.confirmationToken, appointment._id, appointment.confirmationToken)
    }, function(error, response){
        if(error){
            if(err) {console.error("Problema ao enviar email em background "+ error);return;}
        }
    });
}

function smtpProvider(){
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASWORD
        }
    });
};