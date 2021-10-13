<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
if(!verify_url_safeness($_GET["mentor_name"], '.ąćęłńóśżź -') || !verify_url_safeness($_GET["mentor_phone"], '- +') || !verify_url_safeness($_GET["mentor_email"], '@.-_') || !verify_url_safeness($_GET["projected_date"], ':- ')){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$sql = "SELECT login FROM trials WHERE `login`='".mysqli_real_escape_string($db, $_SESSION["login"])."'";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	$sql = "UPDATE `trials` SET `mentor_name`='".mysqli_real_escape_string($db, $_GET["mentor_name"])."', `mentor_email`='".mysqli_real_escape_string($db, $_GET["mentor_email"])."', `mentor_phone`='".mysqli_real_escape_string($db, $_GET["mentor_phone"])."', `projected_date`='".mysqli_real_escape_string($db, $_GET["projected_date"])."' WHERE `login`='".mysqli_real_escape_string($db, $login)."'";
	if(mysqli_query($db, $sql)){
		echo '{"status":"ok","stage":"UPDATE"}';
		
		$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', 'Kandydat edytował informacje o próbie.')";
		mysqli_query($db, $logbooksql);
	}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';
}else{
	$sql = "INSERT INTO `trials`(`login`, `mentor_name`, `mentor_email`, `mentor_phone`, `projected_date`) VALUES('".mysqli_real_escape_string($db, $login)."','".mysqli_real_escape_string($db, $_GET["mentor_name"])."','".mysqli_real_escape_string($db, $_GET["mentor_email"])."','".mysqli_real_escape_string($db, $_GET["mentor_phone"])."','".mysqli_real_escape_string($db, $_GET["projected_date"])."')";
	if(mysqli_query($db, $sql)){
		echo '{"status":"ok","stage":"INSERT"}';
		
		$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', 'Kandydat utworzył próbę w systemie.')";
		mysqli_query($db, $logbooksql);
	}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';
}