<?php
namespace Shanept;
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
require_once(dirname(__FILE__)."/../../MimeReader.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["trialid"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		$sql = "SELECT COUNT(*) as results FROM trials WHERE `trials`.`archived` = FALSE AND `trials`.`login` = '".mysqli_real_escape_string($db, $_GET["id"])."' AND `trials`.`mentor_email` = '".mysqli_real_escape_string($db, $_SESSION["login"])."'";
		$result = mysqli_query($db, $sql);
		if(!$result || mysqli_num_rows($result) <= 0 || mysqli_fetch_assoc($result)["results"] == 0){
			die('{"status":"error","details":"user doesn\'t have permissions","code":"user_not_authorized"}');
		}
	}
	$login = $_GET["trialid"];
}
session_write_close();
if(!is_numeric($_GET["id"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$sql = "SELECT content,name,extension FROM attachments WHERE `id`='".mysqli_real_escape_string($db, $_GET["id"])."' AND `login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if(mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	$content = $row["content"];
	$mime = new MimeReader($content);
	$type = $mime->getType();
	header('Content-Type: '.$type);
	$filename = $row["name"].".".$row["extension"];
	header('Content-Disposition: attachment; filename="'.$filename.'"');
	echo $row["content"];
}else http_response_code(404);