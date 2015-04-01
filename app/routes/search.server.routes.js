'use strict';

module.exports = function(app) {
    var search = require('../../app/controllers/search.server.controller');

    app.route('/search').get(search.exec);

};
