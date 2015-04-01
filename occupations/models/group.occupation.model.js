'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Group Schema
 */
var GroupSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Title name',
        trim: true
    },
    code: {
        type: String,
        default:'',
        trim:true
    }
});

module.exports = mongoose.model('Occupation.Group', GroupSchema);
