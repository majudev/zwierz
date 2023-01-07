<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["all"]) || isset($_GET["archived"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
	}
}
session_write_close();
$sql = "SELECT * FROM appointments WHERE `date` >= DATE(NOW())";
if(isset($_GET["all"]) && isset($_GET["archived"])) $sql = "SELECT * FROM appointments WHERE `date` < DATE(NOW())";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","appointments":[';
	$row = mysqli_fetch_assoc($result);

	$sql = "SELECT login,name,intent FROM appointment_registrations INNER JOIN users ON appointment_registrations.login = users.email WHERE `appointment_id`='".mysqli_real_escape_string($db, $row["id"])."'";
	$registered_result = mysqli_query($db, $sql);
	if(!isset($_GET["all"])){
		$registered = "false";
		$registrations = mysqli_num_rows($registered_result);
		if($registrations > 0)
			while($appointment_row = mysqli_fetch_assoc($registered_result))
				if($appointment_row["login"] === $login)
					$registered = true;

		echo '{"id":'.$row["id"].',"time":"'.$row["time"].'","date":'.strtotime($row["date"]).',"total_candidates":'.$row["total_candidates"].',"registered_candidates":'.$registrations.',"registered":'.$registered.'}';
		while($row = mysqli_fetch_assoc($result)){
			$sql = "SELECT login,name,intent FROM appointment_registrations INNER JOIN users ON appointment_registrations.login = users.email WHERE `appointment_id`='".mysqli_real_escape_string($db, $row["id"])."'";
			$registered_result = mysqli_query($db, $sql);
			$registered = "false";
			$registrations = mysqli_num_rows($registered_result);
			if($registrations > 0)
				while($appointment_row = mysqli_fetch_assoc($registered_result))
					if($appointment_row["login"] === $login)
						$registered = true;
			echo ',{"id":'.$row["id"].',"time":"'.$row["time"].'","date":'.strtotime($row["date"]).',"total_candidates":'.$row["total_candidates"].',"registered_candidates":'.$registrations.',"registered":'.$registered.'}';
		}
		echo ']}';
	}else{
		$registered = "";
		$registrations = mysqli_num_rows($registered_result);
		if($registrations > 0){
			$appointment_row = mysqli_fetch_assoc($registered_result);
			$registered = '{"login":"'.$appointment_row["login"].'","name":"'.$appointment_row["name"].'","intent":"'.$appointment_row["intent"].'"}';
			while($appointment_row = mysqli_fetch_assoc($registered_result)){
				$registered = $registered.',{"login":"'.$appointment_row["login"].'","name":"'.$appointment_row["name"].'","intent":"'.$appointment_row["intent"].'"}';
			}
		}

		echo '{"id":'.$row["id"].',"time":"'.$row["time"].'","date":'.strtotime($row["date"]).',"total_candidates":'.$row["total_candidates"].',"registered_candidates":'.$registrations.',"registered":['.$registered.']}';
		while($row = mysqli_fetch_assoc($result)){
			$sql = "SELECT login,name,intent FROM appointment_registrations INNER JOIN users ON appointment_registrations.login = users.email WHERE `appointment_id`='".mysqli_real_escape_string($db, $row["id"])."'";
			$registered_result = mysqli_query($db, $sql);
			$registered = "";
			$registrations = mysqli_num_rows($registered_result);
			if($registrations > 0){
				$appointment_row = mysqli_fetch_assoc($registered_result);
				$registered = '{"login":"'.$appointment_row["login"].'","name":"'.$appointment_row["name"].'","intent":"'.$appointment_row["intent"].'"}';
				while($appointment_row = mysqli_fetch_assoc($registered_result)){
					$registered = $registered.',{"login":"'.$appointment_row["login"].'","name":"'.$appointment_row["name"].'","intent":"'.$appointment_row["intent"].'"}';
				}
			}
			
			echo ',{"id":'.$row["id"].',"time":"'.$row["time"].'","date":'.strtotime($row["date"]).',"total_candidates":'.$row["total_candidates"].',"registered_candidates":'.$registrations.',"registered":['.$registered.']}';
		}
		echo ']}';
	}
} else {
	echo '{"status":"ok","appointments":[]}';
}