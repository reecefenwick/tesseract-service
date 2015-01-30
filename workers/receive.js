/**
 * worker.js
 *
 * @description :: The worker is responsible for processing files on the queue and converting them using tesseract
 * @help        :: See (link to doco) Apiary?
 */

// Load Config files
var config = require('./config/env/' + (process.NODE_ENV || 'development'));

// Load Dependencies
var mongoose = require('mongoose');
var amqp = require('amqplib');
var Grid = require('gridfs-stream');
var fs = require('fs');
var mime = require('mime');
var async = require('async');
var tesseract = require('node-tesseract');

// Load database models
var Jobs = require('./models/jobs');

// Connect to database
mongoose.connect(config.db.host + ':' + config.db.port + '/' + config.db.name);

mongoose.connection.on('error', function() {
    console.error('connection error', arguments);
});

mongoose.connection.on('open', function() {
    console.log('Connected to the database');
});

// Configure grid-fs to use mongoose connection
var gfs = new Grid(mongoose.connection.db, mongoose.mongo);

// Insert async function to cleanup files older than x?

amqp.connect('amqp://localhost').then(function(conn) {
    process.once('SIGINT', function() { conn.close(); });
    return conn.createChannel().then(function(ch) {

        var ok = ch.assertQueue(config.mq.channel, { durable: config.mq.options.durable });

        // Fetches 2 at a time
        // In conjuction with noAck: false (below) - Server will only send more messages as you acknowledge existing
        ch.prefetch(config.mq.options.prefetch, false);

        ok = ok.then(function(_qok) {
            return ch.consume('OCR', function(msg) {
                async.waterfall([
                    function(callback) {
                        try {
                            var file = JSON.parse(msg.content.toString());
                            callback(null, file);
                            console.log(file);
                        } catch (err) {
                            return callback(err);
                            // Update database with parsing error - How do we do this without an object ID
                            // Is JSON parse even necessary?
                        }
                    },
                    function(file, callback) {
                        console.log(file.job._id);
                        var ext = mime.extension(file.contentType);

                        var filepath = './tmp/' + file._id + '.' + ext;

                        var writeStream = fs.createWriteStream(filepath);

                        writeStream.on('finish', function() {
                            callback(null, file, filepath)
                        });

                        var readstream = gfs.createReadStream({ _id:  file._id }).pipe(writeStream);

                        readstream.on('error', function(err) {
                            console.log(err);
                            callback(err);
                        })
                    },
                    //function(file, callback) {
                    //    if (file.content_type === "pdf")
                    //    pdf_extract(path, options function(err) {
                    //        See 'pdf-extract' library/module
                    //    })
                    //},
                    function(file, filepath, callback) {
                        tesseract.process(filepath, function(err, text) {
                            if (err) return callback(err);
                            callback(null, file, text)
                        })
                    }
                ], function (err, file, text) {
                    if (err) {
                        console.log(err);
                        // Update job in database with error
                        return ch.ack(msg, false);
                    } else {
                        Jobs.findOneAndUpdate({ _id: file.job._id }, { $set: { 'complete': true, 'result': text }}, {}, function(err, doc) {
                            if (err) return console.log(err);
                            console.log('Job updated in database');
                            return ch.ack(msg, false)
                        });
                    }
                });

            }, { noAck: config.mq.options.noAck });
        });

        return ok.then(function(_consumeOk) {
            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        });
    });
}).then(null, console.warn);
