"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

 	var ai_controller = require('../../lib/ai/ai_controller').create(options);

    router.get('/', function(req, res){

    	var states = ai_controller.getStates();

    	console.log("states=" + JSON.stringify(states));

        return res.render('editor', {layout:'layout_new', states:states});
    });

    return router;
};

