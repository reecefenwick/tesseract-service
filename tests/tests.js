var should = require('should');
var assert = require('assert');

// Configure API Client
var supertest = require('supertest');
var request = supertest('http://localhost:3000');

// Re-usable objects
var job = {};

describe('New OCR Job', function () {
    it('success when uploading a document to be processed', function(done) {
        request.post('/job')
            .attach('secondfile', __dirname + '/1.png')
            .expect(function(res) {
                console.log(res.body);
                res.body.should.have.property('_id');
                res.body.should.have.property('complete');
                res.body.should.have.property('result');
                job = res.body;
            })
            .expect(201, done)
    });

    // Need to figure out how to "poll"
    //it('success when retrieving job', function(done) {
    //        request.get('/job/' + job._id)
    //            .expect(function(res) {
    //                console.log(res.body);
    //                res.body.should.have.property('_id');
    //                res.body.should.have.property('_id', true);
    //                job = res.body;
    //            })
    //            .expect(200, done)
    //});
});
