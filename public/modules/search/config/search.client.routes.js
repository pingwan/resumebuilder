'use strict';

//Setting up route
angular.module('search').config(['$stateProvider',
	function($stateProvider) {
		// Entries state routing
		$stateProvider.
		state('search', {
			url: '/search',
			templateUrl: 'modules/search/views/search.client.view.html'
		});
	}
]);
