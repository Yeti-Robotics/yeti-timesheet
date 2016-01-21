<?php

function addTeam($db, $teamNumber, $teamName) {
    $query = "INSERT INTO team (team_number, team_name)
                VALUES (?, ?)";
    if ($stmt = $db->prepare($query)) {
        $stmt->bind_param("is", $teamNumber, $teamName);
        $stmt->execute();
        if ($stmt->error) {
            return false;
        }
    } else {
        return false;
    }
    return true;
}

function getTeams($db) {
    $query = "SELECT * FROM team";
    if($result = $db->query($query)) {
        $teams = [];
        while ($row = $result->fetch_assoc()) {
            $teams[] = $row;
        }
        return $teams;
    } else {
        return false;
    }
}

?>