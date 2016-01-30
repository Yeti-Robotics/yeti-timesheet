/*global angular, $, console*/

var app;
app = angular.module('app', ['ngRoute']);

app.service("loginService", function ($http, $q) {
    'use strict';
    
    this.login = function (userId, password) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/login.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: $.param({
                user_id: userId,
                user_password: password
            })
        };
        deferred = $q.defer();
        $http(config).success(function (data) {
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data);
        });
        return deferred.promise;
    };
});

app.controller("LoginController", function ($scope, $http, loginService) {
    "use strict";
    console.log(loginService);
    
    $scope.login = function () {
        loginService.login($scope.user, $scope.user_password).then(function (data) {
            console.log(data);
        }, function (data) {
            console.log(data);
        });
    };
});

app.config(['$routeProvider', function ($routeProvider, $locationProvider) {
    'use strict';

    $routeProvider.when('/', {
        templateUrl: 'html/login.html',
        controller: "LoginController"
    }).otherwise({
        redirectTo: '/'
    });
}]);
