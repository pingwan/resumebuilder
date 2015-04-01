'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Item = mongoose.model('Item'),
    _ = require('lodash');

/**
 * Create a Item
 */
exports.create = function(req, res) {
    var item = new Item(req.body);
    item.user = req.user;

    item.save(function(err) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(item);
        }
    });
};

/**
 * Show the current Item
 */
exports.read = function(req, res) {
    res.jsonp(req.item);
};

/**
 * Update a Item
 */
exports.update = function(req, res) {
    var item = req.item ;

    item = _.extend(item , req.body);

    item.save(function(err) {
        if (err) {
            res.status(400).send({ // shouldn't this be 500?
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(item);
        }
    });
};

/**
 * Delete an Item
 */
exports.delete = function(req, res) {
    var item = req.item ;

    item.remove(function(err) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(item);
        }
    });
};

/**
 * List of Items
 */
exports.list = function(req, res) {
    Item.find(req.query).sort('-created').populate('user', 'displayName').populate('entry').exec(function(err, items) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(items);
        }
    });
};

/**
 * Item middleware
 */
exports.itemByID = function(req, res, next, id) {
    Item.findById(id).populate('user', 'displayName').exec(function(err, item) {
        if (err) {
            next(err);
        } else if (!item) {
            next(new Error('Failed to load Item ' + id));
        } else {
            req.item = item ;
            next();
        }
    });
};

/**
 * Item authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.item.user.id !== req.user.id) {
        res.status(403).send('User is not authorized');
        return;
    } else {
        next ();
    }
};
