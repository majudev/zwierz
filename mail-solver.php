<?php
if(!is_cli()) die();

require_once(dirname(__FILE__)."/config.php");
require_once(dirname(__FILE__)."/db.php");
require_once(dirname(__FILE__)."/util.php");
send_mail(array($config["mail"]["user"]), NULL, array(), "E-mail testowy #spam", "E-mail testowy");


function is_cli()
{
    if( empty($_SERVER['REMOTE_ADDR']) and !isset($_SERVER['HTTP_USER_AGENT']) and count($_SERVER['argv']) > 0) 
    {
        return true;
    } 
    return false;
}
?>