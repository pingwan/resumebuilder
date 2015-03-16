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
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Entry', EntrySchema);