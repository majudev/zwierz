<?php
namespace Shanept;
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
require_once(dirname(__FILE__)."/../../MimeReader.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["trialid"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		$sql = "SELECT COUNT(*) as results FROM trials WHERE `trials`.`archived` = FALSE AND `trials`.`login` = '".mysqli_real_escape_string($db, $_GET["id"])."' AND `trials`.`mentor_email` = '".mysqli_real_escape_string($db, $_SESSION["login"])."'";
		$result = mysqli_query($db, $sql);
		if(!$result || mysqli_num_rows($result) <= 0 || mysqli_fetch_assoc($result)["results"] == 0){
			die('{"status":"error","details":"user doesn\'t have permissions","code":"user_not_authorized"}');
		}
	}
	$login = $_GET["trialid"];
}
session_write_close();
if(!is_numeric($_GET["id"])){
	die('{"status":"error","details":"invalid characters in request","code":"bad_request"}');
}
$cachedir = getcwd().'/../../cache';
if(!is_dir($cachedir)){
	mkdir($cachedir);
}
$filename_content = $cachedir.'/'.$_GET["id"].'.content';
$filename_mimetype = $cachedir.'/'.$_GET["id"].'.mimetype';
$filename_filename = $cachedir.'/'.$_GET["id"].'.filename';
$filename_hits = $cachedir.'/'.$_GET["id"].'.hits';
if(file_exists($filename_content) && file_exists($filename_mimetype) && file_exists($filename_filename) && file_exists($filename_hits)){
	$type = file_get_contents($filename_mimetype);
	$filename = file_get_contents($filename_filename);
	file_put_contents($filename_hits, intval(file_get_contents($filename_hits)) + 1);
	header('Content-Type: '.$type);
	header('Content-Disposition: attachment; filename="'.$filename.'"');
	echo file_get_contents($filename_content);
	exit();
}
$sql = "SELECT content,name,extension FROM attachments WHERE `id`='".mysqli_real_escape_string($db, $_GET["id"])."' AND `login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if(mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	$content = $row["content"];
	$mime = new MimeReader($content);
	$type = $mime->getType();
	header('Content-Type: '.$type);
	$filename = $row["name"].".".$row["extension"];
	header('Content-Disposition: attachment; filename="'.$filename.'"');
	echo $content;

	$cachesize = 0;
	$cachehits = array();
	$cachefiles = scandir($cachedir);
	foreach($cachefiles as $file) {
		$path_parts = pathinfo($cachedir.'/'.$file);
 		if (!in_array($file, array(".", "..")) && $path_parts["extension"] === "content") {
			if(!file_exists($cachedir.'/'.$path_parts["filename"].'.mimetype') || !file_exists($cachedir.'/'.$path_parts["filename"].'.filename') || !file_exists($cachedir.'/'.$path_parts["filename"].'.hits')){
				unlink($cachedir.'/'.$path_parts["filename"].'.content');
				unlink($cachedir.'/'.$path_parts["filename"].'.mimetype');
				unlink($cachedir.'/'.$path_parts["filename"].'.filename');
				unlink($cachedir.'/'.$path_parts["filename"].'.hits');
				continue;
			}
    		$cachesize = $cachesize + filesize($cachedir.'/'.$file);
			$cachehits[$path_parts["filename"]] = file_get_contents($cachedir.'/'.$path_parts["filename"].'.hits');
  		}
	}
	$cachesize = $cachesize + strlen($content);
	asort($cachehits);
	while($cachesize > $config["cache"]["attachments_cache_size_MB"] && count($cachehits) > 0){
		$key = array_keys($cachehits)[0];
		array_splice($cachehits, 0, 1);
		$cachesize = $cachesize - filesize($cachedir.'/'.$key.'.content');
		unlink($cachedir.'/'.$key.'.content');
		unlink($cachedir.'/'.$key.'.mimetype');
		unlink($cachedir.'/'.$key.'.filename');
		unlink($cachedir.'/'.$key.'.hits');
	}

	file_put_contents($filename_content, $content);
	file_put_contents($filename_mimetype, $type);
	file_put_contents($filename_filename, $filename);
	file_put_contents($filename_hits, 1);
}else http_response_code(404);