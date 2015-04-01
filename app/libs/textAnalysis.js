'use strict';
var fs = require('fs');
var unirest = require('unirest');
var natural = require('natural');
var transform = require('stream-transform');
var result = [];
var ArrayStream = require('arraystream');
var NGrams = natural.NGrams;
var nodehun = require('nodehun');
var affbuf = fs.readFileSync('dict/en_US.aff');
var dictbuf = fs.readFileSync('dict/en_US.dic');
var dict = new nodehun(affbuf, dictbuf);
var node_ner = require('node-ner');
var ner = new node_ner({
    install_path:   'stanford-ner/' // This needs to be locally stored.
});
var synonyms = {};
var ngrams;
var n;
var callback;
var noterms;

var execTextAnalysis = function(text, callback) {
    var query = text.split(' ');
    var stream = ArrayStream.create(query);
    result = [];

    var syn = false;

    stream.pipe(spellCheck()).pipe(stem()).pipe(stopWordsRemoval()).pipe(endpipe()).on('finish', function() {
        ngrams = generateNGrams(result);
        noterms = ngrams.length * 2;
        console.log('finish called ' + result);

        if(syn){
            for(var i = 0; i < ngrams.length; i++) {
                findSynonyms(ngrams[i], callback);
            }
        } else {
            callback(ngrams);
        }

    });
}

var endpipe = function() {
    return transform(function(text, callback) {
        if(text !== "")
            result.push(text);

        callback(null, text);
    });
}

var findSynonyms = function(ngram, callbackfn) {
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

    var res = [];
    var choices = [];

    for (var i = 0; i < ngrams.length; i++) {
        choices = [];
        for (var j = 0; j < ngrams[i].length; j++) {
            choices.push(synonyms[ngrams[i][j]]);
        }
        combinations(choices, function (data) {
            res.push(data);
        });
    }

    callback(res);
}

var findSynonym = function(text) {
    synonyms[text] = [];

    unirest.get('http://words.bighugelabs.com/api/2/fd7965b33e48895bcf3b30813b28f4a7/' + text + '/json')
        .header('Accept', 'application/json')
        .end(function (result) {
            if(typeof(result) === "undefined") {
                throw new Error("No reply from synonym API (check internet connection)");
            }

            var body = result.body ? JSON.parse(result.body): undefined;
            if (body && body.noun && body.noun.syn) {
                var res = body.noun.syn;
                synonyms[text] = res.splice(0, 3);
            }
            synonyms[text].push(text);

            n++
            if (n == noterms)
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

            if(stems.length > 1)
                text = stems[1];
            else if(stems.length == 1)
                text = stems[0];

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

        if(stopwords.indexOf(text) > -1) {
            callback(null, "");
        }
        else {
            callback(null, text);
        }
    });
}

module.exports = {
    findSynonyms:  findSynonyms,
    spellCheck: spellCheck,
    generateNGrams: generateNGrams,
    stem: stem,
    stopWordsRemoval: stopWordsRemoval,
    namedEntityRecognition: namedEntityRecognition,
    execTextAnalysis: execTextAnalysis
};
