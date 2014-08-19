var express = require('express');
var router = express.Router();

var schemas = require('./agendaSchema');
var Users = schemas.Users;

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('');
  res.end();
});


router.post('/', function(req, res) {
	var json = req.body;
	var user = new Users(json);
	user.save(function(err, u) {
		res.send(u);
		res.end();
	});
});

module.exports = router;
