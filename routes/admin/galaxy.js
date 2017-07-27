"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    var galaxy_controller = require('../../lib/galaxy/galaxy_controller').create(options);
    //var galaxyConfig = galaxy_controller.getConfig();

    router.get('/viewgalaxy', function(req, res){
        console.log("/viewgalaxy");

        galaxy_controller.getGalaxy(0, function(err, galaxy){
            galaxy = galaxy || {};
            return res.render('viewgalaxy', {layout:'game_layout'});
        });
       
    });

    router.get('/generate', function(req, res){
        galaxy_controller.generate(function(err, galaxy){
            return res.json({err:err, result:galaxy});
        });
    });

    router.get('/getStar/:starId', function(req, res){
        var starId = req.params.starId;
        galaxy_controller.getStar(0, starId, function(err, star){
            return res.json({err:err, result:star});
        });
    });   

    return router;
};

