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
  .attachment:hover{
    border-color: rgba(66,70,73,.5);
    box-shadow: 0 0 0 .25rem rgba(66,70,73,.5) !important;
  }
</style>
<main class="container-fluid">
  <div class="row">
    <div class="col-lg-8 col-sm-12">
      <div class="p-3">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Zadania</h4>
          </li>
          <li class="list-group-item firstrun-shadow">
            <div class="table-responsive-sm">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="nowrap">#</th>
                    <th scope="col" class="text-center longrecord">Zadanie</th>
                    <th scope="col" class="nowrap text-center">Termin</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="quest_table">
                </tbody>
              </table>
              <div class="d-flex justify-content-end flex-row">
                <button type="button" class="btn btn-dark" id="download_trial_pdf" disabled>Pobierz PDF próby</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-lg-4 col-sm-12">
      <div class="p-3">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Informacje o próbie</h4>
          </li>
          <li class="list-group-item">
            <b>Imię i nazwisko:</b> <div id="name_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>E-mail:</b> <?php echo $_GET["id"]; ?>
          </li>
          <li class="list-group-item">
            <b>Telefon:</b> <div id="phone_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Drużyna:</b> <div id="team_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Funkcja:</b> <div id="function_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Zainteresowania:</b>
            <ul>
              <li id="interests_li_1" style="display: none"><div id="interest_entry1" style="display: none"></div></li>
              <li id="interests_li_2" style="display: none"><div id="interest_entry2" style="display: none"></div></li>
              <li id="interests_li_3" style="display: none"><div id="interest_entry3" style="display: none"></div></li>
            </ul>
          </li>
          <li class="list-group-item">
            <b>Opiekun:</b> <div id="mentor_name_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>E-mail opiekuna:</b> <div id="mentor_email_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Telefon opiekuna:</b> <div id="mentor_phone_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Planowane zamknięcie stopnia:</b>
            <div id="projected_date_entry" style="display: none"></div>
          </li>
          <li class="list-group-item" id="trial_archive" style="display: none">
            <div class="d-flex flex-row-reverse">
              <button class="btn btn-danger" onclick="archive(true)" id="archive">Archiwizuj próbę</button>
              <button class="btn btn-danger" onclick="archive(false)" id="dearchive">Dearchiwizuj próbę</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="p-4"></div>
  <div class="row justify-content-center firstrun-shadow">
    <div class="col-9">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Załączniki</h4>
          </li>
          <li class="list-group-item">
            <div class="album py-5">
              <div class="container">
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" id="attachments_div">
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-9 p-5 pt-0 firstrun-shadow">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Komentarze i historia zmian</h4>
          </li>
          <li class="list-group-item">
            <div class="table-responsive-sm">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="text-center nowrap">Data</th>
                    <th scope="col" class="longrecord">Operacja</th>
                  </tr>
                </thead>
                <tbody id="logbook">
                  <!--- <tr>
                    <td class="nowrap" scope="row">12.05.2022 12:59</td>
                    <td>Kandydat dodał zadanie o treści "Będę się mył raz w tygodniu"</td>
                  </tr>
                  <tr>
                    <td class="nowrap" scope="row">12.08.2022 13:00</td>
                    <td>Kandydat zmienił treść zadania z "Będę się mył dwa razy w tygodniu" na "Będę się mył raz w tygodniu".</td>
                  </tr>
                  <tr class="table-info">
                    <td class="nowrap" scope="row">12.08.2022 13:30</td>
                    <td>Kapituła sugeruje zmianę zadania dotyczącego mycia się na bardziej ambitne.</td>
                  </tr> --->
                </tbody>
              </table>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>
<div class="modal fade" id="view_attachment" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-body">
        <input type="text" id="attachment_title" />
        <input type="file" id="attachment_file" />
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Zamknij</button>
        <button type="button" class="btn btn-dark" onclick="download_attachment()">Pobierz</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="new_attachment" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Dodaj nowy załącznik</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Podaj nazwę załącznika:
        <input type="text" id="new_attachment_title" placeholder="np. Raport z próby" />
        <input type="file" id="new_attachment_file" /> (Max <?php echo ini_get('upload_max_filesize') < ini_get('post_max_size') ? ini_get('upload_max_filesize') : ini_get('post_max_size'); ?>B)
        <p id="new_attachment_error" class="pt-2 text-danger" style="display:none"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-dark" onclick="add_new_attachment()">Dodaj</button>
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
  var trialid = "<?php echo $_GET["id"]; ?>";
  var commitee = "<?php echo $_SESSION["commitee"]; ?>";
</script>
<script src="<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>/js/commitee_show_trial.js"></script>
<?php require_once(dirname(__FILE__)."/../../ui/footer.php"); ?>