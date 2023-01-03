<?php require_once(dirname(__FILE__)."/../../config.php");
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
$referer_uri = isset($_SERVER["HTTP_REFERER"]) ? parse_url($_SERVER["HTTP_REFERER"]) : false;

if(isset($_POST["email"]) && isset($_POST["password"]) && verify_url_safeness($_POST["email"], '.@')){
	$sql = "SELECT active,name,admin,commitee FROM users WHERE `email`='".mysqli_real_escape_string($db, $_POST["email"])."' AND `password`='".hashpassword($_POST["password"])."'";
	$result = mysqli_query($db, $sql);
	if($result && mysqli_num_rows($result) == 1){ //do the actual auth
		$user = mysqli_fetch_assoc($result);
		if(!$user["active"]){
			if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/login.php"){
				header("Location: ".$config["base_url"]."/user/login.php?error=".urlencode("Konto nieaktywne. Czy kliknąłeś w link z maila?<br><a href=\"".(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]."/user/resend_activation.php\">Wyślj mi tego maila jeszcze raz, proszę</a>"));
				die();
			}else{
				die("ACCOUNT INACTIVE");
			}
		}
		
		$sql = "SELECT `users`.`email` as login, `users`.`name` as name FROM `trials` INNER JOIN `users` ON `trials`.`login` = `users`.`email` WHERE `trials`.`archived` = FALSE AND `trials`.`mentor_email`='".mysqli_real_escape_string($db, $_POST["email"])."'";
		$result = mysqli_query($db, $sql);
		$mentees = array();
		if($result && mysqli_num_rows($result) > 0){
			while($row = mysqli_fetch_assoc($result)){
				$mentees[$row["name"]] = $row["login"];
			}
		}
		
		session_start();
		$_SESSION["login"] = $_POST["email"];
		$_SESSION["name"] = $user["name"];
		$_SESSION["admin"] = $user["admin"];
		$_SESSION["commitee"] = $user["commitee"];
		if(!empty($mentees)) $_SESSION["mentees"] = $mentees;
		$_SESSION["timeout"] = time() + (isset($_POST["remember-me"]) ? $config["session_timeout_long"] : $config["session_timeout_standard"]);
		session_write_close();
		if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/login.php"){
			$redir = $config["base_url"];
			if($redir === "") $redir = "/";
			header("Location: ".$redir);
			die();
		}else{
			die("OK");
		}
	}
}

if($referer_uri !== false && $referer_uri["path"] === $config["base_url"]."/user/login.php"){
	header("Location: ".$config["base_url"]."/user/login.php?error=".urlencode("Złe dane. Spróbuj jeszcze raz."));
	die();
}else{
	die("FAIL");
}
