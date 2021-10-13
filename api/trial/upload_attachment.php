<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
if(!isset($_FILES["file"]) || !verify_url_safeness($_POST["title"], 'ąćęłńóśżź -"')){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
if($_FILES['file']['error'] != UPLOAD_ERR_OK){
	die('{"status":"error","details":"error occured while uploading the file: "'.$_FILES['uploadedfile']['error'].',"code":"upload_error"}');
}
if(!is_uploaded_file($_FILES['file']['tmp_name'])){
	die('{"status":"error","details":"error occured while uploading the file: "'.$_FILES['uploadedfile']['error'].',"code":"bad_request"}');
}
$file_content = file_get_contents($_FILES['file']['tmp_name']);
$extension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
$sql = "INSERT INTO `attachments`(`login`,`name`,`content`,`extension`) VALUES('".mysqli_real_escape_string($db, $login)."','".mysqli_real_escape_string($db, $_POST["title"])."','".mysqli_real_escape_string($db, $file_content)."','".mysqli_real_escape_string($db, $extension)."')";
if(mysqli_query($db, $sql)) echo '{"status":"ok"}';
else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';

$logbooksql = "INSERT INTO `trials_logbook`(`trialid`, `log`) values('".mysqli_real_escape_string($db, $_SESSION["login"])."', 'Kandydat wysłał załącznik \"".mysqli_real_escape_string($db, $_POST["title"])."\".')";
mysqli_query($db, $logbooksql);