<?php

include("connect.php");
include("functions.php");

header("Content-Type: application/json");

$response = [];

if (isset($_POST["user_number"]) && isset($_POST["user_name"])) {
	$response = addGuest($db, $_POST["user_number"], $_POST["user_name"], getSessionKey());
} else {
	http_response_code(400);
	$response["error"] = "Missing required fields.";
}

echo(json_encode($response));
$db->close();

?>