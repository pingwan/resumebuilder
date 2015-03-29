'use strict';
var fs = require('fs');
var unirest = require('unirest');
var natural = require('natural');
var NGrams = natural.NGrams;
var nodehun = require('nodehun');
var affbuf = fs.readFileSync('dict/en_US.aff');
var dictbuf = fs.readFileSync('dict/en_US.dic');
var dict = new nodehun(affbuf, dictbuf);
var node_ner = require('node-ner');
var ner = new node_ner({
    install_path:   '/Users/Ping/Desktop/SANode/stanford-ner' // This needs to be locally stored.
});

//assuming text is an array of 'words'
var findSynonyms = function(text) {
    for(var i = 0; i < text.length; i++) {
        unirest.get('https://wikisynonyms.p.mashape.com/' + text[i])
            .header('X-Mashape-Key', 'zjgDVimNVlmshl26iHdg5glGKLiop1vwYKGjsnKLHSeqM1FHZn')
            .header('Accept', 'application/json')
            .end(function (result) {
                if(result.body && result.body.message === 'success') {
                    for(var j = 0; j < result.body.terms.length; j++) {
                        var term = result.body.terms[j].term;
                        if(text.indexOf(term) === -1) {
                            text.push(term);
                        }
                    }
                }
            }
        );
    }

    return text;
};

//assuming text is an array of 'words'
var spellCheck = function(text) {
    for(var i = 0; i < text.length; i++) {
        //copy index to avoid async index bugs;
        var index = i;
        dict.spellSuggest(text[index], function(err, correct, suggestion, origWord) {
            if(!correct) {
                text[index] = suggestion;
            }
        })
    }

    return text;
}

var generateNGrams = function(text) {
    var n = 2;
    return NGrams.ngrams(text, n);
}

var stem = function(text) {
    for(var i = 0; i < text.length; i++) {
        //copy index to avoid async index bugs;
        var index = i;
        dict.stem(text[index], function(err, stems) {
            console.log(stems);
        })
    }
}

var nameEntityRecognition = function(){
    ner.fromFile('/Users/Ping/Downloads/CrowdFlower.txt', function(entities) {
        //This only works with a file  This returns a json object with recognized entities.
        console.log(entities);
        return entities;
    })
}

var stopWordsRemoval = function(text){
    var stopwords = require('stopwords').english;
    var textExplode = text.split(" ");

    for (var y = 0; y < textExplode.length; y++){
        textExplode[y] = textExplode[y].toLowerCase();
    }

    for (var x = 0; x < textExplode.length; x++){
        for ( var i = 0; i < stopwords.length; i++){
            if(textExplode[x] == stopwords[i]){
                textExplode[x] = ""
                break;
            }
        }
    }

    textExplode = textExplode.filter(Boolean)

    return textExplode;  //this is a array containging all the words without stopwords.
}

module.exports = {
    findSynonyms:  findSynonyms,
    spellCheck: spellCheck,
    generateNGrams: generateNGrams,
    stem: stem
};
