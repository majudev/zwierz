<?php
function hashpassword($cleartext){
	return hash('sha512', $cleartext);
}

function generate_random_string($length){
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function verify_url_safeness($url, $specialchars = ''){
  $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.$specialchars;
  for($i = 0; $i < strlen($url); ++$i){
    if(strpos($characters, $url[$i]) === false) return false;
  }
  return true;
}

function send_mail($to, $subject, $body){
	file_put_contents("/tmp/mail.txt", $subject."\n\n".$body."\n====================================\n\n\n", FILE_APPEND);
	return true;
}
?>