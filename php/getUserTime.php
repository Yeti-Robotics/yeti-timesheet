<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_GET["user_id"]) && isset($_GET["time_start"]) && isset($_GET["time_end"])) {
    $result = getUserTime($db, $_GET["user_id"], $_GET["time_start"], $_GET["time_end"], getSessionKey());
    if ($result) {
        $response["time"] = $result["user_time"];
        $response["start_time"] = $result["start_time"];
    } else {
        http_response_code(500);
        $response["error"] = "Error getting user time.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing required information.";
}

echo json_encode($response);
$db->close();

?>