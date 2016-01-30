<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$logs = getLastTimelogs($db, 5, getSessionKey());
if(is_array($logs)) {
    $response['timelogs'] = $logs;
} else {
    http_response_code(500);
    $response["error"] = "Error retreiving timelogs.";
}

echo json_encode($response);
$db->close();

?>