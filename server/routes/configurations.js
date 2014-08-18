var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var schemas = require('./agendaSchema');
var Configurations = schemas.Configurations;

router.get('/', function(req, res) {
	var query = Configurations.findOne()
			.exec(function(err, config) {
				if (err) return handleError(err);
				res.send(config);
				res.end();
			});
});

router.put('/', function(req, res){
	var json = req.body;
	
	var doctor = req.param('_id');
	var appointmentTime = req.param('configurations.appointmentTime');
	var firstAppointmentHour = req.param('firstAppointmentHour');
	var lastAppointmentHour = req.param('lastAppointmentHour');
	
	console.info(req.body.name);
	console.info(req.body.configurations.appointmentTime);
	
	Configurations
		.findOne({}, function(err, config){
			if(config == null){
				var config = new Configurations({
					appointmentTime: appointmentTime, 
					firstAppointmentHour : firstAppointmentHour,
					lastAppointmentHour : lastAppointmentHour
				});
				config.save(function (err) {if (err) return handleError(err);});
			} else {
				config.appointmentTime = appointmentTime;
				config.firstAppointmentHour = firstAppointmentHour;
				config.lastAppointmentHour = lastAppointmentHour;
				config.save();
			}
			res.setHeader("Location", "/api/configurations");
			res.end();
		});
});

module.exports = router;