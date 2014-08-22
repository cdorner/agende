var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var router = express.Router();
var paginator = require('./paginator');
var handlers = require('./handlers');
var schemas = require('./agendaSchema');
var Patients = schemas.Patients;

router.get('/', function(req, res) {
	var filter = {};
    var page = {};
	if (req.param("name"))
		filter.name = new RegExp(req.param("name"), 'i');
    page.currentPage = req.param("currentPage");
    page.itemsPerPage = req.param("itemsPerPage");
    filtered(filter, page, function(err, patients){
            res.send({page : page, patients : patients});
            res.end();
        }
    );
});

function filtered(filter, page, f){
    async.parallel({
        count : function(callback){
            Patients.find(filter).count(function(err, count){
                callback(null, count);
            });
        },
        query : function(callback){
            var query = Patients.find(filter);
            query.skip(paginator.skip(page)).limit(paginator.limit(page)).sort("name")
                .exec(function(err, patients){
                    callback(err, patients);
                });
        }
    }, function(err, results){
        page.total = results.count;
        f(err, results.query);
    });
};

router.post('/', function(req, res) {
	var json = req.body;
	var patient = new Patients(json);
	patient.save(function(err, p) {
        if (handlers.check(err, p)){
            return handlers.error(err, res);
        }
		res.end();
	});
});

router.put('/:id', function(req, res) {
	var id = req.param('id');
	var json = req.body;
	var conditions = {
		_id : id
	}, update = json;
	Patients.update(conditions, update, {}, function(err, p) {
        if (handlers.check(err, p)){
            return handlers.error(err, res);
        }
		res.end();
	});
});

router.get('/:id', function(req, res) {
	var id = req.param("id");
	Patients.findById(id, function(err, patient) {
        if (handlers.check(err, patient)){
            return handlers.handle(err, patient, res);
        }
		res.send(patient);
		res.end();
	});
});

module.exports = router;