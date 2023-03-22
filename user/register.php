<?php
session_start();
require_once(dirname(__FILE__)."/../ui/header.php");
$numbers = array(
  "zero", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć",
  "dziesięć", "jedenaście", "dwanaście"
);
$ops = array(
  "plus", "minus", "razy"
);
$r1 = (rand() % 7) + 6;
$r2 = rand() % 3;
$r3 = rand() % 6;
$question = $numbers[$r1].' '.$ops[$r2].' '.$numbers[$r3].' = ?';
$answer = 0;
if($r2 == 0) $answer = $r1 + $r3;
else if($r2 == 1) $answer = $r1 - $r3;
else if($r2 == 2) $answer = $r1 * $r3;
if(!isset($_GET["success"])) $_SESSION["captcha"] = $answer;
?>
<main>
  <div class="d-flex flex-column mb-3 justify-content-center align-items-center">
    <?php if(!isset($_GET["success"])) { ?>
    <form action="<?php echo $config["base_url"]; ?>/api/user/register.php" method="post" onsubmit="return verifyPassword()">
      <h1 class="h3 mb-3 fw-normal text-center">Zarejestruj się</h1>
      <?php if(isset($_GET["error"])){ ?>
      <p class="text-danger text-center">Błąd: <?php echo $_GET["error"]; ?></p>
      <?php } ?>

      <div class="form-floating">
        <input type="email" class="form-control" id="floatingInput" name="email" placeholder="">
        <label for="floatingInput">Email</label>
      </div>
      <div class="form-floating">
        <input type="password" class="form-control" id="floatingPassword" name="password" placeholder="">
        <label for="floatingPassword">Hasło</label>
      </div>
      <p class="text-danger" id="pwderror"></p>
      <div class="form-floating">
        <input type="password" class="form-control" id="floatingPassword2" placeholder="">
        <label for="floatingPassword2">Powtórz hasło</label>
      </div>
      <div class="form-floating">
        <input type="text" class="form-control" id="captcha" name="captcha" placeholder="">
        <label id="captchahelper" for="captcha"><?php echo $question; ?></label>
      </div>

      <button class="w-100 btn btn-lg btn-primary" type="submit" id="submit">Zarejestruj się</button>
      <p class="mt-3 text-center">Masz już konto? <a href="<?php echo $config["base_url"]; ?>/user/login.php">Zaloguj się</a>.</p>
    </form>
    <?php } else { ?>
    <h1 class="h3 mb-3 fw-normal text-center">Udało się!</h1>
    <p>Sprawdź swój email, znajdź naszą wiadomość i kliknij w link, aby aktywować swoje konto.</p>
    <?php } ?>
  </div>
</main>
<script>
  // Restricts input for the given textbox to the given inputFilter function.
function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });
}
  document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("pwderror").style.display = "none";
  setInputFilter(document.getElementById("captcha"), function(value) {
  return /^\d*$/.test(value); // Allow digits and '.' only, using a RegExp
});
  });
  
  function verifyPassword(){
    var pwd = document.getElementById("floatingPassword").value;
    var error = document.getElementById("pwderror");
    if(!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd) || pwd.length > 32 || pwd.length < 8){
      error.innerHTML = "Hasło musi mieć przynajmniej 1 wielką literę, 1 małą literę i 1 cyfrę i mieć między 8 a 32 znakami długości";
      error.style.display = "block";
      return false;
    }
    if(document.getElementById("floatingPassword").value != document.getElementById("floatingPassword2").value){
      error.innerHTML = "Hasła muszą pasować do siebie";
      error.style.display = "block";
      return false;
    }
    return true;
  }
</script>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>
