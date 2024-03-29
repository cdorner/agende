//Configurando a execução do banco MongoDB
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var envienroment = [];

function set(key, value){
	envienroment[key] = value;
};

function init(){
	mongoose.connect(envienroment['db']);
	mongoose.set('debug', envienroment['debug']); 
	
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {debug("DB Open");});

    // TYH46JE9
	var admin = new Users({_id : "53f397165415ed355303ddc9", name: "admin", username: "admin", password:"sha1$9680f7c2$1$b3ae86f7d5238f175d4da9873ee1d26b3c399d1a", profile : "admin"});
	admin.save();
};

function debug(message){
	if(envienroment["debug"])
		console.log(message)
};

// init agenda module

var AgendaSchema = new Schema({
	doctor : String,
	office : String,
	date: Date,
	client : String,
	status : {type : String, default : "Agendado"}, // Agendado, Confirmado, Cancelado, Faltou
	patient : {},
	confirmationToken : String,
    metadata : {}
});

var Agenda = mongoose.model('Agenda', AgendaSchema);

var Configurations = {
	appointmentTime : 20,
	firstAppointmentHour : "09:00",
	lastAppointmentHour : "17:00"
};

var DoctorSchema = new Schema({
	name : String,
    smsName : String,
	specialty : String,
	contacts : {},
	sex : String,
    user : String
});

var OfficeSchema = new Schema({
	doctor : String,
	name : String,
	address : String,
	contacts : {},
	configuration : {}
});

var Doctors = mongoose.model('Doctors', DoctorSchema);
var Offices = mongoose.model('Offices', OfficeSchema);

var PatientsSchema = new Schema({
	name : String,
	birth : Date,
	contacts : {},
	configuration : {}, // TODO Remove attribute
	healthCare: {},
    metadata : {}
});

var Patients = mongoose.model('Patients', PatientsSchema);

var TinyUrlSchema = new Schema({
	tiny : String,
	url : String
});

var TinyUrl = mongoose.model('TinyUrl', TinyUrlSchema);

var UsersSchema = new Schema({
	name : String,
	username: {type : String, index: { unique: true }},
	password : {type : String, select: false},
    profile : String,
    offices : [String]
});

var Users = mongoose.model('Users', UsersSchema);

var PatientRescueSchema = new Schema({
    text : String
});

var PatientRescue = mongoose.model('PatientRescue', PatientRescueSchema);

// end agenda module

// init finance module

var ProceedingsSchema = new Schema({
    name : {type : String, index: { unique: true }},
    value : Number
});

var PatientProceedingsSchema = new Schema({
    patient : { type: Schema.Types.ObjectId, ref: 'Patients' },
    proceeding : { type: Schema.Types.ObjectId, ref: 'Proceedings' },
    value : Number
});

var PatientTreatmentsSchema = new Schema({
    patient : { type: Schema.Types.ObjectId, ref: 'Patients' },
    proceedings : [{ proceeding : {type: Schema.Types.ObjectId, ref: 'Proceedings'}, value : Number}],
    payments : [{
        value : Number,
        date : Date,
        proceeding : { type: Schema.Types.ObjectId, ref: 'Proceedings'},
        installment : String
    }],
    date : Date,
    installments : String,
    status : { type : String, default : "On_Going"} // On_Going, Finished
});

PatientTreatmentsSchema.virtual('value').get(function () {
    var value = 0;
    for(var i = 0; i < this.proceedings.length; i++){
        value += this.proceedings[i].value;
    }
    return value;
});

PatientTreatmentsSchema.virtual('payed').get(function () {
    var value = 0;
    for(var i = 0; i < this.payments.length; i++){
        value += this.payments[i].value;
    }
    return value;
});
PatientTreatmentsSchema.set('toJSON', { getters: true, virtuals: true });

var Proceedings = mongoose.model('Proceedings', ProceedingsSchema);
var PatientProceedings = mongoose.model('PatientProceedings', PatientProceedingsSchema);
var PatientTreatments = mongoose.model('PatientTreatments', PatientTreatmentsSchema);

// end finance module

module.exports = {
	Agenda : Agenda,
	Configurations : Configurations,
	Doctors : Doctors,
	Patients : Patients,
	TinyUrl : TinyUrl,
	Users : Users,
	Offices : Offices,
    PatientRescue : PatientRescue,
    Proceedings : Proceedings,
    PatientProceedings : PatientProceedings,
    PatientTreatments : PatientTreatments,
	set : set,
	init : init
}