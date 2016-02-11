/*global angular, $, console*/

function displayMessage(message, alertType) {
    "use strict";
    $('.message-container').html(message).removeClass('alert-success alert-info alert-warning alert-danger').addClass('alert-' + alertType).stop(true).slideDown(500).delay(3000).slideUp(500);
}

var app;
app = angular.module('app', ['ngRoute']);

app.run(function ($http, $rootScope, $location, loginService) {
    "use strict";
    
    if (localStorage.getItem("SESSION_KEY")) {
        loginService.validateSession(localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            if (!data.user_id) {
                localStorage.removeItem("SESSION_KEY");
                $location.path("/");
            } else {
                $rootScope.user_logged_in = true;
                $rootScope.user_admin = data.user_admin;
            }
        }, function (data) {
            console.log(data);
            localStorage.removeItem("SESSION_KEY");
            $location.path("/");
        });
    }
});

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
    
    this.validateSession = function (sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/validateSession.php",
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
    
    this.getTimelog = function (timelogId, sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            params: {
                timelog_id: timelogId
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
    
    this.getLogs = function (filters, sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTimelogs.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            params: filters
        };
        deferred = $q.defer();
        $http(config).success(function (data) {
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data);
        });
        return deferred.promise;
    };
    
    this.getLoggedInUsers = function (sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getLoggedInUsers.php",
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
    
    this.updateTimelog = function (timelogId, userId, timelogType, timestamp, sessionKey) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/updateTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            data: $.param({
                timelog_id: timelogId,
                user_id: userId,
                timelog_type: timelogType,
                timelog_timestamp: timestamp
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

app.service("teamService", function ($http, $q) {
    'use strict';
    
    this.addTeam = function (teamName, teamNumber, sessionKey) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/addTeam.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            data: $.param({
                team_name: teamName,
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
    
    this.getTeams = function (sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTeams.php",
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

app.service("userService", function ($http, $q) {
    'use strict';
    
    this.addUser = function (userData, sessionKey) {
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/addUser.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            data: $.param(userData)
        };
        deferred = $q.defer();
        $http(config).success(function (data) {
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data);
        });
        return deferred.promise;
    };
    
    this.getUsers = function (teamNumber, sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getUsers.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            params: {
                team_number: teamNumber
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
    
    this.getUser = function (userId, sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getUser.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            params: {
                user_id: userId
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
    
    this.getCurrentUser = function (sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getCurrentUser.php",
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
    
    this.idTaken = function (userId, sessionKey) {
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/idTaken.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "SESSION_KEY": sessionKey
            },
            params: {
                user_id: userId
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

app.controller("LoginController", function ($scope, $http, $location, $rootScope, loginService) {
    "use strict";
    
    $scope.login = function () {
        if (!localStorage.getItem("SESSION_KEY")) {
            loginService.login($scope.user, $scope.user_password).then(function (data) {
                console.log(data);
                localStorage.setItem("SESSION_KEY", data.session_key);
                $rootScope.user_admin = Boolean(data.user_admin);
                $rootScope.user_logged_in = true;
                $location.path("/home");
                displayMessage('Login successful.', 'success');
            }, function (data) {
                console.log(data);
                displayMessage('Login failed.', 'danger');
            });
        }
    };
    
    if (localStorage.SESSION_KEY !== undefined) {
        $location.path("/home");
    }
});

app.controller("LogoutController", function ($scope, $http, $location, $rootScope, logoutService) {
    "use strict";
    
    if (localStorage.getItem("SESSION_KEY")) {
        logoutService.logout(localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            localStorage.SESSION_KEY = undefined;
            localStorage.removeItem("SESSION_KEY");
            $rootScope.user_admin = false;
            $rootScope.user_logged_in = false;
            $location.path("/");
        }, function (data) {
            console.log(data);
            $location.path("/");
        });
    } else {
        $location.path("/");
    }
});

app.controller("TimesheetController", function ($scope, $http, timesheetService) {
    "use strict";
    
    $scope.lastLogged = "";
    
    $scope.submit = function () {
        timesheetService.addLog($scope.user_id, localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            $scope.lastLogged = $scope.user_id;
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
});

app.controller("AdminController", function ($scope, $http, timesheetService) {
    "use strict";
    
    $scope.getLogs = function () {
        timesheetService.getLogs({"time_limit": "day"}, localStorage.getItem("SESSION_KEY")).then(function (data) {
            $scope.logsListed = data.timelogs;
        }, function (data) {
            console.log(data);
        });
    };
    
    $scope.getLoggedInUsers = function () {
        var loggedInUsers, i, team, user, index;
        timesheetService.getLoggedInUsers(localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            
            index = -1;
            loggedInUsers = [];
            for (i = 0; i < data.users.length; i += 1) {
                user = data.users[i];
                if (team !== user.team_number) {
                    index += 1;
                    loggedInUsers.push([user]);
                } else {
                    loggedInUsers[index].push(user);
                }
                team = user.team_number;
            }
            $scope.loggedInUsers = loggedInUsers;
        }, function (data) {
            console.log(data);
        });
    };
    
    $scope.submit = function () {
        timesheetService.addLog($scope.user_id, localStorage.getItem("SESSION_KEY")).then(function (data) {
            displayMessage('Timelog successful.', 'success');
            $scope.user_id = "";
            $scope.getLogs();
            $scope.getLoggedInUsers();
        }, function (data) {
            displayMessage('Timelog failed.', 'danger');
            $scope.user_id = "";
        });
    };
    
    $scope.getTime = function (unixTime) {
        unixTime *= 1000;
        return new Date(unixTime).toLocaleTimeString();
    };
    
    $scope.logoutUser = function (userId) {
        $scope.user_id = userId;
        $scope.submit();
    };
    
    $scope.getLogs();
    $scope.getLoggedInUsers();
});

app.controller("TeamOutController", function ($scope, $http, $location, timesheetService) {
    "use strict";
    
    $scope.lastLogged = "";
    
    $scope.submit = function () {
        timesheetService.teamLog($scope.team_number, localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            $scope.lastLogged = $scope.team_number;
            $location.path("/");
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
});

app.controller("ViewLogsController", function ($scope, $http, timesheetService) {
    "use strict";
    
    $scope.filters = {};
    $scope.logsListed = [];
    
    $scope.submit = function () {
        timesheetService.getLogs($scope.filters, localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            $scope.logsListed = data.timelogs;
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
    
    $scope.getTime = function (unixTime) {
        unixTime *= 1000;
        return new Date(unixTime).toLocaleTimeString();
    };
});

app.controller("AddTeamController", function ($scope, $rootScope, $location, teamService) {
    "use strict";
    
    $scope.submit = function () {
        teamService.addTeam($scope.team_name, $scope.team_number, localStorage.getItem("SESSION_KEY")).then(function (data) {
            displayMessage("Team added successfully.", "success");
            $location.path("/");
        }, function (data) {
            console.log(data);
        });
    };
});

app.controller("ViewTeamsController", function ($scope, $rootScope, $location, userService, teamService) {
    "use strict";
    
    $scope.teamsListed = [];
    $scope.usersListed = [];
    $scope.usersByTeam = {};

    teamService.getTeams(localStorage.getItem("SESSION_KEY")).then(function (data) {
        $scope.teamsListed = data.teams;
    }, function (data) {
        console.log(data);
    });
    
    $scope.members = function (teamNumber) {
        if ($scope.usersByTeam[teamNumber]) {
            $scope.usersListed = $scope.usersByTeam[teamNumber];
        } else {
            userService.getUsers(teamNumber, localStorage.getItem("SESSION_KEY")).then(function (data) {
                $scope.usersListed = data.users;
                $scope.usersByTeam[teamNumber] = $scope.usersListed;
                $scope.teamNumber = teamNumber;
            }, function (data) {
                console.log(data);
            });
        }
    };
});

app.controller("ProfileController", function ($scope, $rootScope, $location, userService) {
    "use strict";
    
    $scope.loadUser = function () {
        userService.getCurrentUser(localStorage.SESSION_KEY).then(function (data) {
            $scope.userData = data.user;
        }, function (data) {
            console.log(data);
        });
    };
    
    $scope.loadUserById = function (userId) {
        userService.getUser(userId, localStorage.SESSION_KEY).then(function (data) {
            $scope.userData = data.user;
        }, function (data) {
            console.log(data);
        });
    };
    
    var userId = $location.search().id;
    if (userId) {
        console.log($location.search());
        $scope.loadUserById(userId);
    } else {
        $scope.loadUser();
    }
});

app.controller("AddUserController", function ($scope, $rootScope, $location, userService) {
    "use strict";
    
    $scope.formData = {};
    $scope.passMatch = true;
    $scope.idsTaken = [];
    
    $scope.submit = function () {
        userService.addUser($scope.formData, localStorage.getItem("SESSION_KEY")).then(function (data) {
            console.log(data);
            displayMessage("User added successfully.", "success");
            $location.path("/");
        }, function (data) {
            console.log(data);
        });
    };
    
    $scope.doPassesMatch = function () {
        $scope.passMatch = ($scope.formData.user_password === $scope.formData.user_password_confirm);
    };
    
    $scope.isNumTaken = function () {
        $scope.idTaken = $scope.idsTaken.includes($scope.formData.team_number + "-" + $scope.formData.user_number);
    };
    
    userService.getUsers(null, localStorage.SESSION_KEY).then(function (data) {
        var i;
        for (i = 0; i < data.users.length; i += 1) {
            $scope.idsTaken.push(data.users[i].user_id);
        }
    }, function (data) {
        console.log(data);
    });
});

app.controller("EditLogController", function ($scope, $rootScope, $location, timesheetService) {
    "use strict";
    
    var timelogId;
    
    $scope.submit = function () {
        timesheetService.updateTimelog(timelogId, $scope.user_id, $scope.timelog_type,
                                       $scope.timelog_timestamp, localStorage.SESSION_KEY).then(function (data) {
            displayMessage("Timelog updated sucessfully", "success");
            $location.path("/view_timelogs");
        }, function (data) {
            console.log(data);
        });
    };
    
    timelogId = $location.search().id;
    if (timelogId) {
        timesheetService.getTimelog(timelogId, localStorage.SESSION_KEY).then(function (data) {
            $scope.user_id = data.timelog.user_id;
            $scope.timelog_timestamp = data.timelog.timelog_timestamp;
            $scope.timelog_type = data.timelog.timelog_type;
        }, function (data) {
            console.log(data);
        });
    }
});

app.config(['$routeProvider', function ($routeProvider, $locationProvider) {
    'use strict';

    $routeProvider.when('/', {
        templateUrl: 'html/login.html',
        controller: "LoginController"
    }).when('/home', {
        templateUrl: 'html/home.html'
    }).when('/logout', {
        templateUrl: 'html/login.html',
        controller: "LogoutController"
    }).when('/team_timesheet', {
        templateUrl: 'html/teamOut.html',
        controller: "TeamOutController"
    }).when('/view_timelogs', {
        templateUrl: 'html/viewLogs.html',
        controller: "ViewLogsController"
    }).when('/view_teams', {
        templateUrl: 'html/viewTeams.html',
        controller: "ViewTeamsController"
    }).when('/add_team', {
        templateUrl: 'html/addTeam.html',
        controller: "AddTeamController"
    }).when('/add_user', {
        templateUrl: 'html/addUser.html'
    }).when('/profile', {
        templateUrl: 'html/profile.html'
    }).when('/edit_log', {
        templateUrl: 'html/editLog.html'
    }).otherwise({
        redirectTo: '/'
    });
}]);
