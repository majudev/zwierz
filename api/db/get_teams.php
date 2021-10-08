<?php
require_once(dirname(__FILE__)."/../../db.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$sql = "SELECT * FROM `teams`";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	$name = $row["name"];
	$name = str_replace("\"", "\\\"", $name);
	echo '{"status":"ok","teams":["'.$name.'"';
	while($row = mysqli_fetch_assoc($result)){
		$name = $row["name"];
		$name = str_replace("\"", "\\\"", $name);
		echo ',"'.$name.'"';
	}
	echo ']}';
} else {
	echo '{"status":"ok","teams":[]}';
}
