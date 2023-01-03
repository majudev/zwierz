<?php require_once(dirname(__FILE__)."/../ui/header.php");
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
session_start();
if(!isset($_GET["success"])) $_SESSION["captcha"] = $answer;
session_write_close();
?>
<main>
  <div class="d-flex flex-column mb-3 justify-content-center align-items-center">
    <?php if(!isset($_GET["success"])) { ?>
    <form action="<?php echo $config["base_url"]; ?>/api/user/resend_activation_email.php" method="post">
      <h1 class="h3 mb-3 fw-normal text-center">Wyślij mi e-mail aktywacyjny</h1>
      <?php if(isset($_GET["error"])){ ?>
      <p class="text-danger text-center">Błąd: <?php echo $_GET["error"]; ?></p>
      <?php } ?>

      <div class="form-floating">
        <input type="email" class="form-control" id="floatingInput" name="email" placeholder="">
        <label for="floatingInput">Email</label>
      </div>
      <div class="form-floating">
        <input type="text" class="form-control" id="captcha" name="captcha" placeholder="">
        <label id="captchahelper" for="captcha"><?php echo $question; ?></label>
      </div>

      <button class="w-100 btn btn-lg btn-primary" type="submit" id="submit">Wyślij</button>
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
</script>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>
