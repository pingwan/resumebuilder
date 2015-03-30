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
    var btfs = [];
    var tfs = [];

    Resume.find({}).populate('items').exec(function(err,docs){
        if(!err){

            var text = [];

            console.log(docs[0]['_doc']['items']);

            var items = docs[0]['_doc']['items'];


            items.forEach(function(val,index){
               /*Item.findOne(val).populate('entry').exec(function(err,entry){
                    console.dir(entry);
               });*/

                text.push(val.text);

            });

           var docText =  text.join(' ');

            /** TODO  Perform the textanalysis right here! :) **/



            var ngram = NGrams.bigrams(docText);

            var ov = new vsm.OccurrenceVector();
            ov.addTerms(ngram,1);
            tfs.push(ov);
            /** TODO save to global scope **/

            var bf = new vsm.BooleanFrequency();
            bf.OccurrenceVector = ov;
            btfs.push(bf);

            /** TODO ngram to global ngramlist **/
            globalNGrams.concat(ngram);

            // keep track of amt processed docs
            // if amt == all_docs
            // generate and IDF and each tf-idf.
            //






        }
    });

}


