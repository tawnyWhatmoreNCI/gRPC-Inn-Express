var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'gRPC Inn', isLoggedIn: true, username: '',});
});

// Route to handle login action
router.post('/login', function(req, res, next) {
  isLoggedIn = true;
  res.sendStatus(200);
});

// Route to handle logout action
router.post('/logout', function(req, res, next) {
  isLoggedIn = false;
  res.sendStatus(200);
});


module.exports = router;
