<?php
session_start();
require_once(dirname(__FILE__)."/../../config.php");
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
$referer_uri = isset($_SERVER["HTTP_REFERER"]) ? parse_url($_SERVER["HTTP_REFERER"]) : false;

if(isset($_POST["email"]) && ((isset($_POST["captcha"]) && validate($_POST["email"], $_POST["captcha"]) || $_SESSION["admin"] == 1))){
	if($_POST["captcha"] == $_SESSION["captcha"] || $_SESSION["admin"] == 1){
		if(isset($_SESSION["captcha"])) unset($_SESSION["captcha"]);
		$sql = "SELECT activationkey FROM users WHERE `email`='".mysqli_real_escape_string($db, $_POST["email"])."' AND `active` = FALSE";
		$result = mysqli_query($db, $sql);
		if($result && mysqli_num_rows($result) > 0){ //search if user already registered
			$user = mysqli_fetch_assoc($result);
			$activation_key = $user["activationkey"];
			send_mail($_POST["email"], $config["activation_mail"]["subject"], str_replace("%ACTIVATION_LINK%", "https://".$_SERVER["HTTP_HOST"].$config["base_url"]."/api/user/activate.php?ui=yes&confirmation=".$activation_key, $config["activation_mail"]["body"]));
			if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/resend_activation.php"){
				header("Location: ".$config["base_url"]."/user/resend_activation.php?success=yes");
				die();
			}else{
				die("OK");
			}
		}else{
			if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/resend_activation.php"){
				header("Location: ".$config["base_url"]."/user/register.php?error=".urlencode("Nie masz tu konta. Możesz założyć je teraz"));
				die();
			}else{
				die("NO ACCOUNT OR ACTIVE");
			}
		}
	}else{
		unset($_SESSION["captcha"]);
		if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/resend_activation.php"){
			header("Location: ".$config["base_url"]."/user/resend_activation.php?error=".urlencode("Nie umiesz liczyć?"));
			die();
		}else{
			die("CAPTCHA FAIL");
		}
	}
}

if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/resend_activation.php"){
	header("Location: ".$config["base_url"]."/user/resend_activation.php?error=".urlencode("Spróbuj jeszcze raz"));
	die();
}else{
	die("FAIL");
}

function validate($email, $captcha){
	if(strlen($email) > 50) return false;
	if(strlen($captcha) > 5) return false;
	if(!verify_url_safeness($email, '.@')) return false;
	if(!is_numeric($captcha)) return false;
	return true;
}