"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

 	var ai_controller = require('../../lib/ai/ai_controller').create(options);

    router.get('/', function(req, res){

    	var states = ai_controller.getStates();

    	console.log("states=" + JSON.stringify(states));
    	var id = "dan";
    	ai_controller.getBrain(id, function(err, brain, userBrainsCollectionName) {
       		return res.render('editor', {layout:'layout_new', states:states, collectionName:userBrainsCollectionName, brain:brain, oid:id, entityTypeData:ai_controller.entityTypeData});
       	});
    });

    return router;
};

