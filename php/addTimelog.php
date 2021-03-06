<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["user_id"])) {
    $success = addTimelog($db, $_POST["user_id"], getSessionKey());
    if ($success) {
        http_response_code(201);
    } else {
        http_response_code(500);
        $response["error"] = "Invalid User ID.";
    }
} else {
    http_response_code(400);
    $response["error"] = "User ID is required.";
}

echo json_encode($response);
$db->close();

?>