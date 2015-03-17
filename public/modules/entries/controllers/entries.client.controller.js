'use strict';

// Entries controller
angular.module('entries').controller('EntriesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Entries', 'Groups', '$log',
	function($scope, $stateParams, $location, Authentication, Entries, Groups, $log) {
		$scope.authentication = Authentication;

		// Create new Entry
		$scope.create = function() {
			// Create new Entry object
			var entry = new Entries ({
				name: this.name
			});

			// Redirect after save
			entry.$save(function(response) {
				$location.path('entries/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Entry
		$scope.remove = function(entry) {
			if ( entry ) { 
				entry.$remove();

				for (var i in $scope.entries) {
					if ($scope.entries [i] === entry) {
						$scope.entries.splice(i, 1);
					}
				}
			} else {
				$scope.entry.$remove(function() {
					$location.path('entries');
				});
			}
		};

		// Update existing Entry
		$scope.update = function() {
			var entry = $scope.entry;

			entry.$update(function() {
				$location.path('entries/' + entry._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Entries
		$scope.find = function() {
			$scope.entries = Entries.query();
		};

		// Find existing Entry
		$scope.findOne = function() {
			$scope.entry = Entries.get({ 
				entryId: $stateParams.entryId
			});
		};

        $scope.init = function() {
            $scope.groups = Groups.query();
            $scope.items = [{
                id:1,
                name:"",
                text:""
            }];
            $scope.addItem = function() {
                var itm = $scope.items.length > 0 ? $scope.items[$scope.items.length-1] : 1;
                $scope.items.push({
                    id:itm.id+1,
                    name:"",
                    text:""
                })
            }

            $scope.removeItem = function(idx) {
                $scope.items.splice(idx, 1);
            }
        }
	}
]);