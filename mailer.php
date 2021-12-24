<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require dirname(__FILE__).'/PHPMailer/src/Exception.php';
require dirname(__FILE__).'/PHPMailer/src/PHPMailer.php';
require dirname(__FILE__).'/PHPMailer/src/SMTP.php';

require_once(dirname(__FILE__).'/config.php');

function send_mail($recipients, $replyto, $ccs, $subject, $body){
    global $config;
    
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();                                            //Send using SMTP
        $mail->Host       = $config["mail"]["host"];                     //Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
        $mail->Username   = $config["mail"]["user"];                     //SMTP username
        $mail->Password   = $config["mail"]["password"];                               //SMTP password
        $mail->SMTPSecure = $config["mail"]["security"];            //Enable implicit TLS encryption
        $mail->Port       = $config["mail"]["port"];                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($config["mail"]["user"], $config["mail"]["nicename"]);
        foreach($recipients as $recipient){
            $mail->addAddress($recipient);
        }
        if(!is_null($replyto)) $mail->addReplyTo($replyto);
        foreach($ccs as $cc){
            $mail->addCC($cc);
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        return 1;
        echo "SUKCES";
    } catch (Exception $e) {
        return $e;
    }
}
