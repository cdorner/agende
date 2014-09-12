var schemas = require('../routes/agendaSchema');
var Patients = schemas.Patients;

function job(){
    return {
        notificationSended: function (params, callback) {
            try {
                Patients.findByIdAndUpdate(params.patient, {$set : {"metadata.lastNotification" : new Date()}}, {}, function(err, patient){
                    if(err) return callback(err);
                    callback(null);
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