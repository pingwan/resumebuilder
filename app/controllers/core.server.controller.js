'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Resume = mongoose.model('Resume'),
    Item = mongoose.model('Item'),
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

            var text = [];

            var totalDocs = docs; //all the docs

            totalDocs.forEach(function(val,index){ //loop through every docs to get the items
                var items = val['items'];

                items.forEach(function(val,index){ //loop through every item to get the entry text.
                    text.push(val['text']);
                    console.log(val['text']);
                });

                var docText =  text.join(' '); //created one big string from the entry text

                /** TODO  Perform the textanalysis on the docText right here! :) **/

                var ngram = NGrams.bigrams(docText);
                var ov = new vsm.OccurrenceVector();
                ov.addTerms(ngram,1);
                tfs.push(ov);

                var bf = new vsm.BooleanFrequency();
                bf.OccurrenceVector = ov;
                btfs.push(bf);

                /** TODO so concatineer je volgens mij all de ngrams naar de globalNgrams maar als je dit uncomment dan crasht ie **/
                //globalNGrams = globalNGrams.concat(ngram);


            });

            /** all docs are finished processing here! **/

            // create the IDF generator
            var idfObj = vsm.IdfGenerator(globalNGrams,btfs);

            //Calculate the tf–idf score for each term, the score will be push to the idfScore array.
            globalNGrams.forEach(function(val,index){
                idfScore.push(idfObj.getIdf(val));
            });










        }
    });

}


