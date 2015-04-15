var express = require('express');
var router = express.Router();
var mail = require('../feature-email/mail');

router.post('/', function(req, res){
    var name = req.param('name');
    var email = req.param('email');
    var subject = req.param('subject');
    var message = req.param('message');

    var body = {
        from: name + " <"+ email +">",
        to: process.env.MAIL_SITE,
        subject: subject,
        html: "Email enviado por " + name + " " + email + " <br/><br/>" + message,
        replyTo: email
    };


    mail.send(body, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
        res.end();
    });

});

module.exports = router;