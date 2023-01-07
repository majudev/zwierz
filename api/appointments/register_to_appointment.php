<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
if(!is_numeric($_GET["id"]) || !isset($_GET["intent"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$sql = "INSERT INTO `appointment_registrations`(`login`, `appointment_id`, `intent`) VALUES('".mysqli_real_escape_string($db, $login)."','".mysqli_real_escape_string($db, $_GET["id"])."','".mysqli_real_escape_string($db, $_GET["intent"])."')";
if (mysqli_query($db, $sql)){
	echo '{"status":"ok"}';
	
	$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', 'Kandydat zarejestrował się na spotkanie w celu \"".mysqli_real_escape_string($db, $_GET["intent"])."\". (ID spotkania=\"".mysqli_real_escape_string($db, $_GET["id"])."\")')";
	mysqli_query($db, $logbooksql);
}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';