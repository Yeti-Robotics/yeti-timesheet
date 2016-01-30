<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["user_id"]) && isset($_POST["user_password"])) {
    $result = login($db, $_POST["user_id"], $_POST["user_password"]);
    if ($result) {
        http_response_code(201);
        $response["session_key"] = $result;
    } else {
        http_response_code(500);
        $response["error"] = "Error logging in.";
    }
} else {
    http_response_code(400);
    $response["error"] = "User ID and password are required.";
}

echo json_encode($response);
$db->close();

?>