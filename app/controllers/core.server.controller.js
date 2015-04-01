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

    Resume.find({}).populate('items').exec(function(err,docs){
        if(!err){


            var totalDocs = docs; //all the docs

            totalDocs.forEach(function(val,index){ //loop through every docs to get the items
                var text = [];
                var items = val['items'];

                items.forEach(function(val,index){ //loop through every item to get the entry text.
                    text.push(val['text']);
                });

                var docText =  text.join(' '); //created one big string from the entry text

                /** TODO  Perform the textanalysis on the docText right here! :) **/

                var ngram = NGrams.bigrams(docText);
                //console.log(ngram);

                var ov = new vsm.OccurrenceVector();
                ov.addTerms(ngram,1);
                tfs.push(ov);

                var bf = new vsm.BooleanFrequency();
                bf.OccurrenceVector = ov;
                console.log("logloglog" );
                console.dir(ov);
                btfs.push(bf);

                if(ngram && globalNGrams.indexOf(ngram) === -1) {
                    globalNGrams = globalNGrams.concat(ngram);
                }
            });

            // create the IDF model
            var idfObj = vsm.IdfGenerator(globalNGrams,btfs);
            var tf_idfs = [];

            // Use the tfs and idf to calculate the tf-idf score for
            // each term for each document, making up the weights
            // vector for the vector space model
            for(var i=0; i<tfs.length; i++){
                var tf = tfs[i];
                var doc = totalDocs[i];
                var weightVector = [];

                globalNGrams.forEach(function(term,index){
                    weightVector.push(tf.getOccurrence(term) * idfObj.getIdf(term));
                });
                var wv = new WeightVector({weights: weightVector});
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
                        console.log('saved a Doc / WeightVector link without errors');
                    });
                });
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
                    //console.dir(idf.lookup);
                    //console.log('saved idf singleton');
                });
            });
        }
    });
    res.render('index', {
        user: req.user || null,
        request: req
    });

};
