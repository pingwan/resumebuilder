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
        } else if (idf.length !== 1) {
            return console.error(new Error('Multiple IDF\'s found in db.'));
        } else {
            // unpack array
            idf = idf[0];
            var idfWrapper = new vsm.InverseDocumentFrequency(idf.lookup, idf.N);
            callback(idfWrapper);
            return true;
        }
    });
};

var augmentFreqFactor = 0.5;
// Callback should accept the query weight vector as the first argument
var queryWeightVector = function(queryNGrams, callback){
    //var af = new vsm.AugmentedFrequency(augmentFreqFactor);
    var af = new vsm.OccurrenceVector();
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
        console.log(ngrams);
        queryWeightVector(ngrams, function(wv){
            Resume.find({}).populate('weightVector').exec(function(err,resumes){
                if (err){
                    console.error(err);
                } else {
                    // Rank weight vector angles
                    var compare = function(res1, res2){
                        //console.log(res1);
                        //console.log(res2);
                        //console.log(wv);
                        console.log('res1 = ' + res1.name);
                        console.log('res2 = ' + res2.name);
                        var rel1 = vsm.calculateRelevance(res1.weightVector, wv);
                        var rel2 = vsm.calculateRelevance(res2.weightVector, wv);
                        res1.magic = rel1;
                        res2.magic = rel2;
                        console.log('rel1: ' + rel1 + ' , rel2: ' + rel2);
                        console.log('wv = ' + wv);
                        if (rel1 < rel2){
                            return -1;
                        } else if (rel1 > rel2){
                            return 1;
                        } else {
                            return 0;
                        }
                    };
                    console.dir(resumes);
                    res.jsonp({res: resumes.sort(compare).reverse()});
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
