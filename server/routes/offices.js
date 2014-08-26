var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var async = require('async');
var schemas = require('./agendaSchema');
var Offices = schemas.Offices;
var Users = schemas.Users;

var quote = new RegExp("\"", 'g');

router.get("/offices", function(req, res) {
	var doctor = req.param("doctor");
    Offices.find({doctor : doctor})
        .exec(function(err, offices){
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
        office.name = json.office.name;
        office.doctor = json.office.doctor;
        office.name = json.office.name;
        office.address = json.office.address;
        office.contacts = json.office.contacts;
        office.configuration = json.office.configuration;
        office.save(function(err){
            async.each(json.secretaries, function(secretary, callback){
                Users.findById(secretary.id, function(err, user){
                    if(secretary.selected && user.offices.indexOf(json.office._id) == -1){
                        user.offices.push(json.office._id);
                    } else if (!secretary.selected && user.offices.indexOf(json.office._id) != -1){
                        user.offices.splice(user.offices.indexOf(json.office._id), 1);
                    }
                    user.save(function(err){
                        if(err)callback(err);
                        callback();
                    });
                });
            }, function(err){
                if(err) return handler.error(err)
                res.end();
            });
        });
    });

});

module.exports = router;