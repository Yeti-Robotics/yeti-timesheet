<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["team_number"])) {
    $success = teamSignout($db, $_POST["team_number"], getSessionKey());
    if ($success) {
        http_response_code(201);
    } else {
        http_response_code(500);
        $response["error"] = "Error signing team out.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Team number is required.";
}

echo json_encode($response);
$db->close();

?>