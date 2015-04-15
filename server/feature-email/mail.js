var nodemailer = require("nodemailer");

function send(from, to, subject, html, callback){
    smtpProvider().sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html
    }, function(error, response){
        if(callback) callback(error, response);
    });
}

function send(email, callback){
    smtpProvider().sendMail(email, function(error, response){
        if(callback) callback(error, response);
    });
}

function smtpProvider(){
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASWORD
        }
    });
};

module.exports = {
    send : send
}