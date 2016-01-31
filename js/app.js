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

app.service("timesheetService", function ($http, $q) {
    'use strict';
    
    this.addLog = function (userId, sessionKey) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/addTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            data: $.param({
                user_id: userId
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

app.controller("LoginController", function ($scope, $http, $window, loginService) {
    "use strict";
    console.log(loginService);
    
    $scope.loggedIn = false;
    
    $scope.login = function () {
        loginService.login($scope.user, $scope.user_password).then(function (data) {
            console.log(data);
            $window.sessionStorage.setItem("SESSION_KEY", data.session_key);
            $scope.loggedIn = true;
        }, function (data) {
            console.log(data);
        });
    };
});

app.controller("TimesheetController", function ($scope, $http, $window, timesheetService) {
    "use strict";
    
    $scope.lastLogged = "";
    
    $scope.submit = function () {
        timesheetService.addLog($scope.user_id, $window.sessionStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            $scope.lastLogged = $scope.user_id;
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
});

app.config(['$routeProvider', function ($routeProvider, $locationProvider) {
    'use strict';

    $routeProvider.when('/', {
        templateUrl: 'html/login.html',
        controller: "LoginController"
    }).when('/timesheet', {
        templateUrl: 'html/timesheet.html',
        controller: "TimesheetController"
    }).otherwise({
        redirectTo: '/'
    });
}]);
