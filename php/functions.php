<?php

define("LOG_FILE", "error_log.log");

// Execute an SQL query that doesn't return a result.
function executeQuery($db, $query, ...$bindParamArgs) {
    // execute a query
    if ($stmt = $db->prepare($query)) {
        $stmt->bind_param(...$bindParamArgs);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($stmt->error) {
            logToFile(LOG_FILE, $stmt->error);
            return false;
        }
    } else {
        logToFile(LOG_FILE, "Unable to prepare statement with query: $query");
        return false;
    }
    return true;
}

// Execute an SQL select query.
function executeSelect($db, $query, ...$bindParamArgs) {
    // get the result of a select query
    if ($stmt = $db->prepare($query)) {
        if (count($bindParamArgs) > 0) {
            $stmt->bind_param(...$bindParamArgs);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result) {
            return $result;
        }
        if ($stmt->error) {
            logToFile(LOG_FILE, $stmt->error);
            return false;
        }
    } else {
        logToFile(LOG_FILE, "Unable to prepare statement with query: $query");
        return false;
    }
    return false;
}

// Check to see if there is already a user with the given user ID.
function idTaken($db, $userId) {
    $query = "SELECT COUNT(*) > 0 AS taken FROM user WHERE user_id = ?";
    $result = executeSelect($db, $query, "s", $userId);
    if ($result) {
        $taken = false;
        while ($row = $result->fetch_assoc()) {
            if ($row["taken"]) {
                $taken = (boolean) $row["taken"];
            }
        }
        return $taken;
    } else {
        return null;
    }
}

// Add a team to the database.
function addTeam($db, $teamNumber, $teamName, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
        return false;
    }
    $query = "INSERT INTO team (team_number, team_name)
                VALUES (?, ?)";
    return executeQuery($db, $query, "is", $teamNumber, $teamName);
}

// Retrieve information about all teams.
function getTeams($db, $sessionKey) {
    if (!getUserID($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT * FROM team
                ORDER BY (CASE team_number WHEN 3506 THEN 0 ELSE team_number END)";
    $result = executeSelect($db, $query);
    if ($result) {
        $teams = [];
        while ($row = $result->fetch_assoc()) {
            $teams[] = $row;
        }
        return $teams;
    } else {
        return false;
    }
}

// Retrieve information about a team.
function getTeam($db, $teamNumber, $sessionKey) {
    if (!hasTeamMentorRights($db, $teamNumber, $sessionKey)) {
        return false;
    }
    $query = "SELECT * FROM team WHERE team_number = ?";
    $result = executeSelect($db, $query, "i", $teamNumber);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            return $row;
        }
    }
    return false;
}

// Retrieve daily hour information from all teams.
function getTeamTimes($db, $teamNumber, $timeStart, $timeEnd, $sessionKey) {
    if (!hasMentorRights($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT user.user_id, user.user_name, user.user_mentor,
                IFNULL(SUM(UNIX_TIMESTAMP(IFNULL(timelog_timeout, NOW())) - UNIX_TIMESTAMP(timelog_timein)),0)
                AS user_time
                FROM user
                LEFT JOIN timelog
                ON user.user_id = timelog.user_id
                AND (timelog_timein > ?
                    OR timelog_timein IS NULL)
                AND (timelog_timeout < ?
                    OR (timelog_timeout IS NULL
                        AND (timelog_timein < ?
                            OR timelog_timein IS NULL)))
                WHERE team_number = ?
                GROUP BY user_id
                ORDER BY user_name ASC";
    $result = executeSelect($db, $query, "sssi", $timeStart, $timeEnd, $timeEnd, $teamNumber);
    if ($result) {
        $times = [];
        while ($row = $result->fetch_assoc()) {
            $times[] = $row;
        }
        return $times;
    }
    return false;
}

// Retrieve all users with their teams.
function getTeamsAndUsers($db, $sessionKey) {
    if (!getUserID($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT user_id, user_name, user.team_number, team_name
                FROM user JOIN team ON user.team_number = team.team_number
               	ORDER BY (CASE user.team_number WHEN 3506 THEN 0 ELSE user.team_number END) ASC,
                user_id ASC";
    $result = executeSelect($db, $query);
    if ($result) {
        $teams = [];
        while ($row = $result->fetch_assoc()) {
            $teamNumber = $row['team_number'];
            if (!isset($teams[$teamNumber])) {
                $teams[$teamNumber] = array(
                    "team_name" => $row["team_name"],
                    "members" => []
                );
            }
            $teams[$teamNumber]["members"][$row['user_id']] = array(
                "user_name" => $row["user_name"]
            );
        }
        return $teams;
    } else {
        return false;
    }
}

// Add a user to the database.
function addUser($db, $userNumber, $userName, $teamNumber, $userEmail, $userPassword, $userAdmin, $userMentor, $sessionKey) {
    if (!hasTeamMentorRights($db, $teamNumber, $sessionKey)) {
        return false;
    }
    $query = "INSERT INTO user (user_id, user_name, team_number, user_email, user_password, user_admin, user_mentor)
                VALUES (?, ?, ?, IFNULL(?, ''), ?, ?, ?)";
    return executeQuery($db, $query, "ssissii",
                        $teamNumber . "-" . $userNumber, $userName, $teamNumber, $userEmail, md5($userPassword), $userAdmin, $userMentor);
}

// Retrieve information about all members of a team.
function getUsers($db, $teamNumber, $sessionKey) {
    if (!hasMentorRights($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT * FROM user";
    $result = null;
    if ($teamNumber != null) {
        $result = executeSelect($db, $query . " WHERE team_number = ?", "i", $teamNumber);
    } else {
        $result = executeSelect($db, $query);
    }
    if ($result) {
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        return $users;
    } else {
        return false;
    }
}

// Retrieve information about a user.
function getUser($db, $userId, $sessionKey) {
    if (!hasUserRights($db, $userId, $sessionKey)) {
        return false;
    }
    $query = "SELECT user_name, user.user_id, user_email, user_mentor, user_admin, user.team_number, team.team_name
                FROM user
                JOIN team ON team.team_number = user.team_number
                WHERE user_id = ?";
    $result = executeSelect($db, $query, "s", $userId);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            return $row;
        }
    }
    return false;
}

// Retrieve total time for a user during a given period.
function getUserTime($db, $userId, $timeStart, $timeEnd, $sessionKey) {
    if (!hasUserRights($db, $userId, $sessionKey)) {
        return false;
    }
    $query = "SELECT IFNULL(SUM(UNIX_TIMESTAMP(IFNULL(timelog_timeout, NOW())) - UNIX_TIMESTAMP(timelog_timein)),0)
                AS user_time
                FROM timelog
                WHERE user_id = ?
                AND timelog_timein > ?
                AND (timelog_timeout < ?
                OR (timelog_timeout IS NULL
                AND timelog_timein < ?))";
    $result = executeSelect($db, $query, "ssss", $userId, $timeStart, $timeEnd, $timeEnd);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            return $row;
        }
    }
    return false;
}

// Retrieve hours by day for a user from the past 30 days.
function getHours($db, $userId, $sessionKey) {
    if (!hasUserRights($db, $userId, $sessionKey)) {
        return false;
    }
    $query = "SELECT DATE(timelog_timein) as date,
                (SUM(UNIX_TIMESTAMP(IFNULL(timelog_timeout, NOW()))) - SUM(UNIX_TIMESTAMP(timelog_timein)))
                / 3600 as hours
                FROM timelog
                WHERE user_id = ? AND timelog_timein > DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY date
                ORDER BY date ASC";
    $result = executeSelect($db, $query, "s", $userId);
    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        return $logs;
    } else {
        return false;
    }
}

// Retrieve hours by day for a user during a given period.
function getHoursInRange($db, $userId, $startSeconds, $endSeconds, $sessionKey) {
    if (!hasUserRights($db, $userId, $sessionKey)) {
        return false;
    }
    $query = "SELECT DATE(timelog_timein) as date,
                (SUM(UNIX_TIMESTAMP(IFNULL(timelog_timeout, NOW()))) - SUM(UNIX_TIMESTAMP(timelog_timein)))
                / 3600 as hours
                FROM timelog
                WHERE user_id = ?
                AND UNIX_TIMESTAMP(timelog_timein) > ?
                AND (UNIX_TIMESTAMP(timelog_timeout) < ?
                    OR (timelog_timeout IS NULL AND ? > UNIX_TIMESTAMP(NOW())))
                GROUP BY date
                ORDER BY date ASC";
    $result = executeSelect($db, $query, "siii", $userId, $startSeconds, $endSeconds, $endSeconds);
    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        return $logs;
    } else {
        return false;
    }
}

// Retrieve hours by day for each team during a given period.
function getHoursByTeam($db, $startDate, $endDate, $sessionKey) {
    if (!hasMentorRights($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT DATE(timelog_timein) as date, team_number,
                (SUM(UNIX_TIMESTAMP(IFNULL(timelog_timeout, NOW()))) - SUM(UNIX_TIMESTAMP(timelog_timein))) / 3600 as hours
                FROM timelog
                JOIN user ON user.user_id = timelog.user_id
                WHERE DATE(timelog_timein) >= ? AND DATE(timelog_timein) <= ?
                GROUP BY date, team_number
                ORDER BY (CASE team_number WHEN 3506 THEN 0 ELSE team_number END) ASC, date ASC";
    $result = executeSelect($db, $query, "ss", $startDate, $endDate);
    if ($result) {
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    } else {
        return false;
    }
}

// Change the current user's password.
function changePassword($db, $oldPassword, $newPassword, $sessionKey) {
    $userId = getUserID($db, $sessionKey);
    $query = "SELECT user_id FROM user WHERE user_password = MD5(?) AND user_id = ?";
    $result = executeSelect($db, $query, "ss", $oldPassword, $userId);
    $success = false;
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $success = true;
        }
    }
    if ($success) {
        $query = "UPDATE user SET user_password = MD5(?) WHERE user_password = MD5(?) AND user_id = ?";
        return executeQuery($db, $query, "sss", $newPassword, $oldPassword, $userId);
    }
    return false;
}

// Record the current time to a user's timelogs.
function addTimelog($db, $userId, $sessionKey) {
    if (!hasUserMentorRights($db, $userId, $sessionKey)) {
        return false;
    }
    $query = "SELECT timelog_id, user_id,
                UNIX_TIMESTAMP(timelog_timein) as timelog_timein,
                UNIX_TIMESTAMP(timelog_timeout) as timelog_timeout
                FROM timelog
                WHERE user_id = ?
                AND timelog_timeout IS NULL
                ORDER BY timelog_timein DESC
                LIMIT 0,1";
    $result = executeSelect($db, $query, "s", $userId);
    if ($result) {
        $row = $result->fetch_assoc();
        if ($row) {
            $query = "UPDATE timelog SET timelog_timeout = NOW() WHERE timelog_id = ?";
            return executeQuery($db, $query, "i", $row["timelog_id"]);
        } else {
            $query = "INSERT INTO timelog (user_id) VALUES (?)";
            return executeQuery($db, $query, "s", $userId);
        }
    }
    return false;
}

// Add a new timelog with specified times.
function writeTimelog($db, $userId, $timelogIn, $timelogOut, $sessionKey) {
    if (!hasUserMentorRights($db, $userId, $sessionKey)) {
        return false;
    }
    $query = "INSERT INTO timelog (user_id, timelog_timein, timelog_timeout)
				VALUES (?, FROM_UNIXTIME(?), (CASE ? WHEN '' THEN NULL ELSE FROM_UNIXTIME(?) END))";
    return executeQuery($db, $query, "ssss", $userId, $timelogIn, $timelogOut, $timelogOut);
}

// Retrieve information about a timelog.
function getTimelog($db, $timelogId) {
    $query = "SELECT timelog_id, user_id,
                UNIX_TIMESTAMP(timelog_timein) as timelog_timein,
                UNIX_TIMESTAMP(timelog_timeout) as timelog_timeout
                FROM timelog WHERE timelog_id = ?";
    $result = executeSelect($db, $query, "i", $timelogId);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            return $row;
        }
    }
    return false;
}

// Search the database for timelogs.
function getTimelogs($db, $filters, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
        if (isMentor($db, $sessionKey)) {
            $filters["team_number"] = getMentorTeam($db, $sessionKey);
        } else {
            return false;
        }
    }
    $filterNames = ["team_name", "team_number", "user_name", "user_id"];
    $paramBindTypes = "";
    $paramsToBind = [];
    $query = "SELECT timelog_id, timelog.user_id, UNIX_TIMESTAMP(timelog_timein) AS timelog_timein,
                UNIX_TIMESTAMP(timelog_timeout) AS timelog_timeout, user_name, team_number
                FROM timelog
                LEFT JOIN user
                ON timelog.user_id = user.user_id
                WHERE timelog.user_id IN
                (SELECT user_id FROM user
                WHERE team_number in
                (SELECT team_number FROM team";
    $foundFilter = false;
    for ($j = 0; $j < 2; $j++) {
        for ($i = $j*2; $i < ($j+1)*2; $i++) {
            $filterName = $filterNames[$i];
            $filter = $filters[$filterName];
            if ($filter) {
                if ($foundFilter || $j == 1) {
                    $query .= " AND";
                } else {
                    $query .= " WHERE";
                }
                $equal = "=";
                if ($i % 2 == 0) {
                    $equal = "LIKE";
                    $filter = "%$filter%";
                }
                $query .= " $filterName $equal ?";
                $paramsToBind[] = $filter;
                $paramBindTypes .= "s";
                $foundFilter = true;
            }
        }
        $query .= ")";
    }
    if ($filters["time_limit"] != null) {
        $query .= " AND timelog_timein > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)";
    }
    if ($filters["time_start"] != null) {
        $query .= " AND timelog_timein > ?";
        $paramsToBind[] = $filters["time_start"];
        $paramBindTypes .= "s";
    }
    if ($filters["time_end"] != null) {
        $query .= " AND IFNULL(timelog_timeout, timelog_timein)";
        if (strlen($filters["time_end"]) < 12) {
            $query .= " < DATE_ADD(?, INTERVAL 1 DAY)";
        } else {
            $query .= " < ?";
        }
        $paramsToBind[] = $filters["time_end"];
        $paramBindTypes .= "s";
    }
    $query .= " ORDER BY timelog_timein DESC, timelog_id DESC";
    $filter = $filters["num_limit"];
    if ($filter != null && is_numeric($filter)) {
        if (!($filters["num_low"] && is_numeric($filters["num_low"]))) {
            $filters["num_low"] = 0;
        }
        $query .= " LIMIT ?,?";
        $paramsToBind[] = $filters["num_low"];
        $paramsToBind[] = $filter;
        $paramBindTypes .= "ii";
    }
    
    if (strlen($paramBindTypes) > 0) {
        array_unshift($paramsToBind, $paramBindTypes);
    }
    $result = executeSelect($db, $query, ...$paramsToBind);
    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        return $logs;
    } else {
        return false;
    }
}

// Change the times recorded on a timelog.
function updateTimelog($db, $timelogId, $timelogIn, $timelogOut, $sessionKey) {
    if (isAdmin($db, $sessionKey)) {
        $query = "UPDATE timelog SET
                    timelog_timein = FROM_UNIXTIME(?),
                    timelog_timeout = (CASE ? WHEN '' THEN NULL ELSE FROM_UNIXTIME(?) END)
                    WHERE timelog.timelog_id = ?";
        return executeQuery($db, $query, "sssi", $timelogIn, $timelogOut, $timelogOut, $timelogId);
    } elseif (isMentor($db, $sessionKey)) {
        $query = "UPDATE timelog SET
                    timelog_timein = FROM_UNIXTIME(?),
                    timelog_timeout = (CASE ? WHEN '' THEN NULL ELSE FROM_UNIXTIME(?) END)
                    WHERE timelog.timelog_id = ? AND user_id IN
                    (SELECT user_id FROM user WHERE team_number = ?)";
        return executeQuery($db, $query, "sssii", $timelogIn, $timelogOut, $timelogOut, $timelogId, getMentorTeam($db, $sessionKey));
    }
    return false;
}

// Remove a timelog from the database.
function deleteTimelog($db, $timelogId, $sessionKey) {
    if (isAdmin($db, $sessionKey)) {
        $query = "DELETE FROM timelog WHERE timelog_id = ?";
        return executeQuery($db, $query, "i", $timelogId);
    } elseif (isMentor($db, $sessionKey)) {
        $query = "DELETE FROM timelog WHERE timelog_id = ? AND user_id IN
                    (SELECT user_id FROM user WHERE team_number = ?)";
        return executeQuery($db, $query, "ii", $timelogId, getMentorTeam($db, $sessionKey));
    }
    return false;
}

// See which users are currently logged in.
function getLoggedInUsers($db, $sessionKey) {
    if (!hasMentorRights($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT user.user_id, user_name, user.team_number, team.team_name FROM timelog
                JOIN user ON user.user_id = timelog.user_id
                JOIN team ON user.team_number = team.team_number
                WHERE timelog_timeout IS NULL
                ORDER BY (CASE team.team_number WHEN 3506 THEN 0 ELSE team.team_number END) ASC,
                        user_name ASC";
    $result = executeSelect($db, $query);
    if ($result) {
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        return $users;
    } else {
        return false;
    }
}

// Record the current time in all unfinished timelogs from a team.
function teamSignout($db, $teamNumber, $sessionKey) {
    if (!hasTeamMentorRights($db, $teamNumber, $sessionKey)) {
        return false;
    }
    $query = "UPDATE timelog SET timelog_timeout = NOW()
                WHERE timelog.user_id IN
                (SELECT user_id FROM user WHERE team_number = ?)
                AND timelog_timeout IS NULL";
    return executeQuery($db, $query, "i", $teamNumber);
}

// Get the current user's user ID.
function getUserID($db, $sessionKey) {
    $query = "SELECT user_id FROM session WHERE session_key = ?";
    $result = executeSelect($db, $query, "s", $sessionKey);
    $id = false;
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $id = $row["user_id"];
        }
    }
    return $id;
}

// See if the current user is an admin.
function isAdmin($db, $sessionKey) {
    $query = "SELECT user_admin
                FROM session
                LEFT JOIN user
                ON user.user_id = session.user_id
                WHERE session_key = ?";
    $result = executeSelect($db, $query, "s", $sessionKey);
    $isAdmin = false;
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if ($row["user_admin"]) {
                $isAdmin = (boolean) $row["user_admin"];
            }
        }
    }
    if (!$isAdmin) {
        logToFile(LOG_FILE, "User is not an admin with session key: $sessionKey");
    }
    return $isAdmin;
}

// See if the current user is a mentor for a team.
function isTeamMentor($db, $teamNumber, $sessionKey) {
    $query = "SELECT user_mentor
                FROM session
                LEFT JOIN user
                ON user.user_id = session.user_id
                WHERE session_key = ?
                AND team_number = ?";
    $result = executeSelect($db, $query, "si", $sessionKey, $teamNumber);
    $isMentor = false;
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if ($row["user_mentor"]) {
                $isMentor = (boolean) $row["user_mentor"];
            }
        }
    }
    if (!$isMentor) {
        logToFile(LOG_FILE, "User is not a mentor for team $teamNumber with session key: $sessionKey");
    }
    return $isMentor;
}

// See if the current user is a mentor.
function isMentor($db, $sessionKey) {
    $query = "SELECT user_mentor
                FROM session
                LEFT JOIN user
                ON user.user_id = session.user_id
                WHERE session_key = ?";
    $result = executeSelect($db, $query, "s", $sessionKey);
    $isMentor = false;
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if ($row["user_mentor"]) {
                $isMentor = (boolean) $row["user_mentor"];
            }
        }
    }
    if (!$isMentor) {
        logToFile(LOG_FILE, "User is not a mentor with session key: $sessionKey");
    }
    return $isMentor;
}

// See if the current user is a mentor, and which team the user is a mentor for.
function getMentorTeam($db, $sessionKey) {
    $query = "SELECT team_number
                FROM session
                LEFT JOIN user
                ON user.user_id = session.user_id
                WHERE session_key = ?
                AND user_mentor";
    $result = executeSelect($db, $query, "s", $sessionKey);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            return $row["team_number"];
        }
    }
    logToFile(LOG_FILE, "User is not a mentor with session key: $sessionKey");
    return false;
}

// See if the current user is a mentor for another user's team.
function isMentorToId($db, $userId, $sessionKey) {
    $query = "SELECT (team_number IN
                (SELECT team_number FROM user WHERE user_id = ?)) as same_team
                FROM user WHERE user_mentor AND user_id IN
                (SELECT user_id FROM session WHERE session_key = ?)";
    $result = executeSelect($db, $query, "ss", $userId, $sessionKey);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            return (boolean) $row["same_team"];
        }
    }
    return false;
}

// See if the current user is allowed to do what a team mentor is allowed to do.
function hasTeamMentorRights($db, $teamNumber, $sessionKey) {
    return isTeamMentor($db, $teamNumber, $sessionKey) || isAdmin($db, $sessionKey);
}

// See if te current user is allowed to do what mentors do.
function hasMentorRights($db, $sessionKey) {
    return isMentor($db, $sessionKey) || isAdmin($db, $sessionKey);
}

// See if the current user is alowed to do what a user's team mentors are allowed to do.
function hasUserMentorRights($db, $userId, $sessionKey) {
    return isMentorToId($db, $userId, $sessionKey) || isAdmin($db, $sessionKey);
}

// See if the current user can do what a particular user can do.
function hasUserRights($db, $userId, $sessionKey) {
    return getUserID($db, $sessionKey) == $userId || hasUserMentorRights($db, $userId, $sessionKey);
}

// Record a string to an output file.
function logToFile($fileName, $message) {
    $string = "[".date("F j, Y, g:i a")."] - ";
    $string .= $message;
    $string .= "\r\n";
    error_log($string, 3, $fileName);
}

// Retrieve the value of the current user's session key.
function getSessionKey() {
    $headers = getallheaders();
    if (isset($headers["Session-Key"])) {
        return $headers["Session-Key"];
    }
    return false;
}

// See who the current user is.
function getCurrentUser($db, $sessionKey) {
    $query = "SELECT user_name, user.user_id, user_email, user_mentor, user_admin, user.team_number, team.team_name
                FROM session
                JOIN user ON user.user_id = session.user_id
                JOIN team ON team.team_number = user.team_number
                WHERE session_key = ?";
    $result = executeSelect($db, $query, "s", $sessionKey);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            return $row;
        }
    }
    return false;
}

// Try to log in the current user and return a session key.
function login($db, $userId, $password) {
    $query = "SELECT user_id, user_admin, (CASE WHEN user_mentor THEN team_number ELSE 0 END) as mentor_team
                FROM user WHERE (user_id = ? OR user_email LIKE ?) AND user_password = MD5(?)";
    $result = executeSelect($db, $query, "sss", $userId, $userId, $password);
    $success = false;
    $response = [];
    $usersFound = 0;
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $response = $row;
            $userId = $row['user_id'];
            $usersFound += 1;
        }
    }
    if ($usersFound == 1) {
        $sessionKey = sha1($userId + time());
        $query = "INSERT INTO session (user_id, session_key) VALUES (?, ?)";
        $success = executeQuery($db, $query, "ss", $response["user_id"], $sessionKey);
        if (!$success) {
            return false;
        }
        $response["session_key"] = $sessionKey;
        return $response;
    }
    return false;
}

// Delete a session from the database.
function logout($db, $sessionKey) {
    $query = "DELETE FROM session WHERE session_key = ?";
    return executeQuery($db, $query, "s", $sessionKey);
}

?>