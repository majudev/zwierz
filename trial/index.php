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
                  <!-- <tr>
                    <td class="nowrap" scope="row">1</td>
                    <td>Będę się mył raz w tygodniu</td>
                    <td class="text-center nowrap">czerwiec 2026</td>
                    <td class="nowrap">
                      <button type="button" class="btn btn-dark" id="profile_edit" onclick="enter_profile_edit_mode()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                          <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                        </svg>
                      </button>
                    </td>
                  </tr> -->
                  <tr id="newquest_entry" style="display: none">
                    <td class="nowrap" scope="row" id="newquest_n">1</td>
                    <td><textarea id="newquest_textbox" class="longrecord"></textarea></td>
                    <td class="text-center nowrap">
                      <select id="newquest_date_select">
                      </select>
                    </td>
                    <td class="nowrap">
                      <button type="button" class="btn btn-dark" id="newquest_save" onclick="save_new_quest()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                          <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="d-flex justify-content-end flex-row">
                <button type="button" class="btn btn-dark" id="quest_new" onclick="enter_add_quest_mode()">Dodaj nowe</button>
                <div class="p-2"></div>
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
          <li id="trial_tutorial" class="list-group-item" style="display:none">
            <b>Aby kontynuować, uzupełnij poniższe dane.</b>
          </li>
          <li class="list-group-item">
            <b>Opiekun:</b> <select id="mentor_deg_select" style="display: none">
            <option value="" disabled selected>wybierz stopień</option>
            <option value="HO">HO</option>
            <option value="HR">HR</option>
            <option value="pwd. HO">pwd. HO</option>
            <option value="pwd. HR">pwd. HR</option>
            <option value="phm.">phm.</option>
            <option value="hm.">hm.</option>
            </select><input type="text" id="mentor_name_textbox" style="display: none"><div id="mentor_name_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>E-mail opiekuna:</b> <input type="text" id="mentor_email_textbox" style="display: none"><div id="mentor_email_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Telefon opiekuna:</b> <input type="text" id="mentor_phone_textbox" style="display: none"><div id="mentor_phone_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Planowane zamknięcie stopnia:</b>
            <select id="projected_date_select" style="display: none"></select>
            <div id="projected_date_entry" style="display: none"></div>
          </li>
          <li class="list-group-item bg-danger text-center">
            <b>Pamiętaj, żeby zapisać się na spotkanie z kapitułą!</b>
          </li>
          <li class="list-group-item d-flex justify-content-end flex-row">
            <button type="button" class="btn btn-dark" id="trial_edit" style="display: none" onclick="enter_trial_edit_mode()">Edytuj</button>
            <button type="button" class="btn btn-dark" id="trial_save" style="display: none" onclick="trial_edit_save()">Zapisz</button>
            <button type="button" class="btn btn-light" id="trial_cancel" style="display: none" onclick="trial_edit_cancel()">Anuluj</button>
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
                  <!-- <div class="col" id="attachment1">
                    <div class="card shadow-sm attachment" onclick="alert('hi!')">
                      <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#55595c"></rect><text x="50%" y="50%" fill="#eceeef" dy=".3em">Thumbnail</text></svg>
                      <div class="card-body">
                        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                        <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">12.06.2021 15:30</small>
                          <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-danger" onclick="alert('deleted')">Usuń</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> -->                  
                  <div class="col"  id="attachment_new">
                    <div class="card attachment" data-bs-toggle="modal" data-bs-target="#new_attachment">
                      <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false">
                        <rect width="100%" height="100%" fill="#55595c"></rect>
                        <text x="50%" y="80%" fill="#eceeef" dy=".3em">Dodaj nowy załącznik</text>
                        <g>
                          <svg fill="#eceeef" x="0" y="15%" xmlns="http://www.w3.org/2000/svg" width="auto" height="50%" fill="currentColor" class="bi bi-file-earmark-plus" viewBox="0 0 16 16">
                            <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/>
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                          </svg>
                        </g>
                      </svg>
                    </div>
                  </div>                  
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
                <tbody>
                  <tr>
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
                  </tr>
                </tbody>
              </table>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>
<div class="modal fade" id="confirm_quest_delete" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Czy na pewno?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Potwiedź, że chcesz usunąć zadanie nr <div id="confirm_quest_delete_n_entry" style="display: inline"></div>.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-danger" onclick="delete_quest_confirm()">Usuń</button>
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
        <input type="text" id="attachment_title" />
        <input type="file" id="attachment_file" />
        <p id="new_attachment_error" class="pt-2 text-danger" style="display:none"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-dark" onclick="add_new_attachment()">Dodaj</button>
      </div>
    </div>
  </div>
</div>
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
<div class="modal fade" id="confirm_attachment_delete" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Czy na pewno?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Potwiedź, że chcesz usunąć załącznik nr <div id="confirm_attachment_delete_n_entry" style="display: inline"></div>.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-danger" onclick="delete_attachment_confirm()">Usuń</button>
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
<script src="<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>/js/trial.js"></script>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>