'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('./errors.server.controller'),
    analysis = require('../../app/libs/textAnalysis'),
    _ = require('lodash');

/**
 * Execute a search
 */
exports.exec = function(req, res) {
    var blocks = [analysis.findSynonyms, analysis.spellCheck, analysis.generateNGrams, analysis.stem];
    var query = ['I', 'like', 'information', 'retrieval'];

    blocks.forEach(function(elem, index, array) {
        elem(query);
    })

    res.jsonp({res: query});
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
