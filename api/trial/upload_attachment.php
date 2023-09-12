<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["id"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] != "admin"){
		die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
	}
	$login = $_GET["id"];
}
session_write_close();
if(!isset($_FILES["file"])){
	die('{"status":"error","details":"no file attached to this request","code":"no_file"}');
}
if(!isset($_POST["title"])){
	die('{"status":"error","details":"please provide filename","code":"bad_request"}');
}
if($_FILES['file']['error'] != UPLOAD_ERR_OK){
	die('{"status":"error","details":"error occured while uploading the file: "'.$_FILES['uploadedfile']['error'].',"code":"upload_error"}');
}
if(!is_uploaded_file($_FILES['file']['tmp_name'])){
	die('{"status":"error","details":"error occured while uploading the file: "'.$_FILES['uploadedfile']['error'].',"code":"bad_request"}');
}
$file_content = file_get_contents($_FILES['file']['tmp_name']);
$filename = $_POST["title"];
$extension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
if(!isset($filename) || $filename == "") $filename = substr($_FILES["file"]['name'], 0, (-1)*(strlen($extension)+1));
$thumbnail = generateThumbnail($_FILES['file']['tmp_name'], 300, 300);
if($thumbnail != null) $thumbnail = "'".mysqli_real_escape_string($db, $thumbnail)."'";
else $thumbnail = 'NULL';

$sql = "INSERT INTO `attachments`(`login`,`name`,`content`,`extension`,`thumbnail`) VALUES('".mysqli_real_escape_string($db, $login)."','".mysqli_real_escape_string($db, $filename)."','".mysqli_real_escape_string($db, $file_content)."','".mysqli_real_escape_string($db, $extension)."',".$thumbnail.")";
if(mysqli_query($db, $sql)) echo '{"status":"ok"}';
else die('{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}');

$person = 'Kandydat';
if(isset($_GET["id"])) $person = 'Sekretarz kapituły';
$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', '".$person." wysłał załącznik \"".mysqli_real_escape_string($db, $filename)."\".')";
mysqli_query($db, $logbooksql);
