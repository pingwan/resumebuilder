'use strict';

//Setting up route
angular.module('resumes').config(['$stateProvider',
	function($stateProvider) {
		// Resumes state routing
		$stateProvider.
		state('listResumes', {
			url: '/resumes',
			templateUrl: 'modules/resumes/views/list-resumes.client.view.html'
		}).
		state('createResume', {
			url: '/resumes/create',
			templateUrl: 'modules/resumes/views/create-resume.client.view.html'
		}).
		state('viewResume', {
			url: '/resumes/:resumeId',
			templateUrl: 'modules/resumes/views/view-resume.client.view.html'
		}).
		state('editResume', {
			url: '/resumes/:resumeId/edit',
			templateUrl: 'modules/resumes/views/edit-resume.client.view.html'
		});
	}
]);