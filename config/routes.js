/**
 * routes.js
 *
 * @description :: Configure router
 * @docs        ::
 */

var express = require('express');
var router = express.Router();

// Load Controllers
var JobController = require('../src/api/controllers/JobController');
// var OtherControler = require('OtherController'); - Example

// Map HTTP Endpoints to controllers
// Configure Job Resource
router.post('/job', JobController.newJob);
router.get('/job/:id([0-9a-f]{24})', JobController.getJob);

//Configure Other Resource - This is an example
//router.post('/other', Other.create);
//router.get('/other/:id([0-9a-f]{24})', Other.getOne);

// Test view for demo purposes
router.get('/demo', function (req, res) {
   res.render('demo', { title: 'OCR Service' })
});

module.exports = router;
