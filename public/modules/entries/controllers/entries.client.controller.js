'use strict';

// Entries controller
angular.module('entries').controller(
    'EntriesController',
    ['$scope', '$log', '$stateParams', '$location', 'Authentication', 'Entries', 'Groups', 'Items',
     function($scope, $log, $stateParams, $location, Authentication, Entries, Groups, Items) {
         $scope.authentication = Authentication;

         // Create new Entry
         $scope.create = function() {
             // Create new Entry object
             var entry = new Entries ({
                 name: this.name,
                 title: this.title,
                 startDate: Date(this.startDate),
                 endDate: Date(this.endDate),
                 timeSpent: this.timeSpent,
                 group: this.group._id
             });

             entry.$save(function(response) {
                 // Save the items
                 angular.forEach($scope.items, function(item) {
                     var itm = new Items({
                         name:item.name,
                         text:item.text,
                         entry:response._id
                     });
                     itm.$save(function(resp) {

                     }, function(error) {
                         $scope.error=error.data.message;
                     });
                 });

                 // Redirect after save
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

             // update each item
             angular.forEach($scope.items, function(item) {
                 if(item._id) {
                     item.$update();
                 }
                 else{
                     var itm = new Items({
                         name:item.name,
                         text:item.text,
                         entry:$scope.entry._id
                     });
                     itm.$save();
                 }
             });

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
             $scope.items = Items.query({
                 entry: $stateParams.entryId
             });
         };

         // initialize function for update view
         $scope.initUpdate = function() {
             $scope.init();
             $scope.findOne();
         };

         // initialize
         $scope.init = function() {
             $scope.groups = Groups.query();
             $scope.items = [{
                 id:1,
                 name:'',
                 text:''
             }];
             // bind enable adding of an item
             $scope.addItem = function() {
                 var itm = this.items.length > 0 ? this.items[this.items.length-1] : 1;
                 this.items.push({
                     id:itm.id+1,
                     name:'',
                     text:''
                 });
             };
             // enable removing of item
             $scope.removeItem = function(idx) {
                 var item = this.items.splice(idx, 1)[0];
                 if(item._id) {
                     item.$remove();
                 }
             };
         };
     }]);
