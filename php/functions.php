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
    return null;
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

function addTimelog($db, $userId) {
    $query = "INSERT INTO timelog (user_id)
                VALUES (?)";
    return executeQuery($db, $query, "s", $userId);
}

function teamSignout($db, $teamNumber) {
    // add a timelog for each user on a team with an odd number of timelogs
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