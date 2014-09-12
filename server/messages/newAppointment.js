var schemas = require('../routes/agendaSchema');
var Agenda = schemas.Agenda;
var Patients = schemas.Patients;

function job(){
    return {
        newAppointment: function (params, callback) {
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
        }
    };
}

module.exports = {
    job : job
}