'use strict';

angular.module('search').controller('SearchController', ['$scope', 'Authentication', 'Menus','$http',
    function($scope, Authentication, Menus, $http) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.query = "Describe your ideal candidate";
        $scope.menu = Menus.getMenu('topbar');
        $scope.hideResults = true;
        $scope.hideSearch = false;

        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function() {
            $scope.isCollapsed = false;
        });


        $scope.results=[{name:"John",resume:"dit is de link naar de resume"}];

        // On search submit
        $scope.runSearch = function(){

            alert(this.query);

            $http.get('/query/sdfdsfdsf').
                success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available

                    $scope.hideResults=false;
                    $scope.hideSearch=true;

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        };

        $scope.newSearch = function(){
            $scope.hideResults = true;
            $scope.hideSearch = false;
        };
    }
]);
