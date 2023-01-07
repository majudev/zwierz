<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["id"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		$sql = "SELECT COUNT(*) as results FROM trials WHERE `trials`.`archived` = FALSE AND `trials`.`login` = '".mysqli_real_escape_string($db, $_GET["id"])."' AND `trials`.`mentor_email` = '".mysqli_real_escape_string($db, $_SESSION["login"])."'";
		$result = mysqli_query($db, $sql);
		if(!$result || mysqli_num_rows($result) <= 0 || mysqli_fetch_assoc($result)["results"] == 0){
			die('{"status":"error","details":"user doesn\'t have permissions","code":"user_not_authorized"}');
		}
	}
	$login = $_GET["id"];
}
session_write_close();
$sql = "SELECT * FROM trials WHERE `login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	echo '{"status":"ok","trial":{"exists":true';
	if(isset($row["open_date"])){
		echo ',"open_date":'.strtotime($row["open_date"]).'';
	}
	if(isset($row["projected_date"])){
		echo ',"projected_date":'.strtotime($row["projected_date"]).'';
	}
	if(isset($row["closed_date"])){
		echo ',"closed_date":'.strtotime($row["closed_date"]).'';
	}
	if(isset($row["open_document"])){
		echo ',"open_document":"'.$row["open_document"].'"';
	}
	if(isset($row["closing_document"])){
		echo ',"closing_document":"'.$row["closing_document"].'"';
	}
	echo ',"mentor_name":"'.$row["mentor_name"].'"';
	echo ',"mentor_phone":"'.$row["mentor_phone"].'"';
	echo ',"mentor_email":"'.$row["mentor_email"].'"';
	echo ',"archived":'.$row["archived"].'';
	echo '}}';
} else {
	echo '{"status":"ok","trial":{"exists":false}}';
}