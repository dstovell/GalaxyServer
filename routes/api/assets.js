"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    var assets_controller = require('../../lib/assets/assets_controller').create(options);

  	router.get('/add/:assetKey/:starId', function(req, res){
        var uid = parseInt(req.cookies.uid);
        var assetKey = req.params.assetKey;
        var starId = req.params.starId;

        assets_controller.addAsset(assetKey, uid, starId, {}, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });

    router.get('/remove/:transponder', function(req, res){
		var transponder = req.params.transponder;
        var uid = parseInt(req.cookies.uid);

        assets_controller.removeAsset(transponder, uid, {}, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });

	router.get('/getForUser', function(req, res){
        var uid = parseInt(req.cookies.uid);

        assets_controller.getAssetsForUser(uid, {}, function(err, assets){
            return res.json({err:err, result:assets});
        });
    });

	router.get('/get/:transponder', function(req, res){
        var transponder = req.params.transponder;
        var uid = parseInt(req.cookies.uid);

        assets_controller.getAsset(transponder, uid, {}, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });

    router.get('/addMod/:transponder/:modKey', function(req, res){
        var transponder = req.params.transponder;
        var uid = parseInt(req.cookies.uid);
        var modKey = req.params.modKey;

        assets_controller.addAssetMod(transponder, uid, modKey, {}, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });

    router.get('/removeMod/:transponder/:modKey', function(req, res){
        var transponder = req.params.transponder;
        var uid = parseInt(req.cookies.uid);
        var modKey = req.params.modKey;

        assets_controller.removeAssetMod(transponder, uid, modKey, {}, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });

    router.get('/setCourse/:transponder/:destStarId', function(req, res){
        var uid = parseInt(req.cookies.uid);
        var transponder = req.params.transponder;
        var destStarId = parseInt(req.params.destStarId);

        assets_controller.setAssetCourse(transponder, uid, destStarId, {}, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });
   

    return router;
};
