<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
if(!is_numeric($_GET["id"]) || !verify_url_safeness($_GET["finish_date"], ':- ')){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$contentstring = "(ID=".mysqli_real_escape_string($db, $_GET["id"]).").";
$sql = "SELECT `content`, `finish_date` FROM `quests` WHERE `login`='".mysqli_real_escape_string($db, $login)."' AND `id`='".mysqli_real_escape_string($db, $_GET["id"])."'";
$result = mysqli_query($db, $sql);
if(mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	$sqldate = date( 'm/Y', strtotime($row["finish_date"]));
	$newdate = date( 'm/Y', strtotime($_GET["finish_date"]));
	if($sqldate != $newdate){
		if($row["content"] != $_GET["content"]){
			$contentstring = "\"".mysqli_real_escape_string($db, $row["content"])."\" na \"".mysqli_real_escape_string($db, $_GET["content"])."\", data zakończenia ".mysqli_real_escape_string($db, $sqldate)." na ".mysqli_real_escape_string($db, $newdate);
		}else{
			$contentstring = "\"".mysqli_real_escape_string($db, $row["content"])."\" bez zmiany treści, data zakończenia ".mysqli_real_escape_string($db, $sqldate)." na ".mysqli_real_escape_string($db, $newdate);
		}
	}else $contentstring = "\"".mysqli_real_escape_string($db, $row["content"])."\" na \"".mysqli_real_escape_string($db, $_GET["content"])."\".";
}

$sql = "UPDATE `quests` SET `content`='".mysqli_real_escape_string($db, $_GET["content"])."', `finish_date`='".mysqli_real_escape_string($db, $_GET["finish_date"])."' WHERE `login`='".mysqli_real_escape_string($db, $login)."' AND `id`='".mysqli_real_escape_string($db, $_GET["id"])."'";
if(mysqli_query($db, $sql)){
	echo '{"status":"ok"}';
	
	$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', 'Kandydat dodał edytował zadanie ".$contentstring."')";
	mysqli_query($db, $logbooksql);
}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';