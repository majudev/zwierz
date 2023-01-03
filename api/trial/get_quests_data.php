<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["id"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		$sql = "SELECT COUNT(*) as results FROM trials WHERE `trials`.`archived` = FALSE AND `trials`.`login` = '".mysqli_real_escape_string($db, $_GET["id"])."' AND `trials`.`mentor_email` = '".mysqli_real_escape_string($db, $_SESSION["login"])."'";
		$result = mysqli_query($db, $sql);
		if(!$result || mysqli_num_rows($result) <= 0 || mysqli_fetch_assoc($result)["results"] == 0){
			die('{"status":"error","details":"user doesn\'t have permissions","code":"user_not_authorized"}');
		}
	}
	$login = $_GET["id"];
}
session_write_close();
$sql = "SELECT * FROM quests WHERE `login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","quests":[';
	$row = mysqli_fetch_assoc($result);
	$content = content_escape(strip_backslashes($row["content"]));
	//$content = str_replace("\"", "\\\"", $content);
	echo '{"id":'.$row["id"].',"content":"'.$content.'","finish_date":'.strtotime($row["finish_date"]).'}';
	while($row = mysqli_fetch_assoc($result)){
		$content = content_escape(strip_backslashes($row["content"]));
		//$content = str_replace("\"", "\\\"", $content);
		echo ',{"id":'.$row["id"].',"content":"'.$content.'","finish_date":'.strtotime($row["finish_date"]).'}';
	}
	echo ']}';
} else {
	echo '{"status":"ok","quests":[]}';
}