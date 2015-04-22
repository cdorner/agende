var nodemailer = require("nodemailer");

function send(from, to, subject, html, callback){
    var options = {};
    if(arguments.length <= 2){
        options = from;
        callback = to;
    } else {
        options = {
            from: from,
            to: to,
            subject: subject,
            html: html,
            replyTo: process.env.MAIL_SITE
        };
    }
    smtpProvider().sendMail(options, function(error, response){
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