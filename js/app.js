/*global angular, $*/

var app;
app = angular.module('app', ['ngRoute']);

app.controller('FormController', function ($rootScope, $scope, $http, $window, $location) {
    'use strict';

    $scope.formData = {};
    
    $scope.prevLogs = {};
    $scope.$on('$viewContentLoaded', function() {
        $http.post('php/getLastTimelogs.php', {}
        ).then(function(response) {
             $scope.data = response.data;
            var timelogs = response.data["timelogs"];
            for (var i = 0; i < timelogs.length; i++) {
                if (timelogs[i]["signed_in"]) {
                    timelogs[i]["signed_in"] = "In";
                } else {
                    timelogs[i]["signed_in"] = "Out";
                }
            }
            $scope.prevLogs = timelogs;
        }, function(response) {
            $scope.error = response.data;
        });
    });
    
    $scope.submit = function () {
        $http({
            url: "php/addTimelog.php",
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            data: $.param($scope.formData)
        }).then(function(response) {
            $scope.data = response.data;
            $location.path("#");
        }, function(response) {
            $scope.error = response.data;
        });
    }
});

app.controller('TeamOutController', function ($rootScope, $scope, $http, $window, $location) {
    'use strict';
    
    $scope.formData = {};
    
    $scope.submit = function () {
        $http({
            url: "php/teamSignout.php",
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            data: $.param($scope.formData)
        }).then(function(response) {
            $scope.data = response.data;
            $location.path("#");
        }, function(response) {
            $scope.error = response.data;
        });
    }
});

app.controller('AddUserController', function ($rootScope, $scope, $http, $window, $location) {
    'use strict';
    
    $scope.formData = {};
    $scope.idTaken = "";
    $scope.passMatch = "";
    
    $scope.submit = function () {
        $http({
            url: "php/addUser.php",
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            data: $.param($scope.formData)
        }).then(function(response) {
            $scope.data = response.data;
        }, function(response) {
            $scope.error = response.data;
        });
        $location.path("#");
    }
    
    $scope.isNumTaken = function () {
        $http({
            url: "php/idTaken.php",
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            data: $.param({"user_id": $scope.formData.team_number + "-" + $scope.formData.user_number})
        }).then(function(response) {
            $scope.data = response.data;
            if (response.data.id_taken) {
                $scope.idTaken = "Number is already taken."
            } else {
                $scope.idTaken = ""
            }
        }, function(response) {
            $scope.error = response.data;
        });
    }
    
    $scope.doPassesMatch = function () {
        if ($scope.formData.user_password == $scope.formData.user_password_confirm) {
            $scope.passMatch = "";
        } else {
            $scope.passMatch = "Passwords don't match.";
        }
    }
});

app.controller('AddTeamController', function ($rootScope, $scope, $http, $window, $location) {
    'use strict';
    
    $scope.formData = {};
    
    $scope.submit = function () {
        $http({
            url: "php/addTeam.php",
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            data: $.param($scope.formData)
        }).then(function(response) {
            $scope.data = response.data;
        }, function(response) {
            $scope.error = response.data;
        });
        $location.path("#");
    }
});

app.controller('ViewLogsController', function ($rootScope, $scope, $http, $window, $location) {
    'use strict';
    
    $scope.formData = {};
    $scope.logsListed = [];
    
    $scope.submit = function () {
        $http({
            url: "php/getTimelogs.php",
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            data: $.param($scope.formData)
        }).then(function(response) {
            $scope.data = response.data;
            $scope.logsListed = response.data["timelogs"];
        }, function(response) {
            $scope.error = response.data;
        });
    }
});

app.controller('ViewUsersController', function ($rootScope, $scope, $http, $window, $location) {
    'use strict';
    
    $scope.formData = {};
    $scope.usersListed = [];
    
    $scope.submit = function () {
        if ($scope.formData.team_number) {
            $http({
                url: "php/getUsers.php",
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                data: $.param($scope.formData)
            }).then(function(response) {
                $scope.data = response.data;
                $scope.usersListed = response.data["users"];
            }, function(response) {
                $scope.error = response.data;
            });
        }
    }
});

app.config(['$routeProvider', function ($routeProvider, $locationProvider) {
    'use strict';

    $routeProvider.when('/', {
        templateUrl: 'html/form.html',
        controller: 'FormController'
    }).when('/team_out', {
        templateUrl: 'html/teamOut.html',
        controller: 'TeamOutController'
    }).when('/add_user', {
        templateUrl: 'html/addUser.html',
        controller: 'AddUserController'
    }).when('/add_team', {
        templateUrl: 'html/addTeam.html',
        controller: 'AddTeamController'
    }).when('/login', {
        templateUrl: 'html/login.html',
        controller: 'LoginController'
    }).when('/view_timelogs', {
        templateUrl: 'html/viewLogs.html',
        controller: 'ViewLogsController'
    }).when('/view_users', {
        templateUrl: 'html/viewUsers.html',
        controller: 'ViewUsersController'
    }).otherwise({
        redirectTo: '/'
    });
}]);
