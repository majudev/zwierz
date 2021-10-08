<?php
require_once(dirname(__FILE__)."/../../db.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["id"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
	}
	$login = $_GET["id"];
}
session_write_close();
$sql = "SELECT * FROM users WHERE `email`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	$interests = $row["interests"];
	if($interests == null || $interests == "") $interests = "[]";
	echo '{"status":"ok","profile":{"name":"'.$row["name"].'","phone":"'.$row["phone"].'","team":"'.$row["team"].'","function":"'.$row["function"].'","interests":'.$interests.'}}';
} else {
	echo '{"status":"ok","profile":{"name":"","phone":"","team":"","function":"","interests":[]}}';
}