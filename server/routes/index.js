var express = require('express');
var router = express.Router();
var schemas = require('./agendaSchema');
var Users = schemas.Users;

/* GET home page. */
router.get('/', function(req, res) {
	res.send({
		title : 'Express'
	});
});

router.get('/login', function(req, res) {
	if (!req.cookies.userId) {
		res.redirect('/login.html');
	} else {
		Users.findById(req.cookies.userId, function(err, user){
			if(user){
				res.redirect('/login.html');
			}
			res.redirect('/home.html');
		});
	}
});

router.post('/login', function(req, res) {
	var login = req.body;
	Users.findOne({username : login.username, password : login.password}, function(err, user){
		console.info(user);
			if(user){
				res.send({user : user._id, logged : true});
				return res.end();
			}
			res.statusCode = 404;
			res.send("Usuário ou senha inválidos.");
			res.end();
		});
});

module.exports = router;
