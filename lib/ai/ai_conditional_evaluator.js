"use strict";

function AIConditionalEvaluator(options) {
	var self = this;
	self.options = options;
}

AIConditionalEvaluator.prototype.evaluateConditionalsAndCallActions = function(async, conditionals, entities, options, cb) {
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	var actionResults = [];

	async.each(conditionals, function(conditional, nextConditional) {

		var evalResult = self.evaluateConditional(conditional, entities, options);
		if (!evalResult.passed) {
			nextConditional();
		}

		self.callConditionalActions(async, conditional, entities, options, function(err, actionResult) {
			actionResults.push(actionResult);

			if (conditional.breakOnPass) {
				return cb(err, actionResults);
			}


			return nextConditional();
		});
	},
	function (err) {
		return cb(err, actionResults);
	});	
};

AIConditionalEvaluator.prototype.evaluateConditional = function(conditional, entities, options) {
	//var self = this;
	options = options || {};

	var checks = conditional.checks || [];
	if (checks.length === 0) {
		return false;
	}

	var checkPasses = 0;
	var checkResults = [];

	for (var i=0; i<checks.length; i++) {
		var check = checks[i];
		var entity = entities[check.entity] || {};

		var params = {};
		var cr = entity.runCheck(check.func, params);

		checkResults.push(cr);
		if (cr) {
			checkPasses++;
		}
	}

	return {passed:(checkPasses === checkResults.length), checkResults:checkResults, checkPasses:checkPasses};
};

AIConditionalEvaluator.prototype.callConditionalActions = function(async, conditional, entities, options, cb) {

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	var actions = conditional.actions || [];
	if (actions.length === 0) {
		return false;
	}

	var actionSuccesses = 0;

	async.each(actions, function(action, nextAction) {
	
		var entity = entities.self || {};

		var params = {};
		entity.runAction(action.func, params, function(err){
			if (!err) {
				actionSuccesses++;
			}		

			return nextAction();
		});
	},
	function(err) {
		return cb(err, {actionSuccesses:actionSuccesses});
	});
};

exports.create = function(options) {
	return new AIConditionalEvaluator(options);
};

