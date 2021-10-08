<?php
require_once(dirname(__FILE__)."/../../db.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["id"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
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
		echo ',"open_date":'.$row["open_date"].'';
	}
	if(isset($row["projected_date"])){
		echo ',"projected_date":'.strtotime($row["projected_date"]).'';
	}
	if(isset($row["closed_date"])){
		echo ',"closed_date":'.$row["closed_date"].'';
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