<?php require_once(dirname(__FILE__)."/../ui/header.php"); ?>
<?php session_start();
if(!isset($_SESSION["login"])){ ?>
<main class="container">
  <div class="bg-light p-5 rounded">
    <h1>Twoja sesja wygasła</h1>
    <p class="lead">Zbyt dużo czasu minęło od momentu twojego ostatniego logowania. Ze względów bezpieczeństwa zostałeś wylogowany.</p>
    <a class="btn btn-lg btn-primary" href="<?php echo $config["base_url"]; ?>/user/login.php" role="button">Zaloguj się &raquo;</a>
  </div>
</main>
<?php require_once(dirname(__FILE__)."/../ui/footer.php");
die();
}
?>
<main class="container-fluid">
  <div class="row justify-content-center">
    <div class="col-lg-8 col-sm-12">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Lista spotkań</h4>
          </li>
          <li class="list-group-item">
            <div class="table-responsive-sm">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="nowrap">Data</th>
                    <th scope="col" class="text-center longrecord">Czas trwania</th>
                    <th scope="col" class="nowrap text-center">Wolne miejsca</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="appointment_table">
                  <!-- <tr>
                    <td class="nowrap" scope="row">1.01.2022</td>
                    <td>1 godzina pomiędzy 18:00 a 21:00</td>
                    <td class="text-center nowrap">1 z 3</td>
                    <td class="nowrap">
                      <button type="button" class="btn btn-dark" id="appointment_register1" onclick="appointment_register(1)">Zapisz się</button>
                    </td>
                  </tr> -->
                </tbody>
              </table>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>
<div class="modal fade" id="register_modal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Wybierz cel spotkania</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Cel spotkania: <select id="register_intent">
          <option class="intent-normal" value="Otwarcie stopnia">Otwarcie stopnia Harcerza Orlego</option>
          <option class="intent-normal" value="Zamknięcie stopnia">Zamknięcie stopnia Harcerza Orlego</option>
          <option class="intent-other">Inne</option>
        </select>
        <div id="register_intent_other" style="display: none">
          Wyjaśnij, po co chcesz się zapisać:
          <input type="text" id="register_intent_other_textbox">
        </div>
        <div id="register_appointment_n" style="display: none"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-dark" onclick="appointment_register_confirm()">Zapisz się</button>
      </div>
    </div>
  </div>
</div>
<script
			  src="https://code.jquery.com/jquery-3.6.0.min.js"
			  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
			  crossorigin="anonymous"></script>
<script>
  var baseurl = "<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>";
  //var baseurl = "http://zwierz.majudev.net/zwierz";
</script>
<script src="<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>/js/appointments.js"></script>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>