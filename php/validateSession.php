<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$userId = getUserID($db, getSessionKey());
if($userId) {
    $response['user_id'] = $userId;
    $response['user_admin'] = isAdmin($db, getSessionKey());
} else {
    http_response_code(500);
    $response["error"] = "Error validating session.";
}

echo json_encode($response);
$db->close();

?>