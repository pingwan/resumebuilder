'use strict';

/**
 * Analyse the query
 */

var textAnalyzer = require('../libs/textAnalysis.js');

exports.analyse = function(req, res) {
    var text = req.params.text;

    textAnalyzer.execTextAnalysis(text,function(data){
        console.log(data);
    });

    res.jsonp({'hoi':text});

};
