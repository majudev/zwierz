<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
if(!isset($_SESSION["login"])){
	die('LOGGED-OUT');
}
die($_SESSION["login"]);
