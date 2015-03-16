'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Resume Schema
 */
var ResumeSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Resume name',
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

mongoose.model('Resume', ResumeSchema);