<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
if (isset($_GET["team_number"])) {
    $team = getTeam($db, $_GET["team_number"], getSessionKey());
    if($team) {
        $response['team'] = $team;
    } else {
        http_response_code(500);
        $response["error"] = "Error retreiving team information.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Team number is required.";
}

echo json_encode($response);
$db->close();

?>