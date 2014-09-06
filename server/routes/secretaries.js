var express = require('express');
var password = require('password-hash');
var router = express.Router();

var schemas = require('./agendaSchema');
var handlers = require('./handlers');
var Users = schemas.Users;
var mongoose = require('mongoose');


/* GET users listing. */
router.get('/', function(req, res) {
    Users.find({profile : "secretary"}, null, {}, function(err, users){
        res.json(users);
    })
});

router.get('/:id', function(req, res) {
    var id = req.param("id");
    Users.findOne({profile : "secretary", _id : id}, null, {}, function(err, user){
        if(handlers.check(err, user)) return handlers.handle(err, user, res)
        res.json(user);
    })
});

module.exports = router;
