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