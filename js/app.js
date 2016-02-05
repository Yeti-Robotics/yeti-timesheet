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

app.service("logoutService", function ($http, $q) {
    'use strict';
    
    this.logout = function (sessionKey) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/logout.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            }
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
    
    this.teamLog = function (teamNumber, sessionKey) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/teamSignout.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            data: $.param({
                team_number: teamNumber
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
    
    this.getLogs = function (filters, sessionKey) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/getTimelogs.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            data: $.param(filters)
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

app.controller("LoginController", function ($scope, $http, $location, loginService) {
    "use strict";
    
    $scope.wasLoggedIn = false;
    
    $scope.login = function () {
        if (!localStorage.getItem("SESSION_KEY")) {
            loginService.login($scope.user, $scope.user_password).then(function (data) {
                console.log(data);
                localStorage.setItem("SESSION_KEY", data.session_key);
                $scope.wasLoggedIn = true;
                $location.path("/home");
            }, function (data) {
                console.log(data);
            });
        }
    };
    
    if (localStorage.SESSION_KEY !== undefined) {
        $location.path("/home");
    }
});

app.controller("LogoutController", function ($scope, $http, $location, logoutService) {
    "use strict";
    
    if (localStorage.getItem("SESSION_KEY")) {
        logoutService.logout(localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            localStorage.removeItem("SESSION_KEY");
        }, function (data) {
            console.log(data);
        });
    }
    $location.path("/");
});

app.controller("TimesheetController", function ($scope, $http, $window, timesheetService) {
    "use strict";
    
    $scope.lastLogged = "";
    
    $scope.submit = function () {
        timesheetService.addLog($scope.user_id, $window.localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            $scope.lastLogged = $scope.user_id;
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
});

app.controller("TeamOutController", function ($scope, $http, $window, timesheetService) {
    "use strict";
    
    $scope.lastLogged = "";
    
    $scope.submit = function () {
        timesheetService.teamLog($scope.team_number, $window.localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            $scope.lastLogged = $scope.team_number;
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
});

app.controller("ViewLogsController", function ($scope, $http, $window, timesheetService) {
    "use strict";
    
    $scope.filters = {};
    $scope.logsListed = [];
    
    $scope.submit = function () {
        timesheetService.getLogs($scope.filters, $window.localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            $scope.logsListed = data.timelogs;
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
});

app.controller("HomeController", function ($scope) {
    "use strict";
});

app.config(['$routeProvider', function ($routeProvider, $locationProvider) {
    'use strict';

    $routeProvider.when('/', {
        templateUrl: 'html/login.html',
        controller: "LoginController"
    }).when('/home', {
        templateUrl: 'html/home.html',
        controller: "HomeController"
    }).when('/logout', {
        templateUrl: 'html/login.html',
        controller: "LogoutController"
    }).when('/timesheet', {
        templateUrl: 'html/timesheet.html',
        controller: "TimesheetController"
    }).when('/team_timesheet', {
        templateUrl: 'html/teamOut.html',
        controller: "TeamOutController"
    }).when('/view_timelogs', {
        templateUrl: 'html/viewLogs.html',
        controller: "ViewLogsController"
    }).otherwise({
        redirectTo: '/'
    });
}]);
