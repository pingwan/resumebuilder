'use strict';

//Resumes service used to communicate Resumes REST endpoints
angular.module('resumes').factory('Resumes', ['$resource',
	function($resource) {
		return $resource('resumes/:resumeId', { resumeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);