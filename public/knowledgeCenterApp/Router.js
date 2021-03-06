(function () {

    //Router for the app, users ui-router
    'use strict';
    angular
        .module('KnowledgeCenter')
        .run(run)
        .config(config);

    run.$inject = ['$rootScope', '$state', '$stateParams'];
    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function run($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider
            .otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: './templates/home.html',
                controller: 'HomeCtrl'

            })
            .state('posts', {
                url: '/:category',
                params: {
                    posts: {
                        array: true,
                    }
                },
                templateUrl: './templates/posts.html',
                controller: 'PostsCtrl'
            })
            .state('post', {
                url: '/post/:postId',
                templateUrl: './templates/post.html',
                controller: 'PostCtrl'
            })
            .state('create-new-post', {
                url: '/create-new-post/:category?originalPostId',
                params: {
                    originalPostId: {
                        value: null,
                    }
                },
                templateUrl: './templates/createPost.html',
                controller: 'NewPostCtrl'
            })
            .state('error',{
                url:'/error/',
                templateUrl:'/templates/404.html'

            })

    }

})();