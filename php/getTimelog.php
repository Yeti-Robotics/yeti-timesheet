<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_GET["timelog_id"])) {
    $result = getTimelog($db, $_GET["timelog_id"], getSessionKey());
    if ($result) {
        $response["timelog"] = $result;
    } else {
        http_response_code(500);
        $response["error"] = "Error getting timelog information.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Timelog ID is required.";
}

echo json_encode($response);
$db->close();

?>