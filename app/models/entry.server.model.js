'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Entry Schema
 */
var EntrySchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Entry name',
		trim: true
	},
    title:{
        type: String,
        default: '',
        required: 'Please fill Entry name',
        trim: true
    },
    startDate : {
        type: Date
    },
    endDate : {
        type: Date
    },
    timeSpent : {
        type: String
    },
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    group: {
        type: Schema.ObjectId,
        ref: 'Group'
    },
    items: [{
        type: Schema.ObjectId,
        ref: 'Item'
    }]
});

mongoose.model('Entry', EntrySchema);
