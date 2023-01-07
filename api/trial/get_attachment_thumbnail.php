<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
if(!is_numeric($_GET["id"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$sql = "SELECT thumbnail FROM attachments WHERE `id`='".mysqli_real_escape_string($db, $_GET["id"])."'";
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
	$sql2 = "SELECT COUNT(*) as results FROM trials WHERE `trials`.`archived` = FALSE AND `trials`.`login` = '".mysqli_real_escape_string($db, $_GET["id"])."' AND `trials`.`mentor_email` = '".mysqli_real_escape_string($db, $_SESSION["login"])."'";
	$result2 = mysqli_query($db, $sql2);
	if(!$result2 || mysqli_num_rows($result2) <= 0 || mysqli_fetch_assoc($result2)["results"] == 0){
		$sql .= " AND `login`='".mysqli_real_escape_string($db, $login)."'";
	}
}
$result = mysqli_query($db, $sql);
if($result && mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	header('Content-Type: image/jpeg');
	echo $row["thumbnail"];
}else http_response_code(403);