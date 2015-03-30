'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('./errors.server.controller'),
    analysis = require('../../app/libs/textAnalysis'),
    ArrayStream = require('arraystream'),
    transform = require('stream-transform'),
    result = [],
_ = require('lodash');

/**
 * Execute a search
 */
exports.exec = function(req, res) {
    var blocks = [analysis.stem];
    var query = ['I', 'like', 'information', 'retrieval'];
    var stream = ArrayStream.create(query);
    result = [];

    stream.pipe(analysis.spellCheck()).pipe(analysis.stem()).pipe(analysis.stopWordsRemoval()).pipe(endpipe()).on('finish', function() {
        var ngrams = analysis.generateNGrams(result);

        for(var i = 0; i < ngrams.length; i++) {
            analysis.findSynonyms(ngrams[i], function(data) {
                console.log(data);
            });
        }
    });

    res.jsonp({res: query});
};

var endpipe = function() {
    return transform(function(text, callback) {
        if(text != "")
            result.push(text);

        callback(null, text);
    });
}

/**
 * Entry authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.entry.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
