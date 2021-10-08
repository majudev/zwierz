<?php
require_once(dirname(__FILE__)."/../config.php");
session_start();
if(isset($_SESSION["login"]) && isset($_SESSION["commitee"])){
  header("Location: ".$config["base_url"]."/commitee/trials");
}else{
  header("Location: ".$config["base_url"]);
}