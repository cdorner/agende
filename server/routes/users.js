var express = require('express');
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

router.get('/secretaries', function(req, res) {
    Users.find({profile : "secretary"}, function(err, users){
        res.send(users);
        res.end();
    })
});

router.get('/:id/offices', function(req, res) {
    var userId = req.cookies.userId;
    var doctor = req.param("doctor");
    Users.findById(userId, function(err, user){
        if(user.profile == "admin"){
            Offices.find({doctor : doctor})
                .exec(function(err, offices){
                    res.send(offices);
                    res.end();
                });
        }
        else if(user.profile == "doctor"){
            Doctors.findOne({user : userId}, function(err, doctor){
                if(handlers.check(err, doctor)) handlers.handle(err, doctor, res);
                Offices.find({doctor : doctor._id})
                    .exec(function(err, offices){
                        res.send(offices);
                        res.end();
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
    var conditions = {
        _id : id
    }, update = json;
    Users.update(conditions, update, {}, function(err, p) {
        if (handlers.check(err, p)){
            return handlers.error(err, res);
        }
        res.end();
    });
});


router.post('/', function(req, res) {
	var json = req.body;
	var user = new Users(json);
	user.save(function(err, u) {
		res.send(u);
		res.end();
	});
});

module.exports = router;
