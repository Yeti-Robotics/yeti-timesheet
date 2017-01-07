/*global angular, $, console, moment*/

var app;
app = angular.module('app', ['ngRoute']);
var DATE_FORMAT = 'YYYY-MM-DD', TIME_FORMAT = "h:mm A", DATETIME_FORMAT = "YYYY-MM-DD hh:mm A";

function displayMessage(message, alertType) {
    "use strict";
    $('.message-container').html(message).removeClass('alert-success alert-info alert-warning alert-danger').addClass('alert-' + alertType).stop(true).slideDown(500).delay(3000).slideUp(500);
}

app.run(function ($http, $rootScope, $location, loginService) {
    "use strict";

    // Check whether the user is logged in.
    if (localStorage.getItem("SESSION_KEY")) {
        loginService.validateSession(localStorage.SESSION_KEY).then(function (data) {
            if (!data.user_id) {
                // If not logged in, remove session key and redirect to default page.
                localStorage.removeItem("SESSION_KEY");
                $location.path("/");
            } else {
                // If logged in, remember who is logged in.
                $rootScope.user_logged_in = true;
                $rootScope.user_admin = data.user_admin;
                $rootScope.mentor_team = parseInt(data.mentor_team, 0);
            }
        }, function (data) {
            // If an error occurs, log the results and assume the user isn't logged in.
            console.log(data);
            localStorage.removeItem("SESSION_KEY");
            $location.path("/");
        });
    }
});

