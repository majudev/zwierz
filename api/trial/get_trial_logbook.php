<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
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
$sql = "SELECT time,log FROM trials_logbook WHERE `trialid`='".mysqli_real_escape_string($db, $login)."' ORDER BY time DESC";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","log":[';
	$row = mysqli_fetch_assoc($result);
	//$log = str_replace("\"", "\\\"", $row["log"]);
	$log = content_escape(strip_backslashes($row['log']));
	echo '{"date":"'.$row["time"].'","content":"'.$log.'"}';
	while($row = mysqli_fetch_assoc($result)){
		//$log = str_replace("\"", "\\\"", $row["log"]);
		$log = content_escape(strip_backslashes($row['log']));
		echo ',{"date":"'.$row["time"].'","content":"'.$log.'"}';
	}
	echo ']}';
} else {
	echo '{"status":"ok","log":[]}';
}
