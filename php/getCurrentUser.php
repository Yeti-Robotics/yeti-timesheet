<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

$result = getCurrentUser($db, getSessionKey());
if ($result) {
    $response["user"] = $result;
} else {
    http_response_code(500);
    $response["error"] = "Error getting user information.";
}

echo json_encode($response);
$db->close();

?>