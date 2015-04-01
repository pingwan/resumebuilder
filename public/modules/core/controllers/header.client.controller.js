'use strict';

angular.module('core').
    controller('HeaderController',
               ['$scope', 'Authentication', 'Menus','$http',
                function($scope, Authentication, Menus, $http) {
                    $scope.authentication = Authentication;
                    $scope.isCollapsed = false;
                    $scope.query = 'test';
                    $scope.menu = Menus.getMenu('topbar');

                    // On search submit
                    $scope.runSearch = function(){

                        $http.get('/query').
                            success(function(data, status, headers, config) {
                                // this callback will be called asynchronously
                                // when the response is available
                            }).
                            error(function(data, status, headers, config) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                            });

                    };
                }
]);
