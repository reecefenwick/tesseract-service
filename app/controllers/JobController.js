/**
 * JobController.js
 *
 * @description :: Server-side logic for managing jobs
 * @help        :: See (link to doco) Apiary?
 */

// Load dependencies
var Busboy = require('busboy'); // For handling multipart upload
var Grid = require('gridfs-stream'); // For streaming files to a GridFS in mongodb
var mq = require('../libs/mq');
var async = require('async');

// Configure GridFS to use database connection
var gfs = new Grid(mongoose.connection.db, mongoose.mongo);

// Load models
var Job = require('../models/jobs');

module.exports = {
    newJob: function (req, res) {
        async.waterfall([
            function(callback) {
                var metadata = [];
                var busboy = new Busboy({
                    headers: req.headers,
                    limits: {
                        files: 1
                        //fileSize : 5242880 // 5mb
                    }
                });

                busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                    var ws = gfs.createWriteStream({
                        mode: 'w',
                        content_type: mimetype,
                        filename: filename,
                        metadata: null,
                        aliases: null
                    });

                    file.pipe(ws);

                    ws.on('error', function(err) {
                        return callback(err)
                    });

                    ws.on('close', function (file) {
                        console.log('addingtoqueue');
                        callback(null, file, metadata)
                    });
                });

                busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
                    var meta = {
                        key: fieldname,
                        value: val
                    };
                    metadata.push(meta);
                });

                req.pipe(busboy);
            },
            function(file, metadata, callback) {
                var job = new Job({
                    file_id: file._id,
                    complete: false,
                    error: null,
                    result: null,
                    metadata: metadata
                });
                file.job = job;
                job.save(function (err) {
                    if (err) return callback(err);
                    callback(null, file, job);
                    console.log('adding message to queue');
                });
            },
            function(file, job, callback) {
                var message = file;

                mq.addmessage(message, function (err) {
                    if (err) return callback(err, null);

                    var result = {
                        _id: job._id,
                        complete: job.complete,
                        metadata: job.metadata,
                        result: job.result,
                        next: "/job/" + job._id
                    };

                    callback(null, result);
                });
            }
        ], function (err, result) {
            if (err) return res.status(500).json(err);
            // res.status(err.code).json({ error: err.message }) - preferred

            res.status(201).json(result)
        });
    },
    getOne: function (req, res) {
        Job.findOne({
            _id: req.params.id
        }).select({
            file_id: false
        }).exec(function(err, doc) {
            if (err) return res.status(500).json(200);

            if (!doc) return res.status(404).json({});

            res.status(200).json(doc)
        })
    }
};
