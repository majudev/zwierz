<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] != "admin"){
	die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
}
session_write_close();
if(!is_numeric($_GET["id"]) || !isset($_GET["login"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}

$sql = "DELETE FROM `appointment_registrations` WHERE `appointment_id`='".mysqli_real_escape_string($db, $_GET["id"])."' AND `login`='".mysqli_real_escape_string($db, $_GET["login"])."'";
if(mysqli_query($db, $sql)) echo '{"status":"ok"}';
else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';