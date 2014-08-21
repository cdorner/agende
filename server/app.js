var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var schemas = require('./routes/agendaSchema');

var routes = require('./routes/index');
var users = require('./routes/users');
var agenda = require('./routes/agenda');
var configurations = require('./routes/configurations');
var doctors = require('./routes/doctors');
var patients = require('./routes/patients');
var offices = require('./routes/offices');
var confirmation = require('./routes/patientConfirmation');

var app = express();
var Users = schemas.Users;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var quote = new RegExp("\"", 'g');

var requireAuthentication = function(req, res, next){
	var userId = req.cookies.userId || "";
	Users.findById(userId.replace(quote, ""), function(err, user){
		if(err || !user){
			res.statusCode = 401;
			return res.end();
		}
		next();
	});
};

var securePaths = ["/agenda/", "/agenda/*", "/users", "/users/*", "/configurations", "/configurations/*",
                   "/doctors", "/doctors/*", "/patients", "/patients/*"];
while (securePaths.length != 0) {
    var path = securePaths.pop();
    app.all(path, requireAuthentication);
}

app.use('/', routes);
app.use('/users', users);
app.use('/agenda', agenda);
app.use('/configurations', configurations);
app.use('/doctors', doctors);
app.use('/doctors/:id', offices);
app.use('/patients', patients);
app.use('/confirmations', confirmation);


/// catch 404 and forward to error handler
var err = new Error('Not Found');
app.use(function(req, res, next) {
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.info("caiu");
        if(!isNaN(err)){
            res.statusCode = err
            res.end()
        } else{
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.info("caiu");
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
