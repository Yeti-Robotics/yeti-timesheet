<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["user_name"]) && isset($_POST["team_number"]) && isset($_POST["user_email"])
    && isset($_POST["user_password"]) && isset($_POST["user_mentor"])) {
    $userNumber = 0;
    if (isset($_POST["user_number"])) {
        $userNumber = $_POST["user_number"];
    }
    if (strlen($_POST["user_password"]) < 2) {
        http_response_code(400);
        $response["error"] = "Password must contain multiple characters.";
    } else {
        $success = addUser($db, $userNumber, $_POST["user_name"], $_POST["team_number"],
                           $_POST["user_email"], $_POST["user_password"], 0, $_POST["user_mentor"]);
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