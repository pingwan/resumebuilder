'use strict';

angular.module('core').controller('LayoutController', ['$scope', '$timeout', '$mdSidenav', '$log', '$mdMedia', 'Authentication', 'Menus',
    function($scope, $timeout, $mdSidenav, $log, $mdMedia, Authentication, Menus) {
        $scope.toggleLeft = function () {
            $mdSidenav('left').toggle()
                .then(function () {
                    $log.log("toggle left is done");
                });
        };
        $scope.showSidenav = $mdMedia('gt-md');
        $scope.authentication = Authentication;
        $scope.menu = Menus.getMenu('topbar');
    }
])
.controller('LeftCtrl', ['$scope', '$mdSidenav', '$log', function($scope, $mdSidenav, $log) {

    $scope.close = function() {
        $mdSidenav('left').close();
    };
}])