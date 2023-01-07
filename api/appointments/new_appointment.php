<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] != "admin"){
	die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
}
session_write_close();
if(!isset($_GET["date"]) || !isset($_GET["time"]) || !isset($_GET["max_candidates"]) || !is_numeric($_GET["date"]) || !is_numeric($_GET["max_candidates"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$date = date("Y-m-d H:i:s", $_GET["date"]);
$sql = "INSERT INTO `appointments`(`date`, `time`, `total_candidates`) VALUES('".mysqli_real_escape_string($db, $date)."','".mysqli_real_escape_string($db, $_GET["time"])."','".mysqli_real_escape_string($db, $_GET["max_candidates"])."')";
if (mysqli_query($db, $sql)){
	echo '{"status":"ok"}';
}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';