/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var express = require('express');
var router = express.Router();

// Load Controllers
var JobController = require('../app/controllers/JobController');
// var OtherControler = require('OtherController'); - Example

// Map HTTP Endpoints to controllers
// Configure Job Resource
router.post('/job', JobController.newJob);
router.get('/job/:id([0-9a-f]{24})', JobController.getOne);

//Configure Other Resource - This is an example
//router.post('/other', Other.create);
//router.get('/other/:id([0-9a-f]{24})', Other.getOne);

module.exports = router;
