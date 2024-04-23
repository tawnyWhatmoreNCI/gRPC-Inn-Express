var express = require('express');
var router = express.Router();
var client = require("../client");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'gRPC Inn',
    isAdmin: req.session.isAdmin || false, // Use isAdmin fetched in middleware or else false
    reservations: res.locals.reservations || [] // Use reservations fetched in middleware or else an empty array
  });
});

//this route will fetch all reservations
router.get('/getAllReservations', function(req, res, next) {
  client.getAllReservations(null, (err, data) => {
    if (!err) {
      console.log('Reservations fetched:', data.reservations);
      // Send the reservations data back to the client
      res.json(data.reservations);
    } else {
      console.error('Error fetching reservations:', err);
      res.json([]);
    }
  });
});

//this route will toggle the isAdmin state
router.post('/toggleUserState', function(req, res, next) {
  // Toggle the isAdmin state
  req.session.isAdmin = !req.session.isAdmin; 
  // Redirect back to the homepage
  res.redirect('/');
});

module.exports = router;
