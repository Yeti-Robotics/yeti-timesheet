<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["timelog_id"])) {
    $success = deleteTimelog($db, $_POST["timelog_id"], getSessionKey());
    if ($success) {
        http_response_code(200);
    } else {
        http_response_code(500);
        $response["error"] = "Error deleting log.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Timelog ID is required.";
}

echo json_encode($response);
$db->close();

?>