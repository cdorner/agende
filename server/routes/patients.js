var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var schemas = require('./agendaSchema');
var Patients = schemas.Patients;

router.get('/', function(req, res) {
	var name = req.param("name");
	var filter = {};
	if (name)
		filter.name = new RegExp(name, 'i');
	;
	var query = Patients.find(filter)//
	.sort("name").exec(function(err, patients) {
		if (err)
			return handleError(err);
		res.send(patients);
		res.end();
	});
});

router.post('/', function(req, res) {
	var json = req.body;
	var patient = new Patients(json);
	patient.save(function() {
		res.end();
	});
});

router.put('/:id', function(req, res) {
	var id = req.param('id');
	var json = req.body;
	var conditions = {
		_id : id
	}, update = json;
	Patients.update(conditions, update, {}, function(err) {
		if (err)
			return handleError(err);
		res.end();
	});
});

router.get('/:id', function(req, res) {
	var id = req.param("id");
	Patients.findById(id, function(err, patient) {
		if (err || patient == null)
			return handleError(err);
		res.send(patient);
		res.end();
	});
});

module.exports = router;