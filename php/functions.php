<?php

define("LOG_FILE", "error_log.log");

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

function addTeam($db, $teamNumber, $teamName, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
        return false;
    }
    $query = "INSERT INTO team (team_number, team_name)
                VALUES (?, ?)";
    return executeQuery($db, $query, "is", $teamNumber, $teamName);
}

function getTeams($db, $sessionKey) {
    if (!getUserID($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT * FROM team";
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

function addUser($db, $userNumber, $userName, $teamNumber, $userEmail, $userPassword, $userAdmin, $userMentor, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
        return false;
    }
    $query = "INSERT INTO user (user_id, user_name, team_number, user_email, user_password, user_admin, user_mentor)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
    return executeQuery($db, $query, "ssissii",
                        $teamNumber . "-" . $userNumber, $userName, $teamNumber, $userEmail, $userPassword, $userAdmin, $userMentor);
}

function getUsers($db, $teamNumber, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
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
        $teams = [];
        while ($row = $result->fetch_assoc()) {
            $teams[] = $row;
        }
        return $teams;
    } else {
        return false;
    }
}

function addTimelog($db, $userId, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT timelog_type, (CASE timelog_type WHEN 'IN' THEN 'OUT' ELSE 'IN' END) AS type
                FROM timelog
                WHERE user_id=? AND timelog_timestamp < NOW()
                ORDER BY timelog_timestamp DESC
                LIMIT 0,1";
    $result = executeSelect($db, $query, "s", $userId);
    $timelogType = "IN";
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $timelogType = $row["type"];
        }
    }
    $query = "INSERT INTO timelog (user_id, timelog_type)
                VALUES (?, ?)";
    return executeQuery($db, $query, "ss", $userId, $timelogType);
}

function getTimelogs($db, $filters, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
        return false;
    }
    $filterNames = ["user_name", "user_id", "team_name", "team_number"];
    $query = "SELECT timelog_id, timelog.user_id, timelog_timestamp, timelog_type, user_name, team_number
                FROM timelog
                LEFT JOIN user
                ON timelog.user_id = user.user_id
                WHERE timelog.user_id IN
                (SELECT user_id FROM user
                WHERE team_number in
                (SELECT team_number FROM team";
    $foundFilter = false;
    for ($i = 2; $i < 4; $i++) {
        $filterName = $filterNames[$i];
        $filter = $filters[$filterName];
        if ($filter != null) {
            if ($foundFilter) {
                $query .= " AND";
            } else {
                $query .= " WHERE";
            }
            $query = $query . sprintf(" LCASE(%s) = LCASE('%s')", $filterName, $filter);
            $foundFilter = true;
        }
    }
    $query .= ")";
    for ($i = 0; $i < 2; $i++) {
        $filterName = $filterNames[$i];
        $filter = $filters[$filterName];
        if ($filter) {
            $query .= sprintf(" AND LCASE(%s) = LCASE('%s')", $filterName, $filter);
        }
    }
    $query .= ")";
    if ($filters["time_limit"] != null) {
        $query .= " AND timelog_timestamp > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)";
    }
    $query .= " ORDER BY timelog_timestamp DESC";
    $filter = $filters["num_limit"];
    if ($filter != null && is_numeric($filter)) {
        $query .= " LIMIT $filter";
    }
    
    $result = executeSelect($db, $query);
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

function getLastTimelogs($db, $limit, $sessionKey) {
    if (!isAdmin($db, $sessionKey)) {
        return false;
    }
    $query = "SELECT user.user_name,
                MAX(timelog.timelog_timestamp) AS 'timelog_timestamp',
                COUNT(timelog.timelog_id) % 2 AS 'signed_in'
                FROM timelog
                LEFT JOIN user
                ON user.user_id = timelog.user_id
                GROUP BY user.user_id
                ORDER BY MAX(timelog.timelog_timestamp) DESC
                LIMIT ?";
    $result = executeSelect($db, $query, "i", $limit);
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

function teamSignout($db, $teamNumber) {
    // add a timelog for each team member with an odd number of timelogs
    $query = "INSERT INTO timelog (user_id, timelog_type)
                SELECT user.user_id, 'OUT' as timelog_type
                FROM timelog
                LEFT JOIN user
                ON user.user_id = timelog.user_id
                WHERE user.team_number = ?
                GROUP BY user_id
                HAVING COUNT(timelog.timelog_id) % 2 = 1";
    return executeQuery($db, $query, "i", $teamNumber);
}

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

function logToFile($fileName, $message) {
    $string = "[".date("F j, Y, g:i a")."] - ";
    $string .= $message;
    $string .= "\r\n";
    error_log($string, 3, $fileName);
}

function getSessionKey() {
    $headers = getallheaders();
    if (isset($headers["SESSION_KEY"])) {
        return $headers["SESSION_KEY"];
    }
    return false;
}

function login($db, $userId, $password) {
    $query = "SELECT user_admin FROM user WHERE user_id = ? AND user_password = MD5(?)";
    $result = executeSelect($db, $query, "ss", $userId, $password);
    $success = false;
    $response = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $response = $row;
            $success = true;
        }
    }
    if ($success) {
        $sessionKey = sha1($userId + time());
        $query = "INSERT INTO session (user_id, session_key) VALUES (?, ?)";
        $success = executeQuery($db, $query, "ss", $userId, $sessionKey);
        if (!$success) {
            return false;
        }
        $response["session_key"] = $sessionKey;
        return $response;
    }
    return false;
}

function logout($db, $sessionKey) {
    $query = "DELETE FROM session WHERE session_key = ?";
    return executeQuery($db, $query, "s", $sessionKey);
}

?>