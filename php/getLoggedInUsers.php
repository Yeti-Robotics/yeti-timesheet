<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$users = getLoggedInUsers($db, getSessionKey());
if(is_array($users)) {
    $response['users'] = $users;
} else {
    http_response_code(500);
    $response["error"] = "Error retreiving logged in users.";
}

echo json_encode($response);
$db->close();

?>