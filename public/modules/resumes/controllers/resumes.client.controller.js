'use strict';

// Resumes controller
angular.module('resumes').controller('ResumesController', ['$scope', '$log', '$stateParams', '$location', 'Authentication', 'Resumes', 'Entries', 'Items',
	function($scope, $log, $stateParams, $location, Authentication, Resumes, Entries, Items) {
		$scope.authentication = Authentication;

        $scope.loadData = function() {
            $scope.items = Items.query();
            $log.log($scope.items);
        };

		// Create new Resume
		$scope.create = function() {
            var includeditems = [];
            angular.forEach($scope.items, function(item) {
                if(item.checked)
                    includeditems.push(item._id);
            });

			// Create new Resume object
			var resume = new Resumes ({
				name: this.name,
                items: includeditems
			});

			// Redirect after save
			resume.$save(function(response) {
				$location.path('resumes/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Resume
		$scope.remove = function(resume) {
			if ( resume ) { 
				resume.$remove();

				for (var i in $scope.resumes) {
					if ($scope.resumes [i] === resume) {
						$scope.resumes.splice(i, 1);
					}
				}
			} else {
				$scope.resume.$remove(function() {
					$location.path('resumes');
				});
			}
		};

		// Update existing Resume
		$scope.update = function() {
			var resume = $scope.resume;
            resume.items = [];
            var includeditems = [];

            angular.forEach($scope.items, function(item) {
                if(item.checked)
                    resume.items.push(item._id);
            });

			resume.$update(function() {
				$location.path('resumes/' + resume._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Resumes
		$scope.find = function() {
			$scope.resumes = Resumes.query();
		};

		// Find existing Resume
		$scope.findOne = function() {
            $scope.loadData();
			Resumes.get({
				resumeId: $stateParams.resumeId
			}).$promise.then(
                function(result){
                    $scope.resume = result;
                    initCheckboxes();
                }
            );

            var initCheckboxes = function() {
                for (var i = 0; i < $scope.items.length; i++) {
                    var index = $scope.resume.items.indexOf($scope.items[i]._id);
                    if (index > -1) {
                        $scope.items[i].checked = true;
                        $scope.resume.items[index] = $scope.items[i];
                    }
                }
            }
		};
	}
]);