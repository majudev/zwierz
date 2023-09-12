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
  .text-vert-center{
    display: inline;
    justify-content: center;
    align-items: center;
  }
  .nowrap{
    white-space: nowrap;
  }
  .longrecord{
    width: 100%;
  }
</style>
<main class="container-fluid">
  <div class="row">
    <div class="col-lg-8 col-sm-12 firstrun-shadow">
      <div class="p-3">
        <ul class="list-group" id="trials_active">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Aktualne próby</h4>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-lg-4 col-sm-12">
      <div class="p-3">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Informacje o Tobie</h4>
          </li>
          <li id="profile_tutorial" class="list-group-item" style="display:none">
            <b>Aby kontynuować, uzupełnij poniższe dane.</b>
          </li>
          <li class="list-group-item">
            <b>Imię i nazwisko:</b> <input type="text" id="name_textbox" style="display: none"><div id="name_entry" style="display: none"></div>
          </li>
          <li class="list-group-item">
            <b>E-mail:</b> <?php echo $_SESSION["login"]; ?>
          </li>
          <li class="list-group-item d-flex justify-content-end flex-row">
            <button type="button" class="btn btn-dark" id="profile_edit" style="display: none" onclick="enter_edit_mode()">Edytuj</button>
            <button type="button" class="btn btn-dark" id="profile_save" style="display: none" onclick="edit_save()">Zapisz</button>
            <button type="button" class="btn btn-light" id="profile_cancel" style="display: none" onclick="edit_cancel()">Anuluj</button>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-lg-8 col-sm-12 firstrun-shadow">
      <div class="p-3">
        <ul class="list-group" id="trials_archived">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Archiwalne próby</h4>
          </li>
          <li class="list-group-item d-flex flex-row-reverse trial-entry">
            <button class="btn btn-dark" onclick="refresh_archived()">Wyświetl archiwalne próby</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>
<script
			  src="https://code.jquery.com/jquery-3.6.0.min.js"
			  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
			  crossorigin="anonymous"></script>
<script>
  var baseurl = "<?php echo "https://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>";
  //var baseurl = "http://zwierz.majudev.net/zwierz";
</script>
<script src="<?php echo "https://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>/js/commitee_trials.js"></script>
<?php require_once(dirname(__FILE__)."/../../ui/footer.php"); ?>