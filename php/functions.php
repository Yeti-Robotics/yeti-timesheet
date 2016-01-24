<?php

function executeQuery($db, $query, ...$bindParamArgs) {
    // execute a query
    if ($stmt = $db->prepare($query)) {
        $stmt->bind_param(...$bindParamArgs);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($stmt->error) {
            return false;
        }
    } else {
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
    }
    return false;
}

function addTeam($db, $teamNumber, $teamName) {
    $query = "INSERT INTO team (team_number, team_name)
                VALUES (?, ?)";
    return executeQuery($db, $query, "is", $teamNumber, $teamName);
}

function getTeams($db) {
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

function addUser($db, $userNumber, $userName, $teamNumber, $userEmail, $userPassword, $userAdmin, $userMentor) {
    if (!$userNumber) {
        // assign a number
        $query = "SELECT user_id FROM user WHERE team_number = ?";
        $result = executeSelect($db, $query, "i", $teamNumber);
        $numbers = [];
        $highest = 0;
        while ($row = $result->fetch_assoc()) {
            $number = explode("-", $row["user_id"])[1];
            $numbers[$number] = 1;
            if ($number > $highest) {
                $highest = $number;
            }
        }
        $counter = 1;
        while (!$userNumber) {
            if (!isset($numbers[$counter]) || $counter > $highest) {
                $userNumber = $counter;
            }
            $counter += 1;
        }
    }
    $query = "INSERT INTO user (user_id, user_name, team_number, user_email, user_password, user_admin, user_mentor)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
    return executeQuery($db, $query, "ssissii",
                        $teamNumber . "-" . $userNumber, $userName, $teamNumber, $userEmail, $userPassword, $userAdmin, $userMentor);
}

function getUsers($db, $teamNumber) {
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

function addTimelog($db, $userId) {
    $query = "INSERT INTO timelog (user_id)
                VALUES (?)";
    return executeQuery($db, $query, "s", $userId);
}

function getTimelogs($db, $filters) {
    $filterNames = ["user_name", "user_id", "team_name", "team_number"];
    $query = "SELECT * FROM timelog WHERE user_id IN (SELECT user_id FROM user WHERE team_number in (SELECT team_number FROM team";
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
        if ($filter != null) {
            $query .= sprintf(" AND LCASE(%s) = LCASE('%s')", $filterName, $filter);
        }
    }
    $query .= ")";
    
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

function getLastTimelogs($db, $limit) {
    $query = "SELECT user.user_name,
                MAX(timelog.timesheet_timestamp) AS 'timesheet_timestamp',
                COUNT(timelog.timelog_id) % 2 AS 'signed_in'
                FROM timelog
                LEFT JOIN user
                ON user.user_id = timelog.user_id
                GROUP BY user.user_id
                ORDER BY MAX(timelog.timesheet_timestamp) DESC
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
    $query = "INSERT INTO timelog (user_id)
                SELECT user.user_id
                FROM timelog
                LEFT JOIN user
                ON user.user_id = timelog.user_id
                WHERE user.team_number = ?
                GROUP BY user_id
                HAVING COUNT(timelog.timelog_id) % 2 = 1";
    return executeQuery($db, $query, "i", $teamNumber);
}

?>