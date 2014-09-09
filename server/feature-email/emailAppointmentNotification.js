function sendEmail(appointment, patient, doctor, callback){
    var smtpTransport = smtpProvider();
    var message = "Oi %s, você tem uma consulta com o %s %s às %s, o que você deseja fazer? " +
        "<a href='"+process.env.CURRENT_DOMAIN+"/api/confirmations/appointment/%s/%s?status=Confirmado'>Confirmar</a> ou " +
        "<a href='"+process.env.CURRENT_DOMAIN+"/api/confirmations/appointment/%s/%s?status=Cancelado'>Cancelar</a> ";
    var appointmentDateTime = moment(appointment.date).format("D/M/YYYY H:m");
    smtpTransport.sendMail({
        from: doctor.sex + doctor.name + "<"+process.env.MAIL_USER+">",
        to: patient.name + "<"+patient.contacts.email+">",
        subject: util.format("Confirmação de consulta com %s %s às %s", doctor.sex, doctor.name, appointmentDateTime),
        html: util.format(message, patient.name, doctor.sex, doctor.name, appointmentDateTime, appointment._id, token, appointment._id, appointment.confirmationToken)
    }, function(error, response){
        if(error){
            callback({status : 500, message: "Houve algum problema ao solicitar a confirmaçao."})
        }
        callback(null, "Solicitaçao de confirmaçao enviada.");
    });
};

function smtpProvider(){
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASWORD
        }
    });
};