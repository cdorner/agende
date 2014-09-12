var queue = require("./queue");

var newAppointment = require("./newAppointment");
var notificationSended = require("./notificationSended");
var rescuePatient = require("./rescuePatient");

function register(){
    queue.register(newAppointment.job());
    queue.register(notificationSended.job());
    queue.register(rescuePatient.job());
    queue.start();
}

module.exports = {
    register : register
}