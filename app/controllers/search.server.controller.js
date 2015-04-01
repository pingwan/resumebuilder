'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('./errors.server.controller'),
    analysis = require('../../app/libs/textAnalysis'),
    transform = require('stream-transform'),
    _ = require('lodash');

/**
 * Execute a search
 */
exports.exec = function(req, res) {
    res.jsonp({res: 'nothing yet'});
};

/**
 * Entry authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.entry.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
