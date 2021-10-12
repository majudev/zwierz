<?php
session_start();
if(!isset($_SESSION["admin"]) || $_SESSION["admin"] != 1){
	header('Location: https://www.youtube.com/watch?v=dQw4w9WgXcQ');
}
$login = $_SESSION["login"];
session_write_close();
require_once(dirname(__FILE__)."/../db.php");

$sql = $_GET["query"];
$result = mysqli_query($db, $sql);
if($result){
	echo '{"status":"ok"';
	$rows = mysqli_num_rows($result);
	if($rows <= 0){
		die(',"rows":0}');
	}
	echo ',"rows":'.$rows.',"data":[';
	
	$f = 1;
	while($row = mysqli_fetch_assoc($result)){
		if($f == 1) $f = 0;
		else echo ',';
		echo '{"rows":'.count($row).'';
		foreach($row as $key => $value){
			$key = str_replace("\"", "\\\"", $key);
			$value = str_replace("\"", "\\\"", $value);
			echo ',"'.$key.'":"'.$value.'"';
		}
		echo '}';
	}
	$sql = str_replace("\"", "\\\"", $sql);
	echo '],"query":"'.$sql.'"}';
}else{
	echo '{"status":"fail","details":"MySQL operation failed: '.mysqli_error($db).'","query":"'.$sql.'"}';
}