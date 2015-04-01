'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('./errors.server.controller'),
    Idf = mongoose.model('Idf'),
    vsm = require('../../app/libs/vsm'),
    analysis = require('../../app/libs/textAnalysis'),
    transform = require('stream-transform'),
    _ = require('lodash');

// Callback should accept the idf singleton as the first argument
var retrieveIdf = function(callback) {
    Idf.find().exec(function(err, idf) {
        if (err) {
            return console.error(err);
        } else if (idf.length !== 0) {
            return console.error(new Error('Multiple IDF\'s found in db.'));
        } else {
            var idfWrapper = new vsm.InverseDocumentFrequency(idf.lookup, idf.N);
            callback(idfWrapper);
            return true;
        }
    });
};

var augmentFreqFactor = 0.5;
// Callback should accept the query weight vector as the first argument
var queryWeightVector = function(queryNGrams, callback){
    var af = new vsm.AugmentedFrequency(augmentFreqFactor);
    af.addTerms(queryNGrams, 1.0);
    retrieveIdf(function(idf){
        callback(idf.getWeightVector(af));
    });
};



/**
 * Execute a search
 */
exports.exec = function(req, res) {
    var query = req.params.query;
    /*analysis.execTextAnalysis(query, function(ngrams){
        queryWeightVector(ngrams, function(wv){
            // get all Resumes, compare wv with each Resume.weightVector (via vsm.calculateRelevance), order output
        });
    });*/
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
