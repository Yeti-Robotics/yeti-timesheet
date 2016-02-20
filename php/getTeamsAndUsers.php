<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$teams = getTeamsAndUsers($db, getSessionKey());
if(is_array($teams)) {
    $response['teams'] = $teams;
} else {
    http_response_code(500);
    $response["error"] = "Error retreiving teams.";
}

echo json_encode($response);
$db->close();

?>