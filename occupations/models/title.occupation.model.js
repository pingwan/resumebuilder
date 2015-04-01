'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Title Schema
 */
var TitleSchema = new Schema({
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

module.exports = mongoose.model('Occupation.Title', TitleSchema);
