<?php require_once(dirname(__FILE__)."/../../config.php");
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
$referer_uri = isset($_SERVER["HTTP_REFERER"]) ? parse_url($_SERVER["HTTP_REFERER"]) : false;

if(isset($_POST["email"]) && isset($_POST["password"]) && isset($_POST["captcha"]) && validate($_POST["email"], $_POST["password"], $_POST["captcha"])){
	session_start();
	if($_POST["captcha"] == $_SESSION["captcha"]){
		unset($_SESSION["captcha"]);
		$sql = "SELECT active FROM users WHERE `email`='".mysqli_real_escape_string($db, $_POST["email"])."'";
		$result = mysqli_query($db, $sql);
		if($result && mysqli_num_rows($result) > 0){ //search if user already registered
			if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/register.php"){
				header("Location: ".$config["base_url"]."/user/register.php?error=".urlencode("Masz już konto..."));
				die();
			}else{
				die("ALREADY REGISTERED");
			}
		}else{
			$activation_key = generate_random_string(64);
			$sql = "INSERT INTO users(email, password, activationkey) VALUES ('".mysqli_real_escape_string($db, $_POST["email"])."', '".hashpassword($_POST["password"])."','".$activation_key."')";
			//if(send_mail($_POST["email"], $config["activation_mail"]["subject"], str_replace("%ACTIVATION_LINK%", (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]."/api/user/activate.php?ui=yes&confirmation=".$activation_key, $config["activation_mail"]["body"])) && mysqli_query($db, $sql)){ //add user to the database
			$mailresult = send_mail(array($_POST["email"]), NULL, array(), $config["activation_mail"]["subject"], str_replace("%ACTIVATION_LINK%", (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]."/api/user/activate.php?ui=yes&confirmation=".$activation_key, $config["activation_mail"]["body"]));
			if($mailresult === 1 && mysqli_query($db, $sql)){ //add user to the database
				if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/register.php"){
					header("Location: ".$config["base_url"]."/user/register.php?success=yes");
					die();
				}else{
					die("OK");
				}
			}else{
				if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/register.php"){
					header("Location: ".$config["base_url"]."/user/register.php?error=".urlencode("Błąd wewnętrzny. Przepraszamy.\n".mysqli_error($db)));
					die();
				}else{
					die("ALREADY REGISTERED");
				}
			}
		}
	}else{
		unset($_SESSION["captcha"]);
		if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/register.php"){
			header("Location: ".$config["base_url"]."/user/register.php?error=".urlencode("Nie umiesz liczyć?"));
			die();
		}else{
			die("CAPTCHA FAIL");
		}
	}
}

if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/register.php"){
	header("Location: ".$config["base_url"]."/user/register.php?error=".urlencode("Spróbuj jeszcze raz"));
	die();
}else{
	die("FAIL");
}

function validate($email, $password, $captcha){
	if(strlen($email) > 50) return false;
	if(strlen($captcha) > 5) return false;
	if(strlen($password) < 8 || strlen($password) > 32) return false;
	if(!verify_url_safeness($email, '.@')) return false;
	if(!is_numeric($captcha)) return false;
	return true;
}