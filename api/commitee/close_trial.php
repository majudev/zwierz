<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
	die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
}
session_write_close();
if(!isset($_GET["id"]) || !verify_url_safeness($_GET["date"], ':-/ ')){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$login = $_GET["id"];

if($_GET["date"] === 'NULL') $date = 'NULL';
else $date = "'".mysqli_real_escape_string($db, date('Y-m-d 00:00:00', strtotime($_GET["date"])))."'";

$sql = "UPDATE `trials` SET `closed_date`=".$date." WHERE `open_date` IS NOT NULL AND `login`='".mysqli_real_escape_string($db, $login)."'";
if(mysqli_query($db, $sql)){
	echo '{"status":"ok","stage":"UPDATE"}';
}else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';