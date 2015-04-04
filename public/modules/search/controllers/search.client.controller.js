'use strict';

angular.module('search').controller(
    'SearchController',
    ['$scope', 'Authentication', 'Menus','$http', '$log',
     function($scope, Authentication, Menus, $http, $log) {
         $scope.authentication = Authentication;
         $scope.isCollapsed = false;
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

         // On search submit
         $scope.runSearch = function(){

             //alert(this.query);

             $http.get('/search/'+this.query).
                 success(function(data, status, headers, config) {
                     // this callback will be called asynchronously
                     // when the response is available
                     console.log(data);
                     $scope.hideResults=false;
                     $scope.hideSearch=true;
                     $scope.results = data.res;
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
