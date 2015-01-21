/**
 * server.js
 *
 * @description :: Configures the server and loads middleware and starts listening for requests
 * @help        :: See (link to doco) Apiary?
 */

// Core Modules
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser'); // TODO - Replace this
mongoose = require('mongoose');

// Configure database connection
mongoose.connect('mongodb://localhost:27017/ocr');

mongoose.connection.on('error', function() {
    console.error('connection error', arguments);
    // TODO - What do we do here? - kill process?
});

mongoose.connection.on('open', function() {
    console.log('Connected to the database');
});

// Load Routes
var routes = require('./config/routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views')); // TODO - Delete
app.set('view engine', 'jade'); // TODO - Delete

// Configure server middleware
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public'))); // TODO - Delete

// Custom Middleware Libraries
// app.use(authentication.isAuthenticated);

// Configure Routes
app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.NODE_PORT || 3000);

// Start listening for requests
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
