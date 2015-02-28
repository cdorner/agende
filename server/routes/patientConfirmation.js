var express = require('express');
var moment = require("moment");
var async = require('async');
var router = express.Router();
var schemas = require('./agendaSchema');
var util = require('util');
var Agenda = schemas.Agenda;
var Offices = schemas.Offices;


router.get('/appointment/:id/:token', function(req, res){
    var id = req.param('id');
    var token = req.param("token");
    var status = req.param("status");

    async.waterfall([
        function checkToken(callback){
            Agenda.findById(id, function(err, appointment){
                if(err) callback(err);
                if(appointment && token == appointment.confirmationToken){
                    callback(err, appointment, status);
                } else {
                    callback({status : 404, message : "Desculpe sua consulta não foi encontrada."}, appointment, status);
                }
            });
        },
        function findOffice(appointment, status, callback){
            Offices.findById(appointment.office, function(err, office){
                callback(null, appointment, status, office);
            });
        },
        function validateAppointment(appointment, status, office, callback){
            if(status == "Cancelado"){
                var diff = moment(appointment.date).diff(moment(), "minutes");
                if(diff <= 120){
                    callback({status : 409, message : "Desculpe sua consulta será em menos de 2 horas e não pode ser desmarcada."}, appointment, status, office);
                }else {
                    callback(null, appointment, status, office);
                }
            } else {
                callback(null, appointment, status, office);
            }

        },
        function updateStatus(appointment, status, office, callback){
            appointment.status = status;
            appointment.save(function(err){
                if(err) callback(err, appointment, status, office);
                callback(null, appointment, status, office);
            })
        }
    ], function end(err, appointment, action, office){
        var response = {message : "", officeContacts : ""};
        if(err) {
            response.message = err.message;
            res.statusCode = err.status;
        }
        if(!err && action){
            var status = action == "Confirmado" ? "Confirmada" : "Cancelada";
            response.message = util.format("Consulta %s com sucesso.", status);
        }
        if(office){
            response.officeContacts = util.format("Qualquer duvida entre em contato pelo telefone %s ou passe em nossa clinica %s", office.contacts.phone, office.address);
        }
        res.render('appointmentConfirmation', response);
    });
});

module.exports = router;