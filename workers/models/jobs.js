/**
 * jobs.js
 *
 * @description :: This is an object model of a job that is stored in the jobs database collection, this uses the mongoose
 * library as an ORM.
 * @docs        :: insert link to doco
 */

'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var jobSchema = new Schema({
    metadata: [{
        _id: false,
        key: { type: String },
        value: { }
    }],
    file_id: String,
    complete: { type: Boolean, default: false },
    result: { type: String, default: null }
});

module.exports = mongoose.model('jobs', jobSchema);