/* jshint -W097 */
'use strict';

// load math.js
var math = require('mathjs');

/* The standard lingo is used where applicable in this module. See
 wikipedia on tf-idf for more info.
 - Term Frequency (tf)
 - Inverse Document Frequency (idf)
 - Term Frequency-Inverse Document Frequency (tf-idf) (= tf x idf)

 Some of the simpler specific implementations of these concepts are
 defined as well.

The 'interface' for tf is as follows;
- addTerms(ngrams [, weight, callback])
- getOccurrence(term);

Recommendation from wikipedia for documents:
tf-idf = raw tf x inverse frequency
Recommendation from wikipedia for queries:
tf-idf = double normalization K (K=0.5) x inverse frequency

FIXME: use either ngram (singular) or term for referring to the atomic
pieces of data that make up both documents and queries.
*/

/*
 For building a useful idf, a list of all ngrams in the dataset should
 be obtained, as well as a BooleanTermFrequency (btfs) of each document in
 the dataset. */
function InverseDocumentFrequency (lookup, N) {
    this.lookup = lookup;
    this.N = N;
}


function IdfGenerator(ngrams, btfs){
    var N = btfs.length;
    var table = {};

    console.log("IDF gen");
    console.dir(ngrams);
    console.dir(btfs);
    for(var ngram in ngrams) {
        for(var btf in btfs) {
            if(btf.getOccurrence(ngram)) {
                console.log("adding ngram+1 to idf");
                table[ngram] = (table[ngram] || 0) + 1;
            }
        }
    }
    return new InverseDocumentFrequency(table, N);
}


// probably very, very slow. Cron job?
InverseDocumentFrequency.prototype.getIdf = function (term) {
    if (this.N === 0){
        throw new Error("Can't calculate the idf for an empty collection of documents");
    }
    return Math.log(this.N/ ( 1 + this.lookup[term]));
};


/*
 OccurrenceVector is just a wrapper around a standard JavaScript
 dictionary, with some convenience functions added to the prototype of
 the constructor. An OccurrenceVector can be used directly, making it
 the raw tf/idf implementation, or wrapped for modified tf/idf behavior.

 N is defined as the amount of words in each n-gram.
*/
function OccurrenceVector () {
    this.lookup = {};
}


OccurrenceVector.prototype.getOccurrence = function (term) {
    return (this.lookup[term] || 0);
};


/* ngrams is formatted like the result value of the natural.NGrams
 function */
OccurrenceVector.prototype.addTerms = function (ngrams, weight, callback) {
    console.log("Adding terms to ov");
    console.dir(ngrams);
    for(var i = 0; i< ngrams.length; i++) {
        var term = ngrams[i];
        // Could also be:
        // this.lookup[gram] = this.lookup[gram] ? this.lookup[gram]+1 : 1;
        this.lookup[term] = (this.lookup[term] || 0) + weight;
        // Only supply execute callback if it is actually passed via args
        callback && callback(term, this.lookup[term]);
    }
};

/*
BooleanTermFrequency is used as a tf implementation that checks
whether a particular term or ngram occurs in a document at the
existence
*/

function BooleanFrequency () {
    this.OccurrenceVector = new OccurrenceVector();
}


BooleanFrequency.prototype.getOccurrence = function (term) {
    return !!(this.OccurrenceVector.getOccurrence(term));
};

BooleanFrequency.prototype.addTerms = function (ngrams) {
    this.OccurrenceVector.addTerms(ngrams, 1);
};

//augmented tf normalization. 0 <= K <= 1
function AugmentedFrequency (K) {
    this.OccurrenceVector = new OccurrenceVector();
    this.K = K; // See double normalization K on the wikipedia tf-idf page
    this.maxFrequency = 0; // Caching of highest (raw) tf.
}


AugmentedFrequency.prototype.getOccurrence = function (term) {
    if (this.maxFrequency === 0) { // only when no terms have been added
        return 0;
    }
    return (this.K + (1 - this.K) *
            (this.OccurrenceVector.getOccurrence(term) / this.maxFrequency));
};

AugmentedFrequency.prototype.addTerms = function (ngrams, weight){
    this.OccurrenceVector.addTerms(ngrams, weight, function(gram, count){
        this.maxFrequency = Math.max(this.maxFrequency, count);
    });
};

/*
 To calculate the relevance of a query to a document, we need the
 weight vector for both the query and document (see comment at top of
 file for calculation). Due to not having negative occurrences, the
 result of this method should be between 0 (no matches) and 1 (exactly
 the same)
*/
function calculateRelevance(documentWeightVector, queryWeightVector) {
    var dot = math.dot(documentWeightVector, queryWeightVector);
    var docVectorLength = sizeHelper(documentWeightVector);
    var queryVectorLength = sizeHelper(queryWeightVector);
    var denom = docVectorLength * queryVectorLength;

    if(denom === 0){
        return 0;
    } else {
        return dot / denom;
    }
}


function sizeHelper(vector){
    var sizeSquared = 0;
    var counter = function(value, index) {
        sizeSquared += math.pow(value, 2);
    };
    vector.forEach(counter);
    return math.sqrt(sizeSquared);
}

module.exports = {
    OccurrenceVector: OccurrenceVector,
    InverseDocumentFrequency: InverseDocumentFrequency,
    IdfGenerator: IdfGenerator,
    BooleanFrequency: BooleanFrequency,
    AugmentedFrequency: AugmentedFrequency,
    calculateRelevance: calculateRelevance
};
