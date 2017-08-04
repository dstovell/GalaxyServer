"use strict";

function AIConditionalEvaluator(options) {
	var self = this;
	self.options = options;
}

AIConditionalEvaluator.prototype.evaluateConditional = function(conditional, entities, options) {
	var self = this;
	options = options || {};

	var checks = conditional.checks || [];
	if (checks.length === 0) {
		return false;
	}

	var checkPasses = 0;
	var checkResults = [];

	for (var i=0; i<checks.length; i++) {
		var check = checks[i];

		var enity = entities[check.enity];

		var cr = self._safeCallFuction(enity, check.func);
		checkResults.push(cr);
		if (cr) {
			checkPasses++;
		}
	}

	//Assume and for now
	return (checkPasses >= checks.length);
};

AIConditionalEvaluator.prototype._safeCallFuction = function(obj, funcName, p1, p2, p3, p4, p5) {
	if (obj == null) {
		return false;
	}

	var func = obj[funcName];
	if ((func == null) || (typeof func !== "function")) {
		return false;
	}

	return func(p1, p2, p3, p4, p5);
};

exports.create = function(options) {
	return new AIConditionalEvaluator(options);
};

