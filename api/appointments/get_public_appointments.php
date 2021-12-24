<?php
require_once(dirname(__FILE__)."/../../db.php");

$sql = "SELECT * FROM appointments WHERE `date` >= DATE(NOW())";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	echo '{"status":"ok","appointments":[';
	$row = mysqli_fetch_assoc($result);

	$sql = "SELECT login,name,intent FROM appointment_registrations INNER JOIN users ON appointment_registrations.login = users.email WHERE `appointment_id`='".mysqli_real_escape_string($db, $row["id"])."'";
	$registered_result = mysqli_query($db, $sql);
	$registrations = mysqli_num_rows($registered_result);

	echo '{"id":'.$row["id"].',"time":"'.$row["time"].'","date":'.strtotime($row["date"]).',"total_candidates":'.$row["total_candidates"].',"registered_candidates":'.$registrations.'}';
	while($row = mysqli_fetch_assoc($result)){
		$sql = "SELECT login,name,intent FROM appointment_registrations INNER JOIN users ON appointment_registrations.login = users.email WHERE `appointment_id`='".mysqli_real_escape_string($db, $row["id"])."'";
		$registered_result = mysqli_query($db, $sql);
		$registrations = mysqli_num_rows($registered_result);
		echo ',{"id":'.$row["id"].',"time":"'.$row["time"].'","date":'.strtotime($row["date"]).',"total_candidates":'.$row["total_candidates"].',"registered_candidates":'.$registrations.'}';
	}
	echo ']}';
} else {
	echo '{"status":"ok","appointments":[]}';
}