var should = require('should');
var assert = require('assert');

// Configure API Client
var request = require('supertest');

var app = require('../server');

// Re-usable objects
var job = {};

describe('POST /job', function() {
    it('responds with json', function(done) {
        request(app)
            .post('/job')
            .attach('secondfile', __dirname + '/1.png')
            .expect(function(res) {
                res.body.should.have.property('_id');
                res.body.should.have.property('complete');
                res.body.should.have.property('result');
                job = res.body;
            })
            .expect('Content-Type', /json/)
            .expect(201, done);
    })
});


//it('success when retrieving job', function(done) {
//    request.get('/job/' + job._id)
//        .expect(function(res) {
//            console.log(res.body);
//            res.body.should.have.property('_id');
//            res.body.should.have.property('_id', true);
//            job = res.body;
//        })
//        .expect(200, done)
//});