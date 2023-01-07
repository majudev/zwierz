<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"}');
}
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
	die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
}
$state = "FALSE";
if(isset($_GET["archived"])) $state = "TRUE";
$sql = "SELECT trials.login, users.name, 1-ISNULL(trials.open_date) as is_open, 1-ISNULL(trials.closed_date) as is_closed FROM trials INNER JOIN users ON trials.login = users.email WHERE `commitee` IS NULL AND `archived` = ".$state;
session_write_close();
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","trials":[';
	$prefix = false;
	while($row = mysqli_fetch_assoc($result)){
		if($prefix === false) $prefix = ',';
		else echo $prefix;
		
		echo '{"id":"'.$row["login"].'","name":"'.$row["name"].'","is_open":'.$row["is_open"].',"is_closed":'.$row["is_closed"].'}';
	}
	echo ']}';
} else {
	echo '{"status":"ok","trials":[]}';
}