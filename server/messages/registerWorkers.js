var queue = require("./queue");

var newAppointment = require("./newAppointment");
var notificationSended = require("./notificationSended");

function register(){
    queue.register(newAppointment.job());
    queue.register(notificationSended.job());
    queue.start();
}

module.exports = {
    register : register
}