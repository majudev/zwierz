<?php
session_start();
require_once(dirname(__FILE__)."/../../config.php");
session_unset();
session_destroy();
$redir = $config["base_url"];
if($redir === "") $redir = "/";
header("Location: ".$redir);
die();
