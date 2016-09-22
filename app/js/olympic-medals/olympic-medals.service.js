(function() {
    'use strict';

    angular
        .module('rhgeek.olympic-medals')
        .factory('OlympicMedalsService', OlympicMedalsService);

    OlympicMedalsService.$inject = ['$http'];

    function OlympicMedalsService($http) {
        var service = {
            getDayOfMedals : getDayOfMedals
        };

        return service;


        //////////


        function getDayOfMedals(day) {
            return $http.get('/data/medals-'+day+'.json');
        }

    }

})();