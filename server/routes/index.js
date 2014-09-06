var express = require('express');
var password = require('password-hash');
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
	Users.findOne({username : login.username}, "_id profile password", function(err, user){
        console.info(user);
        if(user && password.verify(login.password, user.password)){
            res.json({user : user._id, profile : user.profile, logged : true});
        }
        res.statusCode = 404;
        res.send("Usuário ou senha inválidos.");
        res.end();
    });
});

module.exports = router;
