<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_GET["time_start"]) && isset($_GET["time_end"])) {
    $result = getHoursByTeam($db, $_GET["time_start"], $_GET["time_end"], getSessionKey());
    if (is_array($result)) {
        $response["hours"] = $result;
    } else {
        http_response_code(500);
        $response["error"] = "Error getting team hour information.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing necessary information.";
}

echo json_encode($response);
$db->close();

?>