<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
session_start();
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
if(!isset($_GET["archived"]) || !($_GET["archived"] == "true" || $_GET["archived"] == "false") || !isset($_GET["id"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] != "admin"){
	die('{"status":"error","details":"user doesn\'t have commitee permissions","code":"user_not_authorized"}');
}
$login = $_GET["id"];
session_write_close();
$archived = "TRUE";
if($_GET["archived"] == "false") $archived = "FALSE";
$sql = "UPDATE `trials` SET `archived`=".$archived." WHERE `login`='".mysqli_real_escape_string($db, $login)."'";
if(mysqli_query($db, $sql)) echo '{"status":"ok"}';
else echo '{"status":"error","details":"MySQL operation failed: '.mysqli_error($db).'","code":"mysql_fail"}';

