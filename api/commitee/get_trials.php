<?php
require_once(dirname(__FILE__)."/../../db.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"}');
}
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
	die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
}
$state = "FALSE";
if(isset($_GET["archived"])) $state = "TRUE";
$sql = "SELECT trials.login, users.name FROM trials INNER JOIN users ON trials.login = users.email WHERE `commitee` IS NULL AND `archived` = ".$state;
session_write_close();
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","trials":[';
	$prefix = false;
	while($row = mysqli_fetch_assoc($result)){
		if($prefix === false) $prefix = ',';
		else echo $prefix;
		
		echo '{"id":"'.$row["login"].'","name":"'.$row["name"].'"}';
	}
	echo ']}';
} else {
	echo '{"status":"ok","trials":[]}';
}