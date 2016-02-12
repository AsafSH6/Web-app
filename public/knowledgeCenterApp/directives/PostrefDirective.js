(function () {
    'use strict';

    angular
        .module('KnowledgeCenter')
        .directive('postrefDirective', postrefDirective);

    /* @ngInject */
    postrefDirective.$inject = ['APIService'];

    function postrefDirective(APIService) {

        var updateCurrentPost = function(index) {
            APIService.updateCurrentPost(index);
        }

        var directive = {
            link: link,
            restrict: 'AEC',
            template: '<a class="title" ui-sref="post({postId: post._id})" ng-click="updateCurrentPost($index)">aaaa{{ post.title }}</a>'
        };
        return directive;

        function link($scope, element, attrs) {
            $scope.updateCurrentPost = updateCurrentPost
        }
    }
})();