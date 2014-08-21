var express = require('express');
var moment = require("moment");
var async = require('async');
var router = express.Router();
var schemas = require('./agendaSchema');
var Agenda = schemas.Agenda;

router.get('/', function(req, res){
    res.send("hey");
    res.end();
});

router.get('/appointment/:id/:token', function(req, res){
    var id = req.param('id');
    var token = req.param("token");
    var status = req.param("status");

    async.waterfall([
        function checkToken(callback){
            Agenda.findById(id, function(err, appointment){
                if(err) callback(err);
                if(token == appointment.confirmationToken){
                    callback(err, appointment, status);
                } else {
                    callback({status : 404, message : "Desculpe sua consulta não foi encontrada."});
                }
            });
        },
        function updateStatus(appointment, status, callback){
            appointment.status = status;
            appointment.save(function(err){
                if(err) callback(err);
                callback(null, "Consulta "+status+" com sucesso.");
            })
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

module.exports = router;