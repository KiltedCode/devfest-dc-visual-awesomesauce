(function() {
    'use strict';

    angular
        .module('devfestdc', ['ngRoute', 'rhgeek.olympic-medals', 'rhgeek.sunburst'])
        .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
            $routeProvider.when('/',  {
                redirectTo      :   '/rio2016'
            });
            $routeProvider.otherwise({redirectTo: '/rio2016'});
        }]);


})();