'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Idf = mongoose.model('Idf'),
    Resume = mongoose.model('Resume'),
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
    console.log(query);
    analysis.execTextAnalysis(query, function(ngrams){
        queryWeightVector(ngrams, function(wv){
            Resume.find({}).populate('weightVector').exec(function(err,resumes){
                if (err){
                    console.error(err);
                } else {
                    var compare = function(res1, res2){
                        var rel1 = vsm.calculateRelevance(res1.weightVector, wv);
                        var rel2 = vsm.calculateRelevance(res2.weightVector, wv);
                        if (rel1 < rel2){
                            return -1;
                        } else if (rel1 > rel2){
                            return 1;
                        } else {
                            return 0;
                        }
                    };
                    console.dir(resumes);
                    res.jsonp({res: resumes.sort(compare)});
                }
            });
        });
    });
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
