<?php require_once(dirname(__FILE__)."/../../ui/header.php"); ?>
<?php session_start();
if(!isset($_SESSION["login"])){ ?>
<main class="container">
  <div class="bg-light p-5 rounded">
    <h1>Twoja sesja wygasła</h1>
    <p class="lead">Zbyt dużo czasu minęło od momentu twojego ostatniego logowania. Ze względów bezpieczeństwa zostałeś wylogowany.</p>
    <a class="btn btn-lg btn-primary" href="<?php echo $config["base_url"]; ?>/user/login.php" role="button">Zaloguj się &raquo;</a>
  </div>
</main>
<?php require_once(dirname(__FILE__)."/../../ui/footer.php");
die();
}
?>
<style>
  .nowrap{
    white-space: nowrap;
  }
  .longrecord{
    width: 100%;
  }
</style>
<main class="container-fluid">
  <div class="row justify-content-center">
    <div class="col-lg-9 col-sm-12">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Lista nadchodzących spotkań</h4>
          </li>
          <li class="list-group-item">
            <div class="table-responsive-sm">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="nowrap">Data</th>
                    <th scope="col" class="text-center longrecord">Czas trwania</th>
                    <th scope="col" class="nowrap text-center">Rejestracje</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody id="appointment_table">
                  <tr id="new_appointment" style="display: none">
                    <td class="nowrap" scope="row">
                      <select id="newappointment_date">
                        <option value="" disabled selected>Data</option>
                      </select>
                    </td>
                    <td>
                      <textarea id="newappointment_textbox" class="longrecord" placeholder="Opisz czas spotkania dla kandydata, np. '1 godzina pomiędzy 16:30 a 20:00'"></textarea>
                    </td>
                    <td class="text-center nowrap">
                      <select id="newappointment_candidates_select">
                        <option value="" disabled selected>Wybierz ilość kandydatów</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                      </select>
                    </td>
                    <td class="nowrap">
                      <button type="button" class="btn btn-dark" id="newquest_save" onclick="save_new_appointment()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                          <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="d-flex justify-content-end flex-row" id="new_appointment_button" style="display: none !important">
                <button type="button" class="btn btn-dark" onclick="enter_add_appointment_mode()">Dodaj nowe spotkanie</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="row justify-content-center">
    <div class="col-lg-9 col-sm-12">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Lista minionych spotkań</h4>
          </li>
          <li class="list-group-item">
            <div class="table-responsive-sm">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="nowrap">Data</th>
                    <th scope="col" class="text-center longrecord">Czas trwania</th>
                    <th scope="col" class="nowrap text-center">Rejestracje</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody id="archived_appointment_table">
                </tbody>
              </table>
              <div class="d-flex justify-content-end flex-row" id="show_archived_button" style="display: none">
                <button type="button" class="btn btn-dark" onclick="refresh_appointments(true)">Wyświetl minione spotkania</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>
<div class="modal fade" id="confirm_appointment_delete" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Czy na pewno?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Potwiedź, że chcesz usunąć spotkanie nr <div id="confirm_appointment_delete_n_entry" style="display: inline"></div>.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-danger" onclick="delete_appointment_confirm()">Usuń</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="confirm_appointment_kick" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Czy na pewno?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Potwiedź, że chcesz usunąć <div id="confirm_appointment_kick_name_entry" style="display: inline"></div><div id="confirm_appointment_kick_login_entry" style="display: none"></div> ze spotkania nr <div id="confirm_appointment_kick_n_entry" style="display: inline"></div>.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-danger" onclick="kick_appointment_confirm()">Usuń</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="appointment_delete_nonempty" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Nie możesz usunąć tego spotkania</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Nie możesz usunąć tego spotkania, ponieważ wciąż są na nie zapisane niektóre osoby. Musisz najpierw usunąć te osoby ze spotkania.
        Powodem takiego działania programu jest chęć upewnienia się, że każdy kandydat otrzyma maila z informacją o odwołaniu jego spotkania z kapitułą.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Anuluj</button>
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
  var commitee = "<?php echo $_SESSION["commitee"]; ?>";
</script>
<script src="<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>/js/commitee_appointments.js"></script>
<?php require_once(dirname(__FILE__)."/../../ui/footer.php"); ?>
