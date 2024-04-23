var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
const session = require('express-session');
var clients = require("./client");

var app = express();

// Use session middleware
app.use(session({
  secret: 'b5K8PvW!zR#3TqUy@X6oD*7IeA9F&lG',
  resave: false,
  saveUninitialized: false
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to fetch reservations data and pass it to the router
app.use(function(req, res, next) {
  //if were admin, fetch all, if were user, fetch by user id
  if (req.session.isAdmin) {
    getClient().getAllReservations(null, (err, data) => {
      if (!err) {
        console.log('Reservations fetched:', data.reservations);
        // Send the reservations data back to the client
        res.locals.reservations = data.reservations;
        next();
      } else {
        console.error('Error fetching reservations:', err);
        res.locals.reservations = [];
        next();
      }
    });
  } else {
    //hardcoding user id for now as it's not implemented in the UI
    getClient().getReservationsByUserId({ user_id: 'abc123' }, (err, data) => {
      if (!err) {
        console.log('Reservations fetched:', data.reservations);
        // Send the reservations data back to the client
        res.locals.reservations = data.reservations;
        next();
      } else {
        console.error('Error fetching reservations:', err);
        res.locals.reservations = [];
        next();
      }
    });
  }

});

app.use('/', indexRouter);

////////////////////////
// Requests with GRPC
////////////////////////
//post to get reservation by id
app.post('/getReservationById', function(req, res, next) {
  const reservationId = req.body.reservationId;
  getClient().getReservation({ reservation_id: reservationId }, (err, data) => {
    if (!err) {
      console.log('Reservation fetched:', data.reservation);
      // Send the reservation data back to the client
      res.json(data.reservation);
    } else {
      console.error('Error fetching reservation:', err);
      res.json({'error': err.details});
    }
  });
});

//post to modify reservation
app.post('/modifyReservation', function(req, res, next) {
  const reservation = req.body;
  getClient().modifyReservation({ 
    user_id: reservation.user_id,
    reservation_id: reservation.reservation_id,
    guest_name: reservation.guest_name,
    room_number: reservation.room_number,
    check_in_date: reservation.check_in_date,
    check_out_date: reservation.check_out_date,
    room_type: reservation.room_type,
    status: reservation.status
   }, (err, data) => {
    if (!err) {
      console.log('Reservation modified:', data.reservation);
      // Send the reservation data back to the client
      res.json(data.message);
    } else {
      console.error('Error modifying reservation:', err);
      res.json({'error': err.details});
    }
  });
});

//post to modify reservation
app.post('/cancelReservation', function(req, res, next) {
  const reservation = req.body;
  getClient().cancelReservation({ 
    reservation_id: reservation.reservation_id
   }, (err, data) => {
    if (!err) {
      console.log('Reservation cancelled:', data.reservation);
      // Send the reservation data back to the client
      res.json(data);
    } else {
      console.error('Error cancelling reservation:', err);
      res.json({'error': err.details});
    }
  });
});

//post to make reservation
app.post('/makeReservation', function(req, res, next) {
  const reservation = req.body;
  getClient().makeReservation({ 
    user_id: reservation.user_id,
    guest_name: reservation.guest_name,
    check_in_date: reservation.check_in_date,
    check_out_date: reservation.check_out_date,
    room_type: reservation.room_type
   }, (err, data) => {
    if (!err) {
      console.log('Reservation created:', data.reservation);
      // Send the reservation data back to the client
      res.json(data);
    } else {
      console.error('Error creating reservation:', err);
      res.json({'error': err.details});
    }
  });
});

//post to checkin reservation
app.post('/checkInReservation', function(req, res, next) {
  const reservationId = req.body.reservation_id;
  console.log('Checking in reservation:', reservationId);
  getClient().checkInReservation({ reservation_id: reservationId }, (err, data) => {
    if (!err) {
      console.log('Reservation checked in:', data.reservation);
      // Send the reservation data back to the client
      res.json(data);
    } else {
      console.error('Error checking in reservation err:', err);
      res.json({'error': err.details});
    }
  });
});

//post to checkout reservation
app.post('/checkOutReservation', function(req, res, next) {
  const reservationId = req.body.reservation_id;
  getClient().checkOutReservation({ reservation_id: reservationId }, (err, data) => {
    if (!err) {
      console.log('Reservation checked out:', data);
      // Send the reservation data back to the client
      res.json(data);
    } else {
      console.error('Error checking out reservation:', err);
      res.json({'error': err.details});
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var clientIndex = 0;

function getClient() {
  
  const client = clients[clientIndex];
  console.log(`Talking to server at address: ${client[1]}`);
  clientIndex = (clientIndex + 1) % clients.length;
  return client[0];
}

module.exports = app;
