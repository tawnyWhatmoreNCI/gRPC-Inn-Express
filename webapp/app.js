var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');

const client = require("./client");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//variables 
var isLoggedIn = false;
var username = '';

// Requests 


app.post('/sayHello', (req, res) => {
  console.log('Request:', req.body); // Check if request body is being parsed correctly
  client.sayHello({ name: req.body.name }, (err, response) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Response:', response.message);
      res.status(200).send(response.message);
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
