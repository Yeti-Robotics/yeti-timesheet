<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$filterNames = ["user_name", "user_id", "team_name", "team_number", "time_limit", "num_limit"];
$filters = [];
$hasFilters = false;
for ($i = 0; $i < count($filterNames); $i++) {
    $filterName = $filterNames[$i];
    if (isset($_POST[$filterName]) && $_POST[$filterName] != "") {
        $filters[$filterName] = $_POST[$filterName];
        $hasFilters = true;
    } else {
        $filters[$filterName] = null;
    }
}
$logs = [];
if ($hasFilters) {
    $logs = getTimelogs($db, $filters, getSessionKey());
}
if(is_array($logs)) {
    $response['timelogs'] = $logs;
} else {
    http_response_code(500);
    $response["error"] = "Error retreiving timelogs.";
}

echo json_encode($response);
$db->close();

?>