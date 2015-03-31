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
    weights: [Number],
    resume: {
        type: Schema.ObjectId,
        ref: 'Resume'
    }
});

mongoose.model('WeightVector', WeightVectorSchema);
