'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Resume = mongoose.model('Resume'),
	_ = require('lodash');

/**
 * Create a Resume
 */
exports.create = function(req, res) {
	var resume = new Resume(req.body);
	resume.user = req.user;

	resume.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(resume);
		}
	});
};

/**
 * Show the current Resume
 */
exports.read = function(req, res) {
	res.jsonp(req.resume);
};

/**
 * Update a Resume
 */
exports.update = function(req, res) {
	var resume = req.resume ;

	resume = _.extend(resume , req.body);

	resume.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(resume);
		}
	});
};

/**
 * Delete an Resume
 */
exports.delete = function(req, res) {
	var resume = req.resume ;

	resume.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(resume);
		}
	});
};

/**
 * List of Resumes
 */
exports.list = function(req, res) { 
	Resume.find().sort('-created').populate('user', 'displayName').exec(function(err, resumes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(resumes);
		}
	});
};

/**
 * Resume middleware
 */
exports.resumeByID = function(req, res, next, id) { 
	Resume.findById(id).populate('user', 'displayName').exec(function(err, resume) {
		if (err) return next(err);
		if (! resume) return next(new Error('Failed to load Resume ' + id));
		req.resume = resume ;
		next();
	});
};

/**
 * Resume authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.resume.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
