'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * idf Schema (for vsm)
 */
var IdfSchema = new Schema({
    N: Number,
    lookup: Schema.Types.Mixed
});

mongoose.model('Idf', IdfSchema);
