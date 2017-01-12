<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_GET["searchTerm"])) {
    $result = searchGuests($db, $_GET["searchTerm"], getSessionKey());
    if (is_array($result)) {
        $response["users"] = $result;
    } else {
        http_response_code(500);
        $response["error"] = "Error getting guests.";
    }
} else {
    http_response_code(400);
    $response["error"] = "Missing necessary information.";
}

echo json_encode($response);
$db->close();

?>