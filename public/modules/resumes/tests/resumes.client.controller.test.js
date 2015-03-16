'use strict';

(function() {
	// Resumes Controller Spec
	describe('Resumes Controller Tests', function() {
		// Initialize global variables
		var ResumesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Resumes controller.
			ResumesController = $controller('ResumesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Resume object fetched from XHR', inject(function(Resumes) {
			// Create sample Resume using the Resumes service
			var sampleResume = new Resumes({
				name: 'New Resume'
			});

			// Create a sample Resumes array that includes the new Resume
			var sampleResumes = [sampleResume];

			// Set GET response
			$httpBackend.expectGET('resumes').respond(sampleResumes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.resumes).toEqualData(sampleResumes);
		}));

		it('$scope.findOne() should create an array with one Resume object fetched from XHR using a resumeId URL parameter', inject(function(Resumes) {
			// Define a sample Resume object
			var sampleResume = new Resumes({
				name: 'New Resume'
			});

			// Set the URL parameter
			$stateParams.resumeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/resumes\/([0-9a-fA-F]{24})$/).respond(sampleResume);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.resume).toEqualData(sampleResume);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Resumes) {
			// Create a sample Resume object
			var sampleResumePostData = new Resumes({
				name: 'New Resume'
			});

			// Create a sample Resume response
			var sampleResumeResponse = new Resumes({
				_id: '525cf20451979dea2c000001',
				name: 'New Resume'
			});

			// Fixture mock form input values
			scope.name = 'New Resume';

			// Set POST response
			$httpBackend.expectPOST('resumes', sampleResumePostData).respond(sampleResumeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Resume was created
			expect($location.path()).toBe('/resumes/' + sampleResumeResponse._id);
		}));

		it('$scope.update() should update a valid Resume', inject(function(Resumes) {
			// Define a sample Resume put data
			var sampleResumePutData = new Resumes({
				_id: '525cf20451979dea2c000001',
				name: 'New Resume'
			});

			// Mock Resume in scope
			scope.resume = sampleResumePutData;

			// Set PUT response
			$httpBackend.expectPUT(/resumes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/resumes/' + sampleResumePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid resumeId and remove the Resume from the scope', inject(function(Resumes) {
			// Create new Resume object
			var sampleResume = new Resumes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Resumes array and include the Resume
			scope.resumes = [sampleResume];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/resumes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleResume);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.resumes.length).toBe(0);
		}));
	});
}());