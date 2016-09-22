(function() {
    'use strict';

    angular
        .module('rhgeek.olympic-medals', ['ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/rio2016',  {
                templateUrl  : 'views/rio2016.html',
                controller   : 'OlympicMedalsController',
                controllerAs : 'om'
            });
        }]);

})();