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
  <div class="row">
    <div class="col-lg-6 col-sm-12">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Informacje o Tobie</h4>
          </li>
          <li id="profile_tutorial" class="list-group-item" style="display:none">
            <b>Aby kontynuować, uzupełnij poniższe dane.</b>
          </li>
          <li class="list-group-item">
            <b>Imię i nazwisko:</b> <select id="name_deg_select" style="display: none">
            <option value="" disabled selected>wybierz stopień</option>
            <option value="dh">brak</option>
            <option value="mł.">młodzik</option>
            <option value="wyw.">wywiadowca</option>
            <option value="ćw.">ćwik</option>
            <option value="HO">HO</option>
            </select><input type="text" id="name_textbox" style="display: none"><div id="name_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>E-mail:</b> <?php echo $_SESSION["login"]; ?>
          </li>
          <li class="list-group-item">
            <b>Telefon:</b> <input type="text" id="phone_textbox" style="display: none"><div id="phone_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Drużyna:</b> <select id="team_select" style="display: none"></select><div id="team_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Funkcja:</b> <input type="text" id="function_textbox" style="display: none"><div id="function_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>Zainteresowania:</b>
            <ul>
              <li id="interests_li_1" style="display: none"><input type="text" id="interest_textbox1" style="display: none"><div id="interest_entry1" style="display: none"></div></li>
              <li id="interests_li_2" style="display: none"><input type="text" id="interest_textbox2" style="display: none"><div id="interest_entry2" style="display: none"></div></li>
              <li id="interests_li_3" style="display: none"><input type="text" id="interest_textbox3" style="display: none"><div id="interest_entry3" style="display: none"></div></li>
            </ul>
          </li>
          <li class="list-group-item d-flex justify-content-end flex-row">
            <button type="button" class="btn btn-dark" id="profile_edit" style="display: none" onclick="enter_profile_edit_mode()">Edytuj</button>
            <button type="button" class="btn btn-dark" id="profile_save" style="display: none" onclick="profile_edit_save()">Zapisz</button>
            <button type="button" class="btn btn-light" id="profile_cancel" style="display: none" onclick="profile_edit_cancel()">Anuluj</button>
          </li>
        </ul>
      </div>
    </div>
    <?php if(!isset($_SESSION["commitee"])){ ?>
    <div class="col-lg-6 col-sm-12">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Twój progress</h4>
          </li>
          <li class="list-group-item" id="no_trial_warning" style="display: none">
            <b>Halo! Musisz najpierw otworzyć próbę!</b> Przejdź do zakładki "moja próba" aby to zrobić.
          </li>
          <li id="trial_tutorial" class="list-group-item text-center" style="display:none">
            <b>Wprowadziłeś próbę do systemu!</b> Dobra robota. Teraz przejdź do zakładki <i>"Moje spotkania z kapitułą"</i> aby zapisać się na spotkanie i otworzyć swoją próbę!
          </li>
          <li class="list-group-item" id="trial_progress_entry" style="display: none">
            <b>Progress próby:</b> <div id="trial_progress_entry_text" style="display:inline">trwa już 3 miesiące (z 11)</div>
            <div class="progress" id="trial_progress_progressbar_wrapper">
              <div id="trial_progress_progressbar" class="progress-bar bg-dark" role="progressbar" style="width: 35%"></div>
            </div>
          </li>
          <li class="list-group-item" id="trial_progress_timeleft_entry" style="display: none">
            <b>Czas do końca próby:</b> 7 miesięcy
          </li>
          <li class="list-group-item" id="trial_opening_entry" style="display: none">
            <b>Rozkaz otwierający stopień:</b> <div id="trial_opening_entry_text" style="display:inline"></div>
          </li>
          <li class="list-group-item" id="trial_closing_entry" style="display: none">
            <b>Rozkaz zamykający stopień:</b> <div id="trial_closing_entry_text" style="display:inline"></div>
          </li>
        </ul>
      </div>
    </div>
    <?php } ?>
  </div>
</main>
<script
			  src="https://code.jquery.com/jquery-3.6.0.min.js"
			  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
			  crossorigin="anonymous"></script>
<script>
  var baseurl = "<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>";
  //var baseurl = "http://zwierz.majudev.net/zwierz";
</script>
<script src="<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>/js/profile.js"></script>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>