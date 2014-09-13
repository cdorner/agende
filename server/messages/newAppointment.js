var schemas = require('../routes/agendaSchema');
var Agenda = schemas.Agenda;
var Patients = schemas.Patients;
var Doctors = schemas.Doctors;
var async = require('async');

function job(){
    return {
        newAppointment: function (params, callbackJob) {
            async.parallel([
                function(callback){
                    try {
                        Agenda.findById(params.appointment, function(err, appointment){
                            Patients.findByIdAndUpdate(appointment.patient.id, {$set : {"metadata.lastAppointment" : appointment.date}}, {}, function(err, patient){
                                if(err) return callback(err);
                                callback(null);
                            });
                        });
                    } catch (err) {
                        console.error(err);
                        callback(err);
                    }
                },
                function(callback){
                    try {
                        Agenda.findById(params.appointment, function(err, appointment){
                            if(err) return callback(err);
                            Doctors.findById(appointment.doctor, function(err, doctor){
                                if(!appointment.metadata){
                                    appointment.metadata = {};
                                }
                                appointment.metadata.doctorName = doctor.name;
                                appointment.save(function(err){
                                    if(err) return callback(err);
                                    callback(null);
                                });
                            });
                        });
                    } catch (err) {
                        callback(err);
                    }
                }
            ], function(err, results){
                callbackJob(err);
            });

        }
    };
}

module.exports = {
    job : job
}