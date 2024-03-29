'use strict';

module.exports = function(app) {
    // Root routing
    var core = require('../../app/controllers/core.server.controller');
    app.route('/reindex').get(core.reindex);
    app.route('/').get(core.index);
};
