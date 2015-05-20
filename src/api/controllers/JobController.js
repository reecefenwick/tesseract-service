/**
 * JobController.js
 *
 * @description :: Server-side logic for managing jobs
 * @help        :: See (link to doco) Apiary?
 */

// Load dependencies
var Busboy = require('busboy'); // For handling multi-part upload
var async = require('async');
var fs = require('fs');
var mime = require('mime');
var uuid = require('node-uuid');

var mq = require('../../shared/mq');

// Load models
var Job = require('../models/jobs');

// TODO - Break these out into services

module.exports.getJob = function(req, res, next) {
    Job.findOne({
        _id: req.params.id
    }).select({
        file_id: false
    }).exec(function(err, doc) {
        if (err) return res.status(500).json(200);

        if (!doc) return res.status(404).json({});

        res.status(200).json(doc)
    })
};

module.exports.newJob = function (req, res, next) {
    async.waterfall([
        function (callback) {
            var maxFileSize = 5242880000;

            if (req.headers['content-length'] >= maxFileSize) callback({ status: 400, message: "File too large."});

            try {
                var busboy = new Busboy({
                    headers: req.headers,
                    limits: {
                        files: 1,
                        fileSize: maxFileSize // 50mb
                    }
                });
            } catch (err) {
                return callback({
                    status: 400,
                    message: 'Unable to parse incoming file.',
                    error: err
                })
            }

            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                var _id = uuid.v4();

                var ws = fs.createWriteStream('./files/' + _id + '.' + mime.extension(mimetype));

                var metadata = {
                    _id: _id,
                    filename: filename,
                    contentType: mimetype,
                    length: req.headers['content-length'],
                    uploadDate: Date.now()
                };

                ws.on('finish', function() {
                    callback(null, metadata)
                });

                file.pipe(ws);

                ws.on('error', function (err) {
                    return callback({
                        status: 500,
                        message: 'There was a problem storing your file.',
                        error: err
                    })
                });
            });

            busboy.on('error', function(err) {
                callback({
                    status: 500,
                    message: 'There was a problem parsing your file.',
                    error: err
                })
            });

            req.pipe(busboy);
        },
        function(file, callback) {
            var job = {
                file: file,
                complete: false,
                result: null,
                error: null
            };
            job = new Job(job);

            job.save(function(err, doc) {
                if (err) return callback({
                    status: 400,
                    message: 'There was an issue storing the job.',
                    error: err
                });

                callback(null, file, doc)
            })
        },
        function(file, job, callback) {
            file.job = job;
            mq.addmessage(file, function (err) {
                if (err) return callback(err);

                var result = {
                    _id: job._id,
                    complete: job.complete,
                    result: job.result,
                    next: "/job/" + job._id
                };

                callback(null, result);
            });
        }
    ], function (err, result) {
        console.log(err);
        if (err) return next(err);

        res.status(201).json(result)
    });
};

