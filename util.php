<?php
require_once(dirname(__FILE__)."/mailer.php");

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

function content_escape($string){
	$regex = "/[^A-Za-z0-9.!?~@#$% \-^&'\"*()_+\/\nąćęłńóśźż]/";
	$content = preg_replace($regex,'',$string);
	$content = preg_replace("/\"/",'\"',$content);
	return $content;
}

function strip_backslashes($string){
	$content = str_replace('\\', '', $string);
	return $content;
}

/*function send_mail($to, $subject, $body){
	file_put_contents("/tmp/mail.txt", $subject."\n\n".$body."\n====================================\n\n\n", FILE_APPEND);
	return true;
}*/

function generateThumbnail($imgPath, $width, $height, $quality = 90)
{
    if (is_file($imgPath)) {
		try{
			$imagick = new Imagick(realpath($imgPath));
			$imagick->setImageFormat('jpeg');
			$imagick->setImageCompression(Imagick::COMPRESSION_JPEG);
			$imagick->setImageCompressionQuality($quality);
			$imagick->thumbnailImage($width, $height, false, true);
			return $imagick;
		}catch(ImagickException $e){
			return null;
		}catch(Exception $e){
			return null;
		}
    }
    return null;
}
?>