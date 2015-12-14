(function () {
    'use strict';

    angular
        .module('knowledgeCenter')
        .controller('links', links);

    links.$inject = ['knowledgeCenterServiceCtrl', "$scope"];

    /* @ngInject */
    function links(dataService, $scope) {
        /* jshint validthis: true */
        var vm = $scope;

        vm.activate = activate;
        vm.category = 'Links';

        activate();

        ////////////////

        function activate() {
            dataService.getAllPostsFilteredByCategory(vm.category, function(links) {
                vm.dbPosts = links.data
                console.log(vm.dbPosts)
            })
        }
    }
})();