'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Resume = mongoose.model('Resume'),
    Item = mongoose.model('Item'),
    WeightVector = mongoose.model('WeightVector'),
    Idf = mongoose.model('Idf'),
    _ = require('lodash');

var NGrams = require('natural').NGrams;
var vsm = require('../libs/vsm');
var textAnalyzer = require('../libs/textAnalysis.js');

exports.index = function(req, res) {
    res.render('index', {
        user: req.user || null,
        request: req
    });
};


exports.reindex = function(req,res){

    /*Resume.find().populate('items').exec(function(err,docs){
     console.dir(docs);
     });*/

    var globalNGrams = [];
    var idfScore = [];
    var btfs = [];
    var tfs = [];

    Resume.find({}).populate('items').populate('items.entry').exec(function(err,docs){
        if(!err){
            var totalDocs = docs; //all the docs
            var amountDocs = totalDocs.length;

            console.log(docs[0]);

            var calcWeightVector = function(ngrams, tf, idf){
                var weightVector = [];
                var pushToWeightVector = function(term){
                    weightVector.push(tf.getOccurrence(term) * idf.getIdf(term));
                };
                ngrams.forEach(pushToWeightVector);
                return weightVector;
            };

            var updateWeightVector = function (doc, wv) {
                    wv.save(function (err, wv) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log('saved a WeightVector without errors');
                        doc.weightVector = wv._id;
                        doc.save(function (err, doc) {
                            if (err) {
                                return console.error(err);
                            }
                            return true;
                        });
                        return true;
                    });
            };

            var generateIDF = function(){
                // create the IDF model
                var idfObj = vsm.IdfGenerator(globalNGrams,btfs);
                var tf_idfs = [];

                // Use the tfs and idf to calculate the tf-idf score for
                // each term for each document, making up the weights
                // vector for the vector space model
                for(var i=0; i<tfs.length; i++){
                    console.log('Generating wvs in loop');
                    var tf = tfs[i];
                    var doc = totalDocs[i];

                    var wv = new WeightVector({weights: calcWeightVector(globalNGrams, tf, idfObj)});
                    updateWeightVector(doc, wv);
                }

                var idfSingleton;
                Idf.find().exec(function(err, idf) {
                    if (idf.length === 0) {
                        idfSingleton = new Idf();
                    } else {
                        idfSingleton = idf[0];
                    }
                    idfSingleton.N = idfObj.N;
                    idfSingleton.lookup = idfObj.lookup;
                    idfSingleton.save(function(err, idfSingleton){
                        if (err) {
                            return console.error(err);
                        }
                        return true;
                    });
                });
            };

            var docCounter = 0;
            totalDocs.forEach(function(val,index){ //loop through every docs to get the items
                var text = [];
                var items = val.items;
                var itemspopulated = 0;
                var finalactions = function() {
                    var docText =  text.join(' '); //created one big string from the entry text

                    textAnalyzer.execTextAnalysis(docText, function(ngrams){
                        console.log('callback');
                        var ov = new vsm.OccurrenceVector();
                        ov.addTerms(ngrams,1);
                        tfs.push(ov);

                        // for calculating idfs
                        var bf = new vsm.BooleanFrequency();
                        bf.OccurrenceVector = ov;
                        btfs.push(bf);

                        if(ngrams) {
                            ngrams.forEach(function(ngram, index){
                                var currentNgram = ngram.toString();
                                if(globalNGrams.indexOf(currentNgram) === -1){
                                    globalNGrams.push(currentNgram);
                                }
                            });
                        }

                        console.log('Incrementing doccounter');
                        docCounter++;
                        if(docCounter === amountDocs){
                            console.log('doccounter complete');
                            generateIDF();
                        }
                    });
                    var ngrams = NGrams.bigrams(docText);
                }


                items.forEach(function(val,index){ //loop through every item to get the entry text.
                    Item.findOne({_id: val._id}).populate('entry').exec(function(err, item) {
                        if(err) {
                            console.log(err);
                            return;
                        }
                        // index entry names, titles and item text and title
                        text.push(item.entry.name + ' ' + item.entry.title + ' ' + val.name + ' ' + val.text);

                        itemspopulated++;
                        if(itemspopulated == items.length) {
                            finalactions();
                        }
                    });
                });
            });

        } else {
            console.error(err);
        }
    });
    res.json({key: 'success'});

};
