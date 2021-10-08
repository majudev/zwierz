<?php if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) die();
$config = array();

$config["page_name"] = "Zwierz";
$config["version"] = "0.1-beta";

$config["base_url"] = "/zwierz";

$config["session_timeout_long"] = 604800;
$config["session_timeout_standard"] = 3600;

$config["db"] = array();
$config["db"]["host"] = "localhost";
$config["db"]["port"] = 3306;
$config["db"]["database"] = "zwierz";
$config["db"]["username"] = "zwierz";
$config["db"]["password"] = "zwierz123";

$config["activation_mail"] = array();
$config["activation_mail"]["subject"] = "Potwiedź swoje konto";
$config["activation_mail"]["body"] = "Potwiedź swoje konto, klikając w <a href=\"%ACTIVATION_LINK%\">link</a>.";