<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["user_name"])
    && isset($_POST["user_password"]) && isset($_POST["user_password_confirm"])
    && $_POST["user_password"] == $_POST["user_password_confirm"] && isset($_POST["user_number"])) {
    if (strlen($_POST["user_password"]) < 2) {
        http_response_code(400);
        $response["error"] = "Password must contain multiple characters.";
    } else {
        $userEmail = null;
        if (isset($_POST["user_email"])) {
            $userEmail = $_POST["user_email"];
        }
        $success = addUser($db, $_POST["user_number"], $_POST["user_name"],
                           $userEmail, $_POST["user_password"], isset($_POST["user_mentor"]), 0,
                            getSessionKey());
        if ($success) {
            http_response_code(201);
        } else {
            http_response_code(500);
            $response["error"] = "Error adding user.";
        }
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing required fields.";
}

echo json_encode($response);
$db->close();

?>
