<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_GET["user_id"]) && isset($_GET["time_start"]) && isset($_GET["time_end"])) {
    $result = getHoursInRange($db, $_GET["user_id"], $_GET["time_start"], $_GET["time_end"], getSessionKey());
    if (is_array($result)) {
        $response["timelog"] = $result;
    } else {
        http_response_code(500);
        $response["error"] = "Error getting hours information.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing necessary information.";
}

echo json_encode($response);
$db->close();

?>