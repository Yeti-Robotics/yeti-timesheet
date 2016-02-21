<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["old_password"]) && isset($_POST["new_password"]) && isset($_POST["new_password_confirm"])
    && $_POST["new_password"] == $_POST["new_password_confirm"]) {
    $success = changePassword($db, $_POST["old_password"], $_POST["new_password"], getSessionKey());
    if ($success) {
        http_response_code(200);
    } else {
        http_response_code(500);
        $response["error"] = "Error updating password.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing required information.";
}

echo json_encode($response);
$db->close();

?>