/**
 * Created by Eran Reuveni on 13/02/2016.
 */
(function () {
    'use strict';

    angular
        .module('KnowledgeCenter')
        .controller('HomeCtrl', homeCtrl);

    homeCtrl.$inject = ['APIService', "$scope"];

    /* @ngInject */
    function homeCtrl(APIService, $scope) {
        /* jshint validthis: true */

        APIService.getHomePosts( function(posts) {
            $scope.newPosts = posts;
            console.log($scope.newPosts)
        })

    }
})();