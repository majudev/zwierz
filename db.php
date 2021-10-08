<?php if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) die();
require_once(dirname(__FILE__)."/config.php");

$db = mysqli_connect($config["db"]["host"].":".$config["db"]["port"], $config["db"]["username"], $config["db"]["password"], $config["db"]["database"]);

if(!$db){
	die("MySQL error: " . mysqli_connect_error());
}
if(!mysqli_set_charset($db, "utf8mb4")){
	die("MySQL charset error: " . mysqli_error());
}
