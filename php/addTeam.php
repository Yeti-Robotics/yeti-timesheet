<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["team_number"]) && isset($_POST["team_name"])) {
    $success = addTeam($db, $_POST["team_number"], $_POST["team_name"], getSessionKey());
    if ($success) {
        http_response_code(201);
    } else {
        http_response_code(500);
        $response["error"] = "Error adding team.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Team name name and team number are required.";
}

echo json_encode($response);
$db->close();

?>