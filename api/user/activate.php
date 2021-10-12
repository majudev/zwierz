<?php
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");


function activate($db){
  if(!isset($_GET["confirmation"]) || strlen($_GET["confirmation"]) != 64) return false;
  if(!verify_url_safeness($_GET["confirmation"])) return false;
  $sql = "UPDATE users SET active='1', activationkey='NULL' WHERE `activationkey`='".mysqli_real_escape_string($db, $_GET["confirmation"])."'";
  return mysqli_query($db, $sql);
}

if(isset($_GET["ui"])){
  require_once(dirname(__FILE__)."/../../ui/header.php");?>
<main>
  <div class="d-flex flex-column mb-3 justify-content-center align-items-center">
    <?php if(!activate($db)) { //activate?>
    <h1 class="h3 mb-3 fw-normal text-center">Coś poszło nie tak!</h1>
    <p>Skontaktuj się z administratorem. Przykro nam, że tak wyszło.</p>
    <?php } else { ?>
    <h1 class="h3 mb-3 fw-normal text-center">Udało się!</h1>
    <p>Możesz się teraz zalogować.</p>
    <?php } ?>
  </div>
</main>
<?php require_once(dirname(__FILE__)."/../../ui/footer.php");
} else if(activate($db)){ ?>
OK
<?php } else { ?>
UNKNOWN ERROR
<?php } ?>