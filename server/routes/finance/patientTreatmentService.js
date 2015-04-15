var express = require('express');
var router = express.Router();

var schemas = require('../agendaSchema');
var handlers = require('../handlers');
var async = require('async');
var PatientProceedings = schemas.PatientProceedings;
var Treatments = schemas.PatientTreatments;

var mongoose = require('mongoose');

router.get('/patient/:id', function(req, res) {
    Treatments.find({"patient": req.param("id")})
        .populate({path : "proceedings.proceeding"})
        .populate({path : "payments.proceeding"})
        .exec(function(err, treatments){
            res.send(treatments);
            res.end();
        })
});


router.get('/', function(req, res) {
    PatientProceedings.find({})
        .populate('patient')
        .exec(function(err, proceedings){
            res.send({proceedings : proceedings});
            res.end();
    })
});

router.get('/:id', function(req, res) {
    var id = req.param("id");
    Proceedings.findById(id, function(err, proceeding){
        if(handlers.check(err, proceeding)) return handlers.handle(err, proceeding, res)
        res.json(proceeding);
    })
});

router.put('/:id', function(req, res) {
    var id = req.param('id');
    var json = req.body;
    Proceedings.findByIdAndUpdate(id, { $set: json}, {}, function(err, proceeding) {
        if(err && err.code == 11000) {
            res.statusCode = 400;
            res.send("Já existe um procedimento utilizando esse nome.");
            return res.end();
        }
        if (handlers.check(err, proceeding)) return handlers.handle(err, user, res);
        res.json(proceeding);
    });
});


router.post('/', function(req, res) {
	var json = req.body;
    var treatment = new Treatments(json);
    treatment.save(function(err, t) {
        if(handlers.check(err, t)) return handlers.handle(err, t, res)
        res.json(t);
    });
});

router.post('/:id/payments', function(req, res) {
    var json = req.body;
    var id = req.param('id');
    Treatments.findById(id, function(err, treatment){
        if(handlers.check(err, treatment)) return handlers.handle(err, treatment, res);
        if(!treatment.payments) treatment.payments = [];
        treatment.payments.push(json);
        treatment.save(function (err) {
            if(handlers.check(err, treatment)) return handlers.handle(err, treatment, res);
            return res.end();
        });
    });
});

module.exports = router;
