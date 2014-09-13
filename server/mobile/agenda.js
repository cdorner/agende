var express = require('express');
var router = express.Router();
var schemas = require('../routes/agendaSchema');
var Agenda = schemas.Agenda;

router.get('/:patient', function(req, res) {
    var patient = req.param("patient");
    Agenda.find({"patient.id" : patient}, {}, {}, function(err, agenda){
        res.send({appointments : agenda});
        res.end();
    });
});

module.exports = router;