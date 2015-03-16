'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Resume = mongoose.model('Resume'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, resume;

/**
 * Resume routes tests
 */
describe('Resume CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Resume
		user.save(function() {
			resume = {
				name: 'Resume Name'
			};

			done();
		});
	});

	it('should be able to save Resume instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Resume
				agent.post('/resumes')
					.send(resume)
					.expect(200)
					.end(function(resumeSaveErr, resumeSaveRes) {
						// Handle Resume save error
						if (resumeSaveErr) done(resumeSaveErr);

						// Get a list of Resumes
						agent.get('/resumes')
							.end(function(resumesGetErr, resumesGetRes) {
								// Handle Resume save error
								if (resumesGetErr) done(resumesGetErr);

								// Get Resumes list
								var resumes = resumesGetRes.body;

								// Set assertions
								(resumes[0].user._id).should.equal(userId);
								(resumes[0].name).should.match('Resume Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Resume instance if not logged in', function(done) {
		agent.post('/resumes')
			.send(resume)
			.expect(401)
			.end(function(resumeSaveErr, resumeSaveRes) {
				// Call the assertion callback
				done(resumeSaveErr);
			});
	});

	it('should not be able to save Resume instance if no name is provided', function(done) {
		// Invalidate name field
		resume.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Resume
				agent.post('/resumes')
					.send(resume)
					.expect(400)
					.end(function(resumeSaveErr, resumeSaveRes) {
						// Set message assertion
						(resumeSaveRes.body.message).should.match('Please fill Resume name');
						
						// Handle Resume save error
						done(resumeSaveErr);
					});
			});
	});

	it('should be able to update Resume instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Resume
				agent.post('/resumes')
					.send(resume)
					.expect(200)
					.end(function(resumeSaveErr, resumeSaveRes) {
						// Handle Resume save error
						if (resumeSaveErr) done(resumeSaveErr);

						// Update Resume name
						resume.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Resume
						agent.put('/resumes/' + resumeSaveRes.body._id)
							.send(resume)
							.expect(200)
							.end(function(resumeUpdateErr, resumeUpdateRes) {
								// Handle Resume update error
								if (resumeUpdateErr) done(resumeUpdateErr);

								// Set assertions
								(resumeUpdateRes.body._id).should.equal(resumeSaveRes.body._id);
								(resumeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Resumes if not signed in', function(done) {
		// Create new Resume model instance
		var resumeObj = new Resume(resume);

		// Save the Resume
		resumeObj.save(function() {
			// Request Resumes
			request(app).get('/resumes')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Resume if not signed in', function(done) {
		// Create new Resume model instance
		var resumeObj = new Resume(resume);

		// Save the Resume
		resumeObj.save(function() {
			request(app).get('/resumes/' + resumeObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', resume.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Resume instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Resume
				agent.post('/resumes')
					.send(resume)
					.expect(200)
					.end(function(resumeSaveErr, resumeSaveRes) {
						// Handle Resume save error
						if (resumeSaveErr) done(resumeSaveErr);

						// Delete existing Resume
						agent.delete('/resumes/' + resumeSaveRes.body._id)
							.send(resume)
							.expect(200)
							.end(function(resumeDeleteErr, resumeDeleteRes) {
								// Handle Resume error error
								if (resumeDeleteErr) done(resumeDeleteErr);

								// Set assertions
								(resumeDeleteRes.body._id).should.equal(resumeSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Resume instance if not signed in', function(done) {
		// Set Resume user 
		resume.user = user;

		// Create new Resume model instance
		var resumeObj = new Resume(resume);

		// Save the Resume
		resumeObj.save(function() {
			// Try deleting Resume
			request(app).delete('/resumes/' + resumeObj._id)
			.expect(401)
			.end(function(resumeDeleteErr, resumeDeleteRes) {
				// Set message assertion
				(resumeDeleteRes.body.message).should.match('User is not logged in');

				// Handle Resume error error
				done(resumeDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Resume.remove().exec();
		done();
	});
});