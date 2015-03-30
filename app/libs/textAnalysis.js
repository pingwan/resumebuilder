'use strict';
var fs = require('fs');
var unirest = require('unirest');
var natural = require('natural');
var transform = require('stream-transform');
var NGrams = natural.NGrams;
var ArrayStream = require('arraystream');
var nodehun = require('nodehun');
var affbuf = fs.readFileSync('dict/en_US.aff');
var dictbuf = fs.readFileSync('dict/en_US.dic');
var dict = new nodehun(affbuf, dictbuf);
var node_ner = require('node-ner');
var ner = new node_ner({
    install_path:   'stanford-ner/' // This needs to be locally stored.
});
var synonyms = {};
var gngram;
var n = 0;
var callback;

var findSynonyms = function(ngram, callbackfn) {
    gngram = ngram;
    n = 0;
    callback = callbackfn;

    for(var i = 0; i < ngram.length; i++) {
        findSynonym(ngram[i]);
    }
};

var regen = function() {
    function combinations(choices, callback, prefix) {
        if (!choices.length) {
            return callback(prefix);
        }
        for (var c = 0; c < choices[0].length; c++) {
            combinations(choices.slice(1), callback, (prefix || []).concat(choices[0][c]));
        }
    }

    if(n == 2) {
        var res = [];

        var choices = [];
        for (var i = 0; i < gngram.length; i++) {
            choices.push(synonyms[gngram[i]]);
        }

        combinations(choices, function (data) {
            res.push(data);
        });
        callback(res);
    }
}

var findSynonym = function(text) {
    synonyms[text] = [];

    unirest.get('http://words.bighugelabs.com/api/2/fd7965b33e48895bcf3b30813b28f4a7/' + text + '/json')
        .header('Accept', 'application/json')
        .end(function (result) {
            var body = JSON.parse(result.body);
            if(body.noun && body.noun.syn) {
                var res = body.noun.syn;
                synonyms[text] = res.splice(0, 3);
            }
            synonyms[text].push(text);
            n++;
            regen();

        }
    );
};

//assuming text is an array of 'words'
var spellCheck = function() {
    return transform(function(text, callback) {
        dict.spellSuggest(text, function(err, correct, suggestion, origWord) {
            if(!correct) {
                text = suggestion;
            }

            callback(null, text);
        })
    });
};

var generateNGrams = function(text) {
    var n = 2;
    return NGrams.ngrams(text, n);
};

var stem = function() {
    return transform(function(text, callback) {
        dict.stem(text, function(err, stems) {
            if(err) {
                console.log(err);
            }

            //FIX LATER
            callback(null, text);
        })
    });
}

var namedEntityRecognition = function(){
    ner.fromFile('/Users/Ping/Downloads/CrowdFlower.txt', function(entities) {
        //This only works with a file  This returns a json object with recognized entities.
        console.log(entities);
        return entities;
    })
};

var stopWordsRemoval = function() {
    return transform(function(text, callback){
        var stopwords = require('stopwords').english;
        text = text.toLowerCase();

        if(stopwords.indexOf(text) > -1)
            callback(null, "");
        else
            callback(null, text);
    });
}

module.exports = {
    findSynonyms:  findSynonyms,
    spellCheck: spellCheck,
    generateNGrams: generateNGrams,
    stem: stem,
    stopWordsRemoval: stopWordsRemoval,
    namedEntityRecognition: namedEntityRecognition
};
