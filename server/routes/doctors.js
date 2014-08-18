var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var schemas = require('./agendaSchema');
var Doctors = schemas.Doctors;

router.get('/', function(req, res) {
	var query = Doctors.find()//
	.select('-contacts.emailPassword')
	.sort("name")
	.exec(function(err, doctors) {
		if (err)
			return handleError(err);
		res.send(doctors);
		res.end();
	});
});

router.post('/', function(req, res) {
	var json = req.body;
	json.configuration = schemas.Configurations;
	var doctor = new Doctors(json);
	doctor.save(function() {
		res.end();
	});
});

router.put('/:id', function(req, res) {
	var id = req.param("id");
	var json = req.body;
	Doctors.findOne({
		_id : id
	}, function(err, doctor) {
		if (err)
			return handleError(err);
		if(doctor == null){
			res.statusCode = 400;
			return res.end();
		}
		doctor.name = json.name;
		doctor.specialty = json.specialty;
		doctor.sex = json.sex;
		doctor.contacts = {
			phone : json.contacts.phone,
			cell : json.contacts.cell,
			email : json.contacts.email,
			emailPassword : json.contacts.emailPassword ? new Buffer(json.contacts.emailPassword).toString('base64') : doctor.contacts.emailPassword
		};
		doctor.save(function(){
			res.end();
		});
	});
});

router.get('/:id/configurations', function(req, res) {
	var id = req.param("id");
	Doctors.findById(id, function(err, doctor) {
		if (err || doctor == null)
			return handleError(err);
		res.send(doctor.configuration);
		res.end();
	});
});

module.exports = router;