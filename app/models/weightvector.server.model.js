'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * WeightVector Schema (for vsm)
 */
var WeightVectorSchema = new Schema({
    weights: [Number]
});

mongoose.model('WeightVector', WeightVectorSchema);
