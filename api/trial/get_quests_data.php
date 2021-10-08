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
$sql = "SELECT * FROM quests WHERE `login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","quests":[';
	$row = mysqli_fetch_assoc($result);
	echo '{"id":'.$row["id"].',"content":"'.$row["content"].'","finish_date":'.strtotime($row["finish_date"]).'}';
	while($row = mysqli_fetch_assoc($result)){
		echo ',{"id":'.$row["id"].',"content":"'.$row["content"].'","finish_date":'.strtotime($row["finish_date"]).'}';
	}
	echo ']}';
} else {
	echo '{"status":"ok","quests":[]}';
}