<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
if(!verify_url_safeness($_GET["finish_date"], ':- ')){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$content = content_escape($_GET["content"]);
$sql = "INSERT INTO `quests`(`login`, `content`, `finish_date`) VALUES('".mysqli_real_escape_string($db, $login)."','".mysqli_real_escape_string($db, $content)."','".mysqli_real_escape_string($db, $_GET["finish_date"])."')";
if (mysqli_query($db, $sql)){
	$sql = "SELECT id FROM `quests` WHERE `login`='".mysqli_real_escape_string($db, $login)."' AND `content`='".mysqli_real_escape_string($db, $content)."' AND `finish_date`='".mysqli_real_escape_string($db, $_GET["finish_date"])."'";
	$result = mysqli_query($db, $sql);
	if(mysqli_num_rows($result) > 0){
		$row = mysqli_fetch_assoc($result);
		echo '{"status":"ok","id":'.$row["id"].'}';
		
		$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', 'Kandydat dodał zadanie \"".mysqli_real_escape_string($db, $content)."\".')";
		mysqli_query($db, $logbooksql);
	}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';
}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';