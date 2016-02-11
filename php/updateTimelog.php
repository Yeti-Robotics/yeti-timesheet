<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["timelog_id"]) && isset($_POST["user_id"])
    && isset($_POST["timelog_type"]) && isset($_POST["timelog_timestamp"])) {
    $success = updateTimelog($db, $_POST["timelog_id"], $_POST["user_id"],
                       $_POST["timelog_type"], $_POST["timelog_timestamp"], getSessionKey());
    if ($success) {
        http_response_code(200);
    } else {
        http_response_code(500);
        $response["error"] = "Error updating timelog.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing required information.";
}

echo json_encode($response);
$db->close();

?>