'use strict';

// Configuring the Articles module
angular.module('search').run(['Menus',
	function(Menus) {
		// Set top bar menu items
        Menus.addMenuItem('topbar', 'Search', 'entries', 'dropdown', '/entries(/create)?');
        Menus.addSubMenuItem('topbar', 'entries', 'Search candidate', 'search');

	}
]);
