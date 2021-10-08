<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
if(isset($_GET["all"]) || isset($_GET["archived"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] != "admin"){
		die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
	}
}
$login = $_SESSION["login"];
session_write_close();
if(!is_numeric($_GET["id"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}

$sql = "SELECT id FROM appointment_registrations WHERE `appointment_id`='".$_GET["id"]."'";
$result = mysqli_query($db, $sql);
$registrations = mysqli_num_rows($result);
if($registrations > 0){
	die('{"status":"error","details":"this appointment still has some registrations in it","code":"appointment_registrations_present"}');
}

$sql = "DELETE FROM `appointments` WHERE `id`='".mysqli_real_escape_string($db, $_GET["id"])."'";
if(mysqli_query($db, $sql)) echo '{"status":"ok"}';
else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';