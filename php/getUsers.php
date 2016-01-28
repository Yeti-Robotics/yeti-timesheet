<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$teamNumber = null;
if (isset($_POST['team_number'])) {
    $teamNumber = $_POST['team_number'];
}
$users = getUsers($db, $teamNumber);
if(is_array($users)) {
    $response['users'] = $users;
} else {
    http_response_code(500);
    $response["error"] = "Error retreiving users.";
}

echo json_encode($response);
$db->close();

?>