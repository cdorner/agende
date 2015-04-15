var express = require('express');
var router = express.Router();

var schemas = require('../agendaSchema');
var handlers = require('../handlers');
var Proceedings = schemas.Proceedings;

var mongoose = require('mongoose');


/* GET users listing. */
router.get('/', function(req, res) {
    Proceedings.find({}, function(err, proceedings){
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
	var proceedings = new Proceedings(json);
    proceedings.save(function(err, proceeding) {
        if(err && err.code == 11000) {
            res.statusCode = 400;
            res.send("Já existe um procedimento utilizando esse nome.");
            return res.end();
        }
		res.json(proceeding);
	});
});

module.exports = router;
