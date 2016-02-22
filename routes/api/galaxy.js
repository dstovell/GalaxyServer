"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    var galaxy_controller = require('../../lib/galaxy/galaxy_controller').create(options);

    router.get('/getGalaxy', function(req, res){
        var uid = parseInt(req.cookies.uid);
        console.log("/getGalaxy uid=" + uid);

        galaxy_controller.getGalaxy(uid, function(err, galaxy){
            return res.json({ err:err, result:{galaxy:galaxy, config:galaxy_controller.getConfig()} });
        });
       
    });

    router.get('/getStar/:starId', function(req, res){
        var uid = parseInt(req.cookies.uid);
        var starId = req.params.starId;
        console.log("/getStar uid=" + uid + " starId=" + starId);
        galaxy_controller.getStar(uid, starId, function(err, star){
            return res.json({err:err, result:star});
        });
    });   

    return router;
};

