(function () {
    'use strict';

    angular
        .module('knowledgeCenter')
        .factory('dataService', knowledgeCenterServiceCtrl);

    knowledgeCenterServiceCtrl.$inject = ['$http'];

    /* @ngInject */
    function knowledgeCenterServiceCtrl($http) {
        var dbPosts = null
        var dbCategories = null
        var currentPost = null
        var service = {
            getAllCategories: getAllCategories,
            getAllPostsFilteredByCategory: getAllPostsFilteredByCategory,
            getPostById: getPostById,
            updateCurrentPost: updateCurrentPost,
            getCurrentPost: getCurrentPost,
            createNewPost: createNewPost,
            createNewComment: createNewComment,
            dbPosts: dbPosts,
            dbCategories: dbCategories,
        };

    return service;

    ////////////////

    function getAllCategories(callback) {
        $http.get('./api/v1/get-all-categories').then(function(categories) {
            dbCategories = categories.data
            callback(categories);
        });
    }
    function getAllPostsFilteredByCategory(category, callback) {
        $http.get('./api/v1/get-all-posts-filtered-by-category/' + category).then(function(posts) {
            dbPosts = posts.data
            callback(posts);
        });
    }
    function getPostById(postId, callback) {
        $http.get('./api/v1/get-post-by-id/' + postId).then(function(post) {
            console.log("get post by id: " + post.data)
            callback(post)
        })
    }
    function IncreaseViewByOne(postId) {
        $http.get('./api/v1/increase-view-by-one/' + postId)
    }
    function createNewPost(category, tags, title, text, callback) {
        $http.post('./api/v1/create-new-post/', {category: category, tags: tags, title: title, text: text}).then(function(res) {
            currentPost = res.data.post
            callback(currentPost)
        })
    }
    function createNewComment(postId, text, callback) {
        $http.post('./api/v1/create-new-comment', {postId: postId, text: text}).then(function(res) {
            callback(res.data.comment)
        })
    }

    function updateCurrentPost(index) {
        currentPost = dbPosts[index]
        IncreaseViewByOne(currentPost._id)
    }
    function getCurrentPost() {
        return currentPost
    }
}
})
();