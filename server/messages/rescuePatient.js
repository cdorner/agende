var schemas = require('../routes/agendaSchema');
var Agenda = schemas.Agenda;
var Patients = schemas.Patients;
var Doctors = schemas.Doctors;
var queues = require('../messages/queue');
var mail = require('../feature-email/mail');
var util = require('util');

function job(){
    return {
        recuePatient: function (params, callback) {
            try {
                Patients.findById(params.patient, function(err, patient){
                    if(patient.contacts && patient.contacts.email){
                        Doctors.findById(params.doctor, function(err, doctor){
                            var from    = doctor.sex + doctor.name + "<"+process.env.MAIL_USER+">";
                            var to      = patient.name + "<"+patient.contacts.email+">";
                            var subject = util.format("Olá %s", patient.name);
                            var html    = params.text;
                            mail.send(from, to, subject, html, function(error, response){
                                if(error) return callback(error);
                                queues.dispatch('notificationSended', { patient: params.patient});
                                callback(null);
                            });
                        });
                    }
                    callback({message : util.format("Paciente %s não tem email configurado.", patient.name)});
                });
            } catch (err) {
                console.error(err);
                callback({message : err});
            }
        }
    };
}

module.exports = {
    job : job
}