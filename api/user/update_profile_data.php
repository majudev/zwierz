<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
session_write_close();
//if(!verify_url_safeness($_GET["name"], '.ąćęłńóśżź -') || !verify_url_safeness($_GET["phone"], '- +') || !verify_url_safeness($_GET["team"], ' .,-ąćęłńóśżź') || !verify_url_safeness($_GET["function"], ' .,ąćęłńóśżź') || !verify_url_safeness($_GET["interests"], ' .ąćęłńóśżź-"[,+')){
//	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
//}
$sql = "UPDATE users SET `name`='".mysqli_real_escape_string($db, $_GET["name"])."', `phone`='".mysqli_real_escape_string($db, $_GET["phone"])."', `team`='".mysqli_real_escape_string($db, $_GET["team"])."', `function`='".mysqli_real_escape_string($db, $_GET["function"])."', `interests`='".mysqli_real_escape_string($db, $_GET["interests"])."' WHERE `email`='".mysqli_real_escape_string($db, $login)."'";
if(mysqli_query($db, $sql)) echo '{"status":"ok"}';
else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';