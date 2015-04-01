'use strict';

/**
 * Analyse the query
 */
exports.analyse = function(req, res) {
    var text = req.params.text;
    res.jsonp({"hoi":text});

};


