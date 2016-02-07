<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_GET["user_id"])) {
    $result = getUser($db, $_GET["user_id"], getSessionKey());
    if ($result) {
        $response["user"] = $result;
    } else {
        http_response_code(500);
        $response["error"] = "Error getting user information.";
    }
} else {
    http_response_code(400);
    $response["error"] = "User ID is required.";
}

echo json_encode($response);
$db->close();

?>