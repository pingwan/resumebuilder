'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var resumes = require('../../app/controllers/resumes.server.controller');

	// Resumes Routes
	app.route('/resumes')
		.get(resumes.list)
		.post(users.requiresLogin, resumes.create);

	app.route('/resumes/:resumeId')
		.get(resumes.read)
		.put(users.requiresLogin, resumes.hasAuthorization, resumes.update)
		.delete(users.requiresLogin, resumes.hasAuthorization, resumes.delete);

	// Finish by binding the Resume middleware
	app.param('resumeId', resumes.resumeByID);
};
