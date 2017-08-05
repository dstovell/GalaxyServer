"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

	function handleSave(req, res, value, saveOptions) {
		saveOptions = saveOptions || {};

		var collectionName = req.param("collection");
    	var name = req.param("name");
    	var pk = req.param("pk");

    	console.log(req.url + " " + collectionName + " name=" + name + " pk=" + pk + " value=" + value);

    	var collection = options.db.collection(collectionName);
    	var default_update = {$set:{}};
    	default_update.$set[name] = value;

    	var update = saveOptions.update || default_update;

    	collection.findAndModify({_id:pk}, {}, update, {"new":true, "upsert":true}, function( err, doc ) {
			if (err) {
				console.error(req.url + " err=" + err);
			}
        	return res.json({err:err, result:doc});
        });
	}

	router.post('/save/string/:collection', function(req, res){
    	var value = req.param("value");
    	return handleSave(req, res, value);
    });

    router.post('/save/number/:collection', function(req, res){
    	var value = parseFloat(req.param("value") || 0);
    	return handleSave(req, res, value);
    });

    router.post('/save/json/:collection', function(req, res){
    	var value = req.param("value");
    	return handleSave(req, res, value);
    });

    return router;
};

