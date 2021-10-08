<?php
require_once(dirname(__FILE__)."/config.php");
session_start();
if(!isset($_SESSION["login"])){
  header("Location: ".$config["base_url"]."/user/login.php");
}else if(isset($_SESSION["commitee"])){
  header("Location: ".$config["base_url"]."/commitee");
}else if(isset($_SESSION["admin"]) && $_SESSION["admin"]){
  header("Location: ".$config["base_url"]."/admin");
}else{
  header("Location: ".$config["base_url"]."/profile");
}