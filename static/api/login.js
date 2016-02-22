"use strict";

function loginManager() {
	this.loginUser = function(username, password, cb) {
		jQuery.post( "/api/users/loginuser",
		{
			username:username,
			password:password,
			add:true
		},
		function( result ) {
			return cb( result );
		});
	};

	this.addUser = function(username, password, cb) {
		jQuery.post( "/api/users/adduser",
		{
			username:username,
			email:'',
			password:password
		},
		function( result ) {
			return cb( result );
		});
	};

	this.logoutUser = function(cb) {
		jQuery.post( "/api/users/logoutuser",
		{},
		function( result ) {
			return cb();
		});
	};

	this.getCookie = function(cname) {
	    var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0; i<ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1);
	        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
	    }
	    return "";
	};

	this.isLoggedIn = function() {
		if (this.getCookie('username') !== '') {
			return true;
		}
		return false;
	};

	this.getUsername = function() {
		return this.getCookie('username');
	};

	this.getUserId = function() {
		return this.getCookie('uid');
	};
}

var LoginManager = new loginManager();
