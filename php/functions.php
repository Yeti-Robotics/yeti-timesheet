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

?>