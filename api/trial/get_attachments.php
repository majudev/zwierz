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
$sql = "SELECT id,name,created_at,extension FROM attachments WHERE `login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","attachments":[';
	$row = mysqli_fetch_assoc($result);
	echo '{"id":'.$row["id"].',"title":"'.$row["name"].'","creation_date":'.strtotime($row["created_at"]).',"extension":"'.$row["extension"].'"}';
	while($row = mysqli_fetch_assoc($result)){
		echo ',{"id":'.$row["id"].',"title":"'.$row["name"].'","creation_date":'.strtotime($row["created_at"]).',"extension":"'.$row["extension"].'"}';
	}
	echo ']}';
} else {
	echo '{"status":"ok","attachments":[]}';
}