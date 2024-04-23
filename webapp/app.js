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
  //todo print the address of the client 
  const selectedClient = clients[Math.floor(Math.random() * clients.length)]
  selectedClient[0].getAllReservations(null, (err, data) => {
    console.log('Fetching reservations from server at address:', selectedClient[1]);
    if (!err) {
      res.locals.reservations = data.reservations || [];
    } else {
      console.error('Error fetching reservations:', err);
      res.locals.reservations = [];
    }
    next();
  });
});

app.use('/', indexRouter);

//post to get reservation by id
app.post('/getReservationById', function(req, res, next) {
  const reservationId = req.body.reservationId;
  const selectedClient = clients[Math.floor(Math.random() * clients.length)]
  console.log('Fetching reservationbyid from server at address:', selectedClient[1]);
  selectedClient[0].getReservation({ reservation_id: reservationId }, (err, data) => {
    if (!err) {
      console.log('Reservation fetched:', data.reservation);
      // Send the reservation data back to the client
      res.json(data.reservation);
    } else {
      console.error('Error fetching reservation:', err);
      res.json({});
    }
  });
});

//post to modify reservation
app.post('/modifyReservation', function(req, res, next) {
  const selectedClient = clients[Math.floor(Math.random() * clients.length)]
  console.log('modifying reservation at address:', selectedClient[1]);
  const reservation = req.body;
  selectedClient[0].modifyReservation({ 
    reservation_id: reservation.reservation_id,
    guest_name: reservation.guest_name,
    room_number: reservation.room_type,
    check_in_date: reservation.check_in,
    check_out_date: reservation.check_out,
    room_type: reservation.room_type,
    status: reservation.status
   }, (err, data) => {
    if (!err) {
      console.log('Reservation modified:', data.reservation);
      // Send the reservation data back to the client
      res.json(data.reservation);
    } else {
      console.error('Error modifying reservation:', err);
      res.json({});
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

module.exports = app;