app.service("loginService", function ($http, $q) {
    'use strict';

    this.login = function (userId, password) {
        // Log the user in and retrieve a session key.
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
        // See if the user is logged in.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/validateSession.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Delete the user's session and remove their session key.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/logout.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Enter a timelog at the current time for a specified user ID.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/addTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Set all unfinished timelogs from a team to have time out at the current time.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/teamSignout.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Retrieve information about a timelog.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Search the database for timelogs.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTimelogs.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // See all the users with unfinished timelogs.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getLoggedInUsers.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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

    this.updateTimelog = function (timelogId, timein, timeout, sessionKey) {
        // Change a timelog's times.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/updateTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
            },
            data: $.param({
                timelog_id: timelogId,
                timelog_timein: timein,
                timelog_timeout: timeout
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

    this.deleteTimelog = function (timelogId, sessionKey) {
        // Remvoe a timelog from the database.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/deleteTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
            },
            data: $.param({
                timelog_id: timelogId
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
    
    this.writeTimelog = function (userId, timein, timeout, sessionKey) {
        // Add a new timelog with specific time values.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/writeTimelog.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
            },
            data: $.param({
                user_id: userId,
                timelog_timein: timein,
                timelog_timeout: timeout
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
        // Add a team to the database.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/addTeam.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Retrieve information about all the teams.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTeams.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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

    this.getTeam = function (teamNumber, sessionKey) {
        // Retrieve information about a team.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTeam.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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

    this.getTeamTimes = function (teamNumber, startSeconds, endSeconds, sessionKey) {
        // Get the total hours for all members of a team.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTeamTimes.php",
            headers: {
                "Session-Key": sessionKey
            },
            params: {
                team_number: teamNumber,
                time_start: startSeconds,
                time_end: endSeconds
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
    
    this.getTeamsAndUsers = function (sessionKey) {
        // Get all the users organized by team.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getTeamsAndUsers.php",
            headers: {
                "Session-Key": sessionKey
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
    
    this.getHoursByTeam = function (startDate, endDate, sessionKey) {
        // Get total hours per day per team.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getHoursByTeam.php",
            headers: {
                "Session-Key": sessionKey
            },
            params: {
                time_start: startDate,
                time_end: endDate
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
        // Add a user to the database.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/addUser.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
	
	this.addGuest = function (guestData, sessionKey) {
        // Add a guest to the database.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/addGuest.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
            },
            data: $.param(guestData)
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
        // Retrieve information about all members of a team.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getUsers.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Retrieve information about a user.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getUser.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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
        // Retrieve information about the current user.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getCurrentUser.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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

    this.getUserTime = function (userId, timeStart, timeEnd, sessionKey) {
        // Retrieve a user's total hours.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getUserTime.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
            },
            params: {
                user_id: userId,
                time_start: timeStart,
                time_end: timeEnd
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
        // See if there is already a user with a particular user ID.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/idTaken.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
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

    this.getHours = function (userId, sessionKey) {
        // Retrieve hours by day for a user.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getHours.php",
            headers: {
                "Session-Key": sessionKey
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

    this.getHoursInRange = function (userId, startSeconds, endSeconds, sessionKey) {
        // Retrive hours by day for a user in a given period.
        var config, deferred;
        config = {
            method: "GET",
            url: location.pathname + "php/getHoursInRange.php",
            headers: {
                "Session-Key": sessionKey
            },
            params: {
                user_id: userId,
                time_start: startSeconds,
                time_end: endSeconds
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
    
    this.changePassword = function (passData, sessionKey) {
        // Change the current user's password.
        var config, deferred;
        config = {
            method: "POST",
            url: location.pathname + "php/changePassword.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Session-Key": sessionKey
            },
            data: $.param(passData)
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

    // Try to log in a user
    $scope.login = function () {
        // If the user doesn't already have a session key, try to log in.
        if (!localStorage.getItem("SESSION_KEY")) {
            loginService.login($scope.user, $scope.user_password).then(function (data) {
                // If the user logs in successfully, remember who's logged in.
                localStorage.setItem("SESSION_KEY", data.session_key);
                $rootScope.user_admin = Boolean(data.user_admin);
                $rootScope.user_logged_in = true;
                $rootScope.mentor_team = parseInt(data.mentor_team, 0);
                displayMessage('Login successful.', 'success');
                $location.path("/home");
            }, function (data) {
                // If the user couldn't log in, log the result.
                console.log(data);
                displayMessage('Login failed.', 'danger');
            });
        }
    };

    // If the user is already logged in, redirect to the home page.
    if (localStorage.SESSION_KEY !== undefined) {
        $location.path("/home");
    }
});

app.controller("LogoutController", function ($scope, $http, $location, $rootScope, logoutService) {
    "use strict";

    // Log the user out.
    if (localStorage.getItem("SESSION_KEY")) {
        logoutService.logout(localStorage.SESSION_KEY).then(function (data) {
            // Erase data and redirect to login.
            localStorage.SESSION_KEY = undefined;
            localStorage.removeItem("SESSION_KEY");
            $rootScope.user_admin = false;
            $rootScope.user_logged_in = false;
            $rootScope.mentor_team = false;
            displayMessage('Logged out.', 'success');
            $location.path("/");
        }, function (data) {
            // Log errors and redirect to login.
            console.log(data);
            $location.path("/");
        });
    } else {
        // Redirect to login.
        $location.path("/");
    }
});

app.controller("AdminController", function ($scope, $http, $location, timesheetService) {
    "use strict";
	
    // See all timelogs from the past day.
    $scope.getLogs = function () {
        timesheetService.getLogs({
            "time_limit": "day"
        }, localStorage.SESSION_KEY).then(function (data) {
            $scope.logsListed = data.timelogs;
			for (var i = 0; i < data.timelogs.length; i++) {
				if (data.timelogs[i].team_number == 0) {
//					data.timelogs[i].user_id = data.timelogs[i].user_id.slice(2);
					data.timelogs[i].user_name += " (Guest)";
				}
			}
        }, function (data) {
            console.log(data);
        });
    };

    // See which users are logged in.
    $scope.getLoggedInUsers = function () {
        var loggedInUsers, loggedInGuests, i, team, user, index;
        timesheetService.getLoggedInUsers(localStorage.SESSION_KEY).then(function (data) {
            index = -1;
            loggedInUsers = [];
            loggedInGuests = [];
            for (i = 0; i < data.users.length; i += 1) {
                user = data.users[i];
				if (user.team_number == 0) {
					user.user_id = user.user_id.slice(2);
					loggedInGuests.push(user);
					continue;
				}
                if (team !== user.team_number) {
                    index += 1;
                    loggedInUsers.push([user]);
                } else {
                    loggedInUsers[index].push(user);
                }
                team = user.team_number;
            }
            $scope.loggedInUsers = loggedInUsers;
			$scope.loggedInGuests = loggedInGuests;
        }, function (data) {
            console.log(data);
        });
    };

    // Log a user in or out.
    $scope.submit = function () {
        timesheetService.addLog($scope.user_id.includes("-") ? $scope.user_id : "0-" + $scope.user_id, localStorage.SESSION_KEY).then(function (data) {
            displayMessage('Timelog successful.', 'success');
            $scope.user_id = "";
            $scope.getLogs();
            $scope.getLoggedInUsers();
        }, function (data) {
            displayMessage('Timelog failed.', 'danger');
            $scope.user_id = "";
        });
    };

    // Retrieve a time string based on unix time in seconds.
    $scope.getTime = function (unixTime) {
        if (typeof (unixTime) !== "number") {
            return "";
        }
        unixTime *= 1000;
        return moment(unixTime).format(TIME_FORMAT);
    };

    // Log a user out.
    $scope.logoutUser = function (userId) {
        $scope.user_id = userId;
        $scope.submit();
    };

    // Go to the page to log out an entire team.
    $scope.logoutTeam = function (teamNumber) {
        $location.path("/team_timesheet/" + teamNumber);
    };
    
    // Load the modal for editing a timelog.
    $scope.getLogData = function (timelogId) {
        timesheetService.getTimelog(timelogId, localStorage.SESSION_KEY).then(function (data) {
            $scope.timelog_id = timelogId;
            $scope.timelog_timein = moment(data.timelog.timelog_timein * 1000).format(DATETIME_FORMAT);
            if (data.timelog.timelog_timeout) {
                $scope.timelog_timeout = moment(data.timelog.timelog_timeout * 1000).format(DATETIME_FORMAT);
            } else {
                $scope.timelog_timeout = "";
            }
            $("#editModal").modal();
            $('#edit-log-timein').val($scope.timelog_timein);
            $('#edit-log-timeout').val($scope.timelog_timeout);
        }, function (data) {
            console.log(data);
        });
    };

    $scope.getLogs();
    $scope.getLoggedInUsers();
});

app.controller("TeamOutController", function ($scope, $http, $location, $routeParams, timesheetService) {
    "use strict";

    // Log out all members of a team.
    $scope.submit = function () {
        timesheetService.teamLog($scope.team_number, localStorage.SESSION_KEY).then(function (data) {
            $scope.lastLogged = $scope.team_number;
            displayMessage("Team logged out.", "success");
            $location.path("/");
        }, function (data) {
            console.log(data);
        });
    };

    // If a team number is specified in the URL, enter that number by default.
    if ($routeParams.teamNumber) {
        $scope.team_number = $routeParams.teamNumber;
    }
});

app.controller("ViewLogsController", function ($scope, $http, $location, timesheetService) {
    "use strict";

    var searchData, i, filterNames;
    $scope.filters = {};
    $scope.logsListed = [];
    $scope.pageSize = 50;
    $scope.prevPageExists = false;
    $scope.nextPageExists = false;
    filterNames = ["user_name", "user_id", "team_name", "team_number", "time_start", "time_end"];
    $scope.time_start = moment().format(DATE_FORMAT);
    $scope.time_end = moment().format(DATE_FORMAT);

    // Submit search criteria.
    $scope.submit = function () {
        var i;
        $location.$$search = {};
        for (i = 0; i < filterNames.length; i += 1) {
            if ($scope[filterNames[i]]) {
                $location.search(filterNames[i], $scope[filterNames[i]]);
            }
        }
    };

    // Get time string based on unix time in seconds.
    $scope.getTime = function (unixTime) {
        if (typeof (unixTime) !== "number") {
            return "";
        }
        unixTime *= 1000;
        return moment(unixTime).format(TIME_FORMAT);
    };

    // Get date string based on unix time in seconds.
    $scope.getDate = function (unixTime) {
        unixTime *= 1000;
        return moment(unixTime).format(DATE_FORMAT);
    };
    
    // Calculate the difference between seconds and return hours.
    $scope.getHourDifference = function (timeStart, timeEnd) {
        var difference = Math.round((timeEnd - timeStart) / 360) / 10;
        if (difference < 0) {
            difference = 0;
        }
        return difference;
    };

    // Go to a specific page of results.
    $scope.goToPage = function (pageNumber) {
        $location.search("page", pageNumber);
    };

    // Go to another page of results based on the current page.
    $scope.movePage = function (displacement) {
        $scope.goToPage(parseInt($location.search().page, 0) + displacement);
    };
    
    // Show the modal for editing timelogs.
    $scope.getLogData = function (timelogId) {
        timesheetService.getTimelog(timelogId, localStorage.SESSION_KEY).then(function (data) {
            $scope.timelog_id = timelogId;
            $scope.timelog_timein = moment(data.timelog.timelog_timein * 1000).format(DATETIME_FORMAT);
            if (data.timelog.timelog_timeout) {
                $scope.timelog_timeout = moment(data.timelog.timelog_timeout * 1000).format(DATETIME_FORMAT);
            } else {
                $scope.timelog_timeout = "";
            }
            $("#editModal").modal();
            $('#edit-log-timein').val($scope.timelog_timein);
            $('#edit-log-timeout').val($scope.timelog_timeout);
        }, function (data) {
            console.log(data);
        });
    };
    
    // Find timelgos based on search criteria.
    $scope.getLogs = function () {
        searchData = $location.search();
        for (i = 0; i < filterNames.length; i += 1) {
            if (searchData[filterNames[i]]) {
                if (i !== 3) {
                    $scope[filterNames[i]] = searchData[filterNames[i]];
                } else {
                    $scope[filterNames[i]] = parseInt(searchData[filterNames[i]], 0);
                }
                $scope.filters[filterNames[i]] = searchData[filterNames[i]];
            }
        }
        if (searchData.page) {
            $scope.filters.num_low = (searchData.page - 1) * $scope.pageSize;
            $scope.filters.num_limit = $scope.pageSize;
            if (searchData.page > 1) {
                $scope.prevPageExists = true;
            }
        }
        timesheetService.getLogs($scope.filters, localStorage.SESSION_KEY).then(function (data) {
            var log, i;
            $scope.logsListed = data.timelogs;
            if ($scope.logsListed.length === $scope.pageSize && searchData.page) {
                $scope.nextPageExists = true;
            }
            for (i = 0; i < $scope.logsListed.length; i += 1) {
                log = $scope.logsListed[i];
                log.hours = $scope.getHourDifference(log.timelog_timein, log.timelog_timeout);
            }
        }, function (data) {
            console.log(data);
            $scope.lastLogged = "";
        });
    };
    
    // Update scope variables based on datepickers.
    $scope.updateDateFields = function () {
        $scope.time_start = $("#search-time-start").val();
        $scope.time_end = $("#search-time-end").val();
    };
    
    $("#search-time-start, #search-time-end").datetimepicker({
        format: "YYYY-MM-DD"
    });
    $("#search-time-start, #search-time-end").on("dp.change", $scope.updateDateFields);

    $scope.getLogs();
});

app.controller("AddTeamController", function ($scope, $rootScope, $location, teamService) {
    "use strict";

    // Add a team to the database.
    $scope.submit = function () {
        teamService.addTeam($scope.team_name, $scope.team_number, localStorage.SESSION_KEY).then(function (data) {
            displayMessage("Team added successfully.", "success");
            $location.path("/");
        }, function (data) {
            console.log(data);
        });
    };
});

app.controller("ViewTeamsController", function ($scope, $rootScope, $location, userService, teamService) {
    "use strict";
    
    var startDate, endDate;
    
    $scope.teamsListed = [];
    $scope.usersListed = [];
    $scope.usersByTeam = {};
    $scope.startDate = moment().subtract(7, 'days').format(DATE_FORMAT);
    $scope.endDate = moment().format(DATE_FORMAT);
    
    // Hour chart
    function hourChart(data) {
        $('#team-hour-chart-container').highcharts({
            title: {
                text: 'Team Hours'
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Hours'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ' hours',
                xDateFormat: '%a, %b %e, %Y'
            },
            series: data
        });
    }
    
    // Get hours data for each team.
    $scope.getHoursByTeam = function () {
        teamService.getHoursByTeam($scope.startDate, $scope.endDate, localStorage.SESSION_KEY).then(function (data) {
            var teams, i, j, currentTeam, item, series;
            teams = [];
            series = [];
            for (i = 0; i < data.hours.length; i += 1) {
                item = data.hours[i];
                if (currentTeam !== item.team_number) {
                    teams[item.team_number] = [];
                    currentTeam = item.team_number;
                    series.push({
                        name: item.team_number,
                        data: []
                    });
                }
                teams[item.team_number][item.date] = {
                    hours: parseFloat(item.hours)
                };
            }
            startDate = moment($scope.startDate);
            endDate = moment($scope.endDate);
            for (i = 0; startDate <= endDate; i += 1) {
                for (j = 0; j < series.length; j += 1) {
                    if (teams[series[j].name].hasOwnProperty(startDate.format(DATE_FORMAT))) {
                        series[j].data[i] = [startDate.valueOf(), teams[series[j].name][startDate.format(DATE_FORMAT)].hours];
                    } else {
                        series[j].data[i] = [startDate.valueOf(), 0];
                    }
                }
                startDate = moment(startDate).add(1, 'day');
            }
            hourChart(series);
        }, function (data) {
            console.log(data);
        });
    };
    
    // Update scope variables based on datepickers.
    $scope.updateRangeFields = function () {
        $scope.startDate = $("#time-start").val();
        $scope.endDate = $("#time-end").val();
    };
    
    $("#time-start, #time-end").datetimepicker({
        format: "YYYY-MM-DD"
    });
    $("#time-start, #time-end").on("dp.change", $scope.updateRangeFields);

    teamService.getTeams(localStorage.SESSION_KEY).then(function (data) {
        $scope.teamsListed = data.teams;
    }, function (data) {
        console.log(data);
    });

    $scope.getHoursByTeam();
});

app.controller("ProfileController", function ($scope, $rootScope, $location, $routeParams, userService) {
    "use strict";

    var hourChartData, i;
    $scope.userTime = {};
    $scope.timeStart = moment().subtract(1, 'month').format(DATE_FORMAT);
    $scope.timeEnd = moment().format(DATE_FORMAT);

    // Hour chart
    function hourChart(data) {
        $('#hour-chart-container').highcharts({
            title: {
                text: 'Hours By Day'
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Hours'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ' hours',
                xDateFormat: '%a, %b %e, %Y'
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Time',
                data: data
            }]
        });
    }
    
    // Give information to the hour chart.
    function loadHourChart() {
        if ($scope.userId && moment($scope.timeEnd).diff($scope.timeStart, 'days') <= 366) {
            var timeStart, timeEnd;
            timeStart = moment($scope.timeStart).unix();
            timeEnd = $scope.timeEnd;
            if (timeEnd.length < 12) {
                timeEnd = moment(timeEnd).add(1, 'day').unix();
            } else {
                timeEnd = moment(timeEnd).unix();
            }
            userService.getHoursInRange($scope.userId, timeStart, timeEnd, localStorage.SESSION_KEY).then(function (data) {
                var startSeconds, endSeconds, dateDist;
                hourChartData = [];
                startSeconds = moment(timeStart * 1000).valueOf();
                endSeconds = moment(timeEnd * 1000).valueOf();
                for (i = startSeconds; i < endSeconds; i += 86400000) {
                    hourChartData.push([i, 0]);
                }
                for (i = 0; i < data.timelog.length; i += 1) {
                    dateDist = moment(data.timelog[i].date).diff($scope.timeStart, 'days');
                    if (dateDist < hourChartData.length) {
                        hourChartData[dateDist][1] = (parseFloat(data.timelog[i].hours) || 0);
                    }
                }
                hourChart(hourChartData);
            }, function (data) {
                console.log(data);
            });
        }
    }

    // Get information about the current user.
    $scope.loadUser = function () {
        userService.getCurrentUser(localStorage.SESSION_KEY).then(function (data) {
            $scope.userData = data.user;
            $scope.userId = data.user.user_id;
            $scope.currentUserId = data.user.user_id;
            $scope.loadUserTime();
        }, function (data) {
            console.log(data);
        });
    };

    // Get information about a specific user.
    $scope.loadUserById = function (userId) {
        userService.getUser($scope.userId, localStorage.SESSION_KEY).then(function (data) {
            $scope.userData = data.user;
            userService.getCurrentUser(localStorage.SESSION_KEY).then(function (data) {
                $scope.currentUserId = data.user.user_id;
            }, function (data) {
                console.log(data);
            });
        }, function (data) {
            console.log(data);
        });
    };

    // Determine the total time for the user.
    $scope.loadUserTime = function () {
        userService.getUserTime($scope.userId, $scope.timeStart, $scope.timeEnd, localStorage.SESSION_KEY).then(function (data) {
            var totalTime = parseInt(data.time, 0);
            $scope.userTime.totalSeconds = totalTime;
            $scope.userTime.hours = Math.floor(totalTime / 3600);
            totalTime -= $scope.userTime.hours * 3600;
            $scope.userTime.minutes = Math.floor(totalTime / 60);
            totalTime -= $scope.userTime.minutes * 60;
            $scope.userTime.seconds = totalTime;
            loadHourChart();
        }, function (data) {
            console.log(data);
        });
    };
    
    // Update scope variables based on datepickers.
    $scope.updateRangeFields = function () {
        $scope.timeStart = $("#time-start").val();
        $scope.timeEnd = $("#time-end").val();
    };
    
    $("#time-start, #time-end").datetimepicker({
        format: "YYYY-MM-DD"
    });
    $("#time-start, #time-end").on("dp.change", $scope.updateRangeFields);

    $scope.userId = $routeParams.userId;
    if ($scope.userId) {
        $scope.loadUserById($scope.userId);
        $scope.loadUserTime();
    } else {
        $scope.loadUser();
    }
});

app.controller("AddUserController", function ($scope, $rootScope, $location, userService) {
    "use strict";

    $scope.formData = {};
    $scope.passMatch = true;
    $scope.idsTaken = [];

    // Add a user to the database.
    $scope.submit = function () {
        userService.addUser($scope.formData, localStorage.SESSION_KEY).then(function (data) {
            displayMessage("User added successfully.", "success");
            $location.path("/");
        }, function (data) {
            console.log(data);
        });
    };

    // See if the password confirmation matches the password.
    $scope.doPassesMatch = function () {
        $scope.passMatch = ($scope.formData.user_password === $scope.formData.user_password_confirm)
                            && $scope.formData.user_password_confirm;
    };

    // See if there is already a user on the team with a particular number.
    $scope.isNumTaken = function () {
        $scope.idTaken = $scope.idsTaken.includes($scope.formData.team_number + "-" + $scope.formData.user_number);
    };

    // Load data to be used with isNumTaken.
    userService.getUsers(null, localStorage.SESSION_KEY).then(function (data) {
        var i;
        for (i = 0; i < data.users.length; i += 1) {
            $scope.idsTaken.push(data.users[i].user_id);
        }
    }, function (data) {
        console.log(data);
    });
});

app.controller("EditLogController", function ($scope, $rootScope, $window, $routeParams, timesheetService) {
    "use strict";

    var timelogId;

    // Confirm edits done to the timelog.
    $scope.saveChanges = function () {
        var timeout;
        if ($scope.timelog_timeout) {
            timeout = moment($scope.timelog_timeout, DATETIME_FORMAT).unix();
        } else {
            timeout = null;
        }
        timesheetService.updateTimelog($scope.timelog_id, moment($scope.timelog_timein, DATETIME_FORMAT).unix(),
                                       moment($scope.timelog_timeout, DATETIME_FORMAT).unix() || null,
                                       localStorage.SESSION_KEY).then(function (data) {
            displayMessage("Timelog updated sucessfully.", "success");
            $scope.getLogs();
            if ($scope.getLoggedInUsers) {
                $scope.getLoggedInUsers();
            }
        }, function (data) {
            console.log(data);
        });
    };

    // Erase the timelog being edited.
    $scope.deleteLog = function () {
        timesheetService.deleteTimelog($scope.timelog_id, localStorage.SESSION_KEY).then(function (data) {
            displayMessage("Timelog deleted.", "success");
            $scope.getLogs();
            if ($scope.getLoggedInUsers) {
                $scope.getLoggedInUsers();
            }
        }, function (data) {
            console.log(data);
        });
    };
    
    // Update scope variables based on datepickers.
    $scope.updateEditFields = function () {
        $scope.timelog_timein = $("#edit-log-timein").val();
        $scope.timelog_timeout = $("#edit-log-timeout").val();
    };
    
    $("#editModal").on("show.bs.modal", function () {
        $("#edit-log-timein, #edit-log-timeout").datetimepicker({
            format: "YYYY-MM-DD hh:mm A"
        });
        $("#edit-log-timein, #edit-log-timeout").on("dp.change", $scope.updateEditFields);
    });

    timelogId = $routeParams.timelogId;
    if (timelogId) {
        timesheetService.getTimelog(timelogId, localStorage.SESSION_KEY).then(function (data) {
            $scope.timelog_id = timelogId;
            $scope.timelog_timein = data.timelog.timelog_timein;
            $scope.timelog_timeout = data.timelog.timelog_timeout;
        }, function (data) {
            console.log(data);
        });
    }
});

app.controller("TeamPageController", function ($scope, $rootScope, $routeParams, teamService) {
    'use strict';

    var hourChartData, i;
    $scope.members = [];
    $scope.buttonText = "Button";
    $scope.timeStart = moment().subtract(1, 'month').format(DATE_FORMAT);
    $scope.timeEnd = moment().format(DATE_FORMAT);

    // Hour chart
    function hourChart(data, userIds) {
        var chart = $('#hour-chart-container').highcharts({
            chart: {
                type: 'bar',
                height: data.length * 25
            },
            title: {
                text: 'Hours Per Member'
            },
            xAxis: {
                type: 'category',
                labels: {
                    formatter: function () {
                        return "<a href='#/profile/" + userIds[this.value] +  "'>" + this.value + '<a>';
                    },
                    useHTML: true
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Hours'
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                valueSuffix: ' hours',
                positioner: function (labelWidth, labelHeight, point) {
                    var posX = point.plotX + labelWidth;
                    if (posX >= $('#hour-chart-container').width() - labelWidth) {
                        posX = $('#hour-chart-container').width() - labelWidth;
                    }
                    return {x: posX, y: point.plotY};
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0,
                    borderWidth: 0
                },
                series: {
                    dataLabels: {
                        enabled: true,
                        format: "{point.y:.0f}"
                    }
                }
            },
            series: [{
                name: 'Time',
                colorByPoint: true,
                data: data
            }]
        });
    }
    
    // Get information about the team.
    function loadTeam() {
        teamService.getTeam($scope.teamNumber, localStorage.SESSION_KEY).then(function (data) {
            $scope.teamData = data.team;
            $scope.loadHourChart();
        }, function (data) {
            console.log(data);
        });
    }
    
    // Give information to the hour chart.
    $scope.loadHourChart = function () {
        if ($scope.teamNumber && moment($scope.timeEnd).diff($scope.timeStart, 'days') <= 366) {
            var timeEnd = $scope.timeEnd;
            if (timeEnd.length < 12) {
                timeEnd += " 23:59:59";
            }
            teamService.getTeamTimes($scope.teamNumber, $scope.timeStart, timeEnd, localStorage.SESSION_KEY).then(function (data) {
                var hourChartData, userIds;
                userIds = {};
                hourChartData = [];
                $scope.members = [];
                for (i = 0; i < data.times.length; i += 1) {
                    hourChartData.push({
                        name: data.times[i].user_name,
                        y: Math.round(data.times[i].user_time / 36) / 100
                    });
                    $scope.members.push(data.times[i]);
                    userIds[data.times[i].user_name] = data.times[i].user_id;
                }
                hourChart(hourChartData, userIds);
            }, function (data) {
                console.log(data);
            });
        }
    };
    
    // Update scope variables based on datepickers.
    $scope.updateRangeFields = function () {
        $scope.timeStart = $("#time-start").val();
        $scope.timeEnd = $("#time-end").val();
    };
    
    $("#time-start, #time-end").datetimepicker({
        format: "YYYY-MM-DD"
    });
    $("#time-start, #time-end").on("dp.change", $scope.updateRangeFields);
    
    $scope.teamNumber = $routeParams.teamNumber;
    loadTeam();
});

app.controller("CreateLogController", function ($scope, $rootScope, timesheetService, teamService) {
    "use strict";

    var timelogId;
    
    $scope.teams = {};
    $scope.teamUsers = {};

    // Put a timelog into the database with the specified data.
    $scope.createTimelog = function () {
        timesheetService.writeTimelog($scope.user_id, moment($scope.timelog_timein, DATETIME_FORMAT).unix(),
                                      moment($scope.timelog_timeout, DATETIME_FORMAT).unix() || null,
                                      localStorage.SESSION_KEY).then(function (data) {
            displayMessage('Timelog created.', 'success');
            $scope.clearFields();
            if ($scope.getLogs) {
                $scope.getLogs();
            }
            if ($scope.getLoggedInUsers) {
                $scope.getLoggedInUsers();
            }
        }, function (data) {
            displayMessage('Error creating timelog.', 'danger');
            console.log(data);
        });
    };
    
    $scope.loadTeams = function () {
        // Load the teams and their members.
        teamService.getTeamsAndUsers(localStorage.SESSION_KEY).then(function (data) {
            if ($rootScope.user_admin) {
                $scope.teams = data.teams;
            } else {
                $scope.teams = {};
                $scope.teams[$rootScope.mentor_team] = data.teams[$rootScope.mentor_team];
            }
        }, function (data) {
            console.log(data);
        });
    };
    
    // Load the members of the team.
    $scope.loadTeamMembers = function () {
        if ($scope.team_number !== this.team_number) {
            $scope.team_number = this.team_number;
            if ($scope.team_number) {
                $scope.teamUsers = $scope.teams[$scope.team_number].members;
            } else {
                $scope.teamUsers = {};
            }
            this.user_id = "";
            $scope.user_id = "";
        }
    };
    
    // Update scope variables.
    $scope.updateFields = function () {
        $scope.user_id = $("#create-log-userid").val();
        $scope.timelog_timein = $("#create-log-timein").val();
        $scope.timelog_timeout = $("#create-log-timeout").val();
    };
    
    // Clear data inputs.
    $scope.clearFields = function () {
        this.team_number = "";
        $scope.loadTeamMembers();
        $("#create-log-userid").val("");
        $('#create-log-timein').val("");
        $('#create-log-timeout').val("");
        $scope.updateFields();
    };
    
    $scope.loadTeams();
    
    $("#createModal").on("show.bs.modal", function () {
        $scope.clearFields();
        this.set_timeout = true;
        $("#create-log-timein, #create-log-timeout").datetimepicker({
            format: "YYYY-MM-DD hh:mm A"
        });
        $("#create-log-timein, #create-log-timeout").on("dp.change", $scope.updateFields);
    });
});

app.controller("ChangePasswordController", function ($scope, $rootScope, $location, userService) {
    "use strict";
    
    $scope.formData = {};

    // Change the user's password.
    $scope.submit = function () {
        userService.changePassword($scope.formData, localStorage.SESSION_KEY).then(function (data) {
            displayMessage("Password changed successfully.", "success");
            $location.path("/profile");
        }, function (data) {
            console.log(data);
            displayMessage("Failure changing password.", "danger");
            $location.path("/profile");
        });
    };
});

app.controller("CreateGuestAccountController", function ($scope, $rootScope, $location, timesheetService, userService, loginService) {
	$scope.idsTaken = [];
	$scope.guestInfo = {
		user_name: "",
		user_number: null
	};
	
	//Checks whether a guest account with the entered id is taken
	$scope.isNumTaken = function () {
		$scope.idTaken = $scope.idsTaken.includes("0-" + $scope.guestInfo.user_number);
		
		if ($scope.idTaken) {
			$("#user_number_form").addClass("has-error");
		} else {
			$("#user_number_form").removeClass("has-error");
		}
	};
	
	//Adds guest account to the database
	$scope.submit = function () {
		console.log($scope.guestInfo);
		userService.addGuest($scope.guestInfo, localStorage.SESSION_KEY).then(function (data) {
			displayMessage("Guest account created successfully.", "success");
			$scope.guestInfo.user_name = "";
			$scope.guestInfo.user_number = null;
		}, function (data) {
			console.log(data);
		});
	};
	
	//Gets the id of all registered users
	userService.getUsers(null, localStorage.SESSION_KEY).then(function (data) {
		for (var i = 0; i < data.users.length; i++) {
			$scope.idsTaken.push(data.users[i].user_id);
		}
	}, function (data) {
		console.log(data);
	});
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
    }).when('/team_timesheet/:teamNumber', {
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
    }).when('/profile/:userId', {
        templateUrl: 'html/profile.html'
    }).when('/team/:teamNumber', {
        templateUrl: 'html/teamPage.html'
    }).when('/change_password', {
        templateUrl: 'html/changePassword.html'
    }).otherwise({
        redirectTo: '/'
    });
}]);