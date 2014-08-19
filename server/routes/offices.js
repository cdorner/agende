var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var schemas = require('./agendaSchema');
var Offices = schemas.Offices;

router.get("/offices", function(req, res) {
	var doctor = req.param("doctor");
	Offices.find({doctor : doctor}, function(err, offices){
		res.send(offices);
		res.end();
	});
});


router.post("/offices", function(req, res) {
	var json = req.body;
	json.office.doctor = json.doctor._id;
	var office = new Offices(json.office);
	office.save(function(err, office){
		res.send(office);
		res.end();
	});
});

router.put('/offices/:id', function(req, res) {
	var json = req.body;
	Offices.findById(json.office._id, function(err, office) {
		if (err || office == null)
			return handleError(err);
		office.configuration = json.office.configuration;
		office.save(function() {
			res.end();
		});
	});
});

module.exports = router;