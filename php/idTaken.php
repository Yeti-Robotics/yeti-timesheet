<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];
$taken = idTaken($db, $_POST["user_id"]);
if(is_bool($taken)) {
    $response["id_taken"] = $taken;
} else {
    http_response_code(500);
    $response["error"] = "Error checking if ID is taken.";
}

echo json_encode($response);
$db->close();

?>