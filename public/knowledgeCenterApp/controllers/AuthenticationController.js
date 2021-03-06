//Authenticating users with Passport.
(function () {
    'use strict';

    angular
        .module('KnowledgeCenter')
        .controller('AuthenticationCtrl', AuthenticationCtrl);

    AuthenticationCtrl.$inject = ['$rootScope', 'AuthenticationService'];

    /* @ngInject */
    function AuthenticationCtrl($rootScope, AuthenticationService)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'authenticationController.controller';

        activate();

        ////////////////

        function activate() {
            vm.signin = signin
            vm.signout = signout
            vm.signup = signup
            vm.chooseImage = chooseImage
            //vm.chosenImage = null
            vm.authenticationFailed = false;
            vm.signupFailed = false;
            angular.element(document).ready(loadImageChooseModal)
        }

        function signin() {
            AuthenticationService.signin(vm.username, vm.password, function (err, response) {
                if(err!= null) {
                    vm.authenticationFailed = true
                }
                else {
                    vm.authenticationFailed = false
                    AuthenticationService.SetCredentials(response.id, vm.username, vm.password);
                    clearDetails()
                }
            });
        }

        function signout() {
            AuthenticationService.signout(function(err, response) {
                if(err!= null) {
                    return
                }
                else {
                    AuthenticationService.ClearCredentials()
                }
            })
        }

        function signup() {
            if(vm.chosenImage == null) {
                $('#myBtn').click()
                return
            }
            AuthenticationService.signup(vm.username, vm.password, vm.firstName, vm.lastName, vm.email, vm.street, vm.city, vm.chosenImage._id, function(err, response) {
                if(err!= null) {
                    vm.signupFailed = true
                }
                else {
                    vm.signupFailed = false
                    AuthenticationService.SetCredentials(response.id, vm.username, vm.password);
                    clearDetails()
                }
            })
        }

        function loadImageChooseModal() {
            $("#myBtn").click(function(){
                $("#myModal").modal();
            });
        }

        function clearDetails() {
            vm.username = null
            vm.password = null
            vm.firstName = null
            vm.lastName = null
            vm.email = null
        }

        function chooseImage(image) {
            vm.chosenImage = image
            angular.element('#close-modal').click()
            signup()
        }
    }
})();