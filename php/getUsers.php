<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$teamNumber = null;
if (isset($_GET['team_number'])) {
    $teamNumber = $_GET['team_number'];
}
$users = getUsers($db, $teamNumber, getSessionKey());
if(is_array($users)) {
    $response['users'] = $users;
} else {
    http_response_code(500);
    $response["error"] = "Error retreiving users.";
}

echo json_encode($response);
$db->close();

?>