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
	
	var admin = new Users({_id : "53f397165415ed355303ddc9", name: "admin", username: "admin", password:"TYH46JE9"});
	admin.save();
};

function debug(message){
	if(envienroment["debug"])
		console.log(message)
};

var AgendaSchema = new Schema({
	doctor : String,
	office : String,
	date: Date,
	client : String,
	status : {type : String, default : "Agendado"}, // Agendado, Confirmado, Cancelado, Faltou
	patient : {},
	confirmationToken : String
});

var Agenda = mongoose.model('Agenda', AgendaSchema);

var Configurations = {
	appointmentTime : 20,
	firstAppointmentHour : "09:00",
	lastAppointmentHour : "17:00"
};

var DoctorSchema = new Schema({
	name : String,
	specialty : String,
	contacts : {},
	sex : String
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
	configuration : {},
	healthCare: {}
});

var Patients = mongoose.model('Patients', PatientsSchema);

var TinyUrlSchema = new Schema({
	tiny : String,
	url : String,
});

var TinyUrl = mongoose.model('TinyUrl', TinyUrlSchema);

var UsersSchema = new Schema({
	name : String,
	username: String,
	password : String
});

var Users = mongoose.model('Users', UsersSchema);

module.exports = {
	Agenda : Agenda,
	Configurations : Configurations,
	Doctors : Doctors,
	Patients : Patients,
	TinyUrl : TinyUrl,
	Users : Users,
	Offices : Offices,
	set : set,
	init : init
}