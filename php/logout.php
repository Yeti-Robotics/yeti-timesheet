<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

$sessionKey = getSessionKey();
if ($sessionKey) {
    $result = logout($db, $sessionKey);
    if ($result) {
        http_response_code(200);
    } else {
        http_response_code(500);
        $response["error"] = "Error logging out.";
    }
} else {
    http_response_code(400);
    $response["error"] = "User isn't logged in.";
}

echo json_encode($response);
$db->close();

?>