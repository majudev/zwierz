<?php
require_once(dirname(__FILE__)."/../../db.php");
session_start();
if(!isset($_SESSION["login"])){
	die('LOGGED-OUT');
}
die($_SESSION["login"]);
