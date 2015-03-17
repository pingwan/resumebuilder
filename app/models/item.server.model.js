'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Item Schema
 */
var ItemSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Item name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	entry: {
		type: Schema.ObjectId,
		ref: 'Entry'
	},
    text: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Item', ItemSchema);
