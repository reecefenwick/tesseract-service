/**
 * worker.js
 *
 * @description :: The worker is responsible for processing files on the queue and converting them using tesseract
 * @help        :: See (link to doco) Apiary?
 */

// Load Dependencies
var mongoose = require('mongoose');
var amqp = require('amqplib');
var Grid = require('gridfs-stream');
var fs = require('fs');
var mime = require('mime');
var async = require('async');

var Jobs = require('./models/jobs');

var tesseract = require('node-tesseract');

mongoose.connect('mongodb://localhost:27017/ocr');

mongoose.connection.on('error', function() {
    console.error('connection error', arguments);
});

mongoose.connection.on('open', function() {
    console.log('Connected to the database');
});

var gfs = new Grid(mongoose.connection.db, mongoose.mongo);
// Async function to cleanup files older than x?

amqp.connect('amqp://localhost').then(function(conn) {
    process.once('SIGINT', function() { conn.close(); });
    return conn.createChannel().then(function(ch) {

        var ok = ch.assertQueue('OCR', { durable: false });

        // Fetches 2 at a time
        // In conjuction with noAck: false (below) - Server will only send more messages as you acknowledge existing
        ch.prefetch(2, false);

        ok = ok.then(function(_qok) {
            return ch.consume('OCR', function(msg) {
                async.waterfall([
                    function(callback) { // Parse message buffer into string then JSON
                        try {
                            var file = JSON.parse(msg.content.toString());
                            callback(null, file)
                        } catch (err) {
                            console.log(err);
                            ch.ack(msg, false);
                            return callback(err);
                            // Update database with parsing error - Wait how do we do this without an object ID
                            // Is JSON parse even necessary?
                        }
                    },
                    function(file, callback) { // Stream file based on the idea stored in the message
                        console.log(file.job_id);
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
                    function(file, filepath, callback) { // Once written to disk, process with tesseract
                        tesseract.process(filepath, function(err, text) {
                            if (err) return callback(err);
                            callback(null, file, text)
                        })
                    }
                ], function (err, file, text) { // Handle result from tesseract or any errors from the waterfall
                    if (err) {
                        // Update job in database with error
                        return ch.ack(msg, false);
                    } else {
                        Jobs.findOneAndUpdate({ _id: file.job_id }, { $set: { 'complete': true, 'result': text }}, {}, function(err, doc) {
                            if (err) return console.log(err);
                            console.log('Job updated in database');
                            return ch.ack(msg, false)
                        });
                    }
                });

            }, { noAck: false });
        });

        return ok.then(function(_consumeOk) {
            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        });
    });
}).then(null, console.warn);
