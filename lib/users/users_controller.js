"use strict";

//var async = require("async");

function UsersController(options) {

	var self = this;

	self.options = options;

	self.usersCollection = options.db.collection('users');
	self.usersCollection.ensureIndex({uid: 1}, {unique: true}, function() {});
}

UsersController.prototype.getNextUid = function(cb) {
	var self = this;

    //var ret = self.usersCounter.findAndModify({query:{_id:name}, update:{$inc : {next:1}}, "new":true, upsert:true});
    // ret == { "_id" : "users", "next" : 1 }
    //return cb(null, ret.next);

    //Holy crap, this sucks, but it works for now
    self.usersCollection.find().toArray(function (err, userlist) {
		if (err != null) {
			return cb(err);
		}

		var highestUid = 0;
		for (var i in userlist) {
			if (userlist[i].uid > highestUid) {
				highestUid = userlist[i].uid;
			}
		}

		return cb(null, highestUid+1);
	});
};

UsersController.prototype.getUsers = function( cb ) {
	var self = this;

	self.usersCollection.find().toArray(function (err, userlist) {
		if (err != null) {
			return cb(err);
		}

        return cb(null, userlist);
    });
};

UsersController.prototype.addUser = function( username, password, email, cb ) {
	var self = this;

	self.usersCollection.findOne({username:username}, function(err, existingUser){
		if (err != null) {
			return cb(err);
		}

		if ((existingUser != null) && (existingUser.username == username)) {
			return cb("Username taken");
		}

		self.getNextUid(function (err, uid) {
			if (err != null) {
				return cb(err);
			}

			var now = Math.floor((new Date()).getTime() / 1000);
			//salt and hash this fucker later
			var user = { uid:uid, username:username, password:password, email:email, lastLogin:now };

			self.usersCollection.insert( user, function( err, result ) {
				if (err != null) {
					return cb(err);
				}

		        return cb(null, user);
			});
		});
	});
};

UsersController.prototype.addUserByDeviceId = function( deviceId, cb ) {
	var self = this;

	self.usersCollection.findOne({deviceId:deviceId}, function(err, existingUser){
		if (err != null) {
			return cb(err);
		}

		self.getNextUid(function (err, uid) {
			if (err != null) {
				return cb(err);
			}

			var now = Math.floor((new Date()).getTime() / 1000);
			//salt and hash this fucker later
			var user = { deviceId:deviceId, uid:uid, lastLogin:now };

			self.usersCollection.insert( user, function( err, result ) {
				if (err != null) {
					return cb(err);
				}

		        return cb(null, user);
			});
		});
	});
};

UsersController.prototype.removeUser = function( uid, cb ) {
	var self = this;

	self.usersCollection.remove( {uid:uid}, function( err ) {
		if (err != null) {
			return cb(err);
		}

        return cb(null, true);
    });
};

UsersController.prototype.getUser = function( uid, cb ) {
	var self = this;

	self.usersCollection.findOne( {uid:uid}, function( err, user ) {
		return cb(err, user);
	});
};

UsersController.prototype.loginUser = function( username, password, addUser, cb ) {
	var self = this;

	var now = Math.floor((new Date()).getTime() / 1000);
	var update = { $set:{lastLogin:now} };

	self.usersCollection.findAndModify({username:username}, {}, update, {"new":true},  function( err, result ) {
		if (err != null) {
			return cb(err);
		}

		var user = result.value;

		if (user == null) {
			if (!addUser) {
				return cb("noUser");
			}

			self.addUser(username, password, '', function( err, user ) {
				return cb(null, user);
			});			
		}
		else {
			//if (password != user.password) {
			//	return cb("Bad Password");
			//}

			//add auth shit here...

	        return cb(null, user);
	    }
	});
};


UsersController.prototype.loginUserByDeviceId = function( deviceId, cb ) {
	var self = this;

	var now = Math.floor((new Date()).getTime() / 1000);
	var update = { $set:{lastLogin:now} };

	self.usersCollection.findAndModify({deviceId:deviceId}, {}, update, {"new":true},  function( err, result ) {
		if (err != null) {
			return cb(err);
		}

		var user = result.value;
		
		if (user == null) {
			self.addUserByDeviceId(deviceId, function( err, user ) {
				return cb(null, user);
			});			
		}
		else {
			//if (password != user.password) {
			//	return cb("Bad Password");
			//}

			//add auth shit here...

	        return cb(null, user);
	    }
	});
};

var usersControllerInstance = null;
exports.create = function(options) {
	if( usersControllerInstance == null ) {
		usersControllerInstance = new UsersController(options);
	}
	return usersControllerInstance;
};
