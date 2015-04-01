'use strict';

module.exports = function(app) {
	// Root routing
	var query = require('../../app/controllers/query.server.controller');

    app.route('/query/:text')
        .get(query.analyse);

};
