var express = require('express');
var mail = require('../feature-email/mail');
var router = express.Router();

router.post('/', function(req, res){
    var name = req.param('name');
    var email = req.param('email');
    var subject = req.param('subject');
    var message = req.param('message');

    mail.send(email, process.env.MAIL_SITE, subject, message, function(error, response){
        if(error){
            console.info(error);
            res.send(error);
        }
        res.end();
    });
});

module.exports = router;