<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
if(!is_numeric($_GET["id"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$sql = "DELETE FROM `attachments` WHERE `login`='".mysqli_real_escape_string($db, $login)."' AND `id`='".mysqli_real_escape_string($db, $_GET["id"])."' RETURNING name";
$result = mysqli_query($db, $sql);
if($result){
	echo '{"status":"ok"}';

	$identitystring = ". (ID=".mysqli_real_escape_string($db, $_GET["id"]).")";
	if(mysqli_num_rows($result) > 0){
		$row = mysqli_fetch_assoc($result);
		$identitystring = ' "'.mysqli_real_escape_string($db, $row["name"]).'".';
	}
	
	$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', 'Kandydat usunął załącznik".$identitystring."')";
	mysqli_query($db, $logbooksql);
}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';