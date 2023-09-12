<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
	die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
}
session_write_close();
if(!isset($_GET["id"])){
	die('{"status":"error","details":"please provide an id","code":"bad_request"}');
}
$login = $_GET["id"];

if($_GET["date"] === 'NULL') $date = 'NULL';
else $date = "'".mysqli_real_escape_string($db, date('Y-m-d 00:00:00', strtotime($_GET["date"])))."'";

$sql = "UPDATE `trials` SET `open_date`=".$date." WHERE `closed_date` IS NULL AND `login`='".mysqli_real_escape_string($db, $login)."'";
if(mysqli_query($db, $sql)){
	echo '{"status":"ok","stage":"UPDATE"}';
}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';