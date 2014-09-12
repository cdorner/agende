var express = require('express');
var router = express.Router();
var handlers = require('./handlers');
var schemas = require('./agendaSchema');
var PatientRescue = schemas.PatientRescue;
var Agendas = schemas.Agenda;
var queues = require('../messages/queue');

router.get('/', function(req, res) {
    PatientRescue.findOne({}, function(err, rescue) {
        res.send(rescue || {});
        res.end();
    });
});

router.post('/:patient', function(req, res) {
    var patient = req.param("patient");
    var text = req.param("text");
    Agendas.findOne({"patient.id" : patient}, {}, {sort: {date: -1}}, function(err, appointment){
        var doctor = appointment.doctor;
        queues.dispatch('recuePatient', { patient: patient, doctor : doctor, text : text});
        res.end();
    });
});

router.get('/1', function(req, res) {
    var p = new PatientRescue({text : "Ola paciente."});
    p.save(function(err, rescue){
        res.send(rescue || {});
        res.end();
    });
});

module.exports = router;