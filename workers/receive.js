/**
 * worker.js
 *
 * @description :: The worker is responsible for processing files on the queue and converting them using tesseract
 * @help        :: See (link to doco) Apiary?
 */

var mongoose = require('mongoose');
var amqp = require('amqplib');
var Grid = require('gridfs-stream');
var fs = require('fs');
var mime = require('mime');

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

        var ok = ch.assertQueue('OCR', { durable: false, prefetch: 2 });

        ok = ok.then(function(_qok) {
            return ch.consume('OCR', function(msg) {

                try {
                    var file = JSON.parse(msg.content.toString());
                    //console.log(file);
                } catch (e) {
                    console.log('error parsing json');
                    ch.ack(msg, false);
                    // Update database with parsing error - Wait how do we do this without an object ID
                    // Is JSON parse even necessary?
                }
                var ext = mime.extension(file.contentType);
                var writeStream = fs.createWriteStream('./tmp/' + file._id + '.' + ext);
                // Use gfs.exists to confirm file is there
                writeStream.on('finish', function() {
                    console.log('done');
                    tesseract.process('./tmp/' + file._id + '.' + ext,function(err, text) {
                        //console.log(text);
                        if (err) return console.log(err);
                        // Update database entry with text
                        console.log(file);
                        Jobs.findOneAndUpdate({ _id: file.job_id }, { $set: { 'complete': true, 'result': text }}, {}, function(err, doc) {
                            if (err) console.log(err);
                            console.info(text);
                            console.log(doc);
                        });
                        ch.ack(msg, false)
                    });
                });
                writeStream.on('error', function(err) {
                    console.log(err);
                    ch.ack(msg, false);
                    // Update database with error
                });

                var readstream = gfs.createReadStream({ _id:  file._id }).pipe(writeStream);

                readstream.on('error', function(err) {
                    console.log(err);
                    // Update database with error
                    ch.ack(msg, false);
                })
            }, { noAck: false });
        });

        return ok.then(function(_consumeOk) {
            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        });
    });
}).then(null, console.warn);