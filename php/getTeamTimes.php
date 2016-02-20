<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_GET["team_number"]) && isset($_GET["time_start"]) && isset($_GET["time_end"])) {
    $result = getTeamTimes($db, $_GET["team_number"], $_GET["time_start"], $_GET["time_end"], getSessionKey());
    if (is_array($result)) {
        $response["times"] = $result;
    } else {
        http_response_code(500);
        $response["error"] = "Error getting user times.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing required information.";
}

echo json_encode($response);
$db->close();

?>