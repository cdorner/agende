var express = require('express');
var password = require('password-hash');
var router = express.Router();

var schemas = require('./agendaSchema');
var handlers = require('./handlers');
var Users = schemas.Users;
var Offices = schemas.Offices;
var Doctors = schemas.Doctors;

var mongoose = require('mongoose');


/* GET users listing. */
router.get('/', function(req, res) {
    Users.find({}, function(err, users){
        res.send({users : users});
        res.end();
    })
});

router.get('/:id', function(req, res) {
    var id = req.param("id");
    Users.findById(id, function(err, user){
        if(handlers.check(err, user)) return handlers.handle(err, user, res)
        res.json(user);
    })
});

router.get('/:id/offices', function(req, res) {
    var userId = req.cookies.userId;
    var doctor = req.param("doctor");
    Users.findById(userId, function(err, user){
        if(user.profile == "admin"){
            Offices.find({doctor : doctor})
                .exec(function(err, offices){
                    res.json(offices);
                });
        }
        else if(user.profile == "doctor"){
            Doctors.findOne({user : userId}, function(err, doctor){
                if(handlers.check(err, doctor)) handlers.handle(err, doctor, res);
                Offices.find({doctor : doctor._id})
                    .exec(function(err, offices){
                        res.json(offices);
                    });
            })
        }
        else if(user.profile == "secretary"){
            var ids = [];
            for(var i = 0; i < user.offices.length; i++){
                ids.push(mongoose.Types.ObjectId(user.offices[i]));
            }
            Offices.find({doctor : doctor, _id : {$in : ids}})
                .exec(function(err, offices){
                    res.send(offices);
                    res.end();
                });
        } else {
            res.statusCode = 404;
            res.end();
        }
    });
});

router.put('/:id', function(req, res) {
    var id = req.param('id');
    var json = req.body;
    if(json.password)
        json.password = password.generate(json.password);
    Users.findByIdAndUpdate(id, { $set: json}, {}, function(err, user) {
        if(err && err.code == 11000) {
            res.statusCode = 400;
            res.send("Já existe um usuário utilizando esse nome de usuário.");
            return res.end();
        }
        if (handlers.check(err, user)) return handlers.handle(err, user, res);
        res.json(user);
    });
});


router.post('/', function(req, res) {
	var json = req.body;
    json.password = password.generate(json.password);
	var user = new Users(json);
	user.save(function(err, u) {
        if(err && err.code == 11000) {
            res.statusCode = 400;
            res.send("Já existe um usuário utilizando esse nome de usuário.");
            return res.end();
        }
		res.json(u);
	});
});

module.exports = router;
