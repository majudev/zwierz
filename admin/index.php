<?php
session_start();
if(!isset($_SESSION["admin"]) || $_SESSION["admin"] != 1){
	header('Location: https://www.youtube.com/watch?v=dQw4w9WgXcQ');
}
?>
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
  <div class="row justify-content-center">
    <div class="col-lg-12 col-sm-12">
      <div class="p-3 pt-5 pb-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Lista użytkowników</h4>
          </li>
          <li class="list-group-item">
            <div class="table-responsive-sm">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="text-center nowrap">ID</th>
                    <th scope="col" class="nowrap">Imię i nazwisko</th>
                    <th scope="col" class="text-center longrecord">Email</th>
                    <th scope="col" class="text-center nowrap">Telefon</th>
                    <th scope="col" class="text-center nowrap">Drużyna</th>
                    <th scope="col" class="text-center nowrap">Zweryfikowany</th>
                    <th scope="col" class="text-center nowrap">Hasło</th>
                    <th scope="col" class="text-center nowrap">Uprawnienia</th>
                    <th scope="col" class="text-center nowrap">Usuń</th>
                  </tr>
                </thead>
                <tbody id="users_table">
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
<div class="modal fade" id="confirm_password_reset" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Czy na pewno?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Potwiedź, że chcesz zresetować hasło użytkownika <div id="confirm_password_reset_name" style="display: inline"></div> (ID=<div id="confirm_password_reset_id" style="display: inline"></div>).
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-danger" onclick="reset_password_confirm()">Usuń</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="confirm_user_delete" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Czy na pewno?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Potwiedź, że chcesz usunąć użytkownika <div id="confirm_user_delete_name" style="display: inline"></div> (ID=<div id="confirm_user_delete_id" style="display: inline"></div>).<br><br>
        W trakcie tej operacji możesz uszkodzić bazę danych. Musisz ręcznie usunąć potem np. próbę tego użytkownika, jego rejestracje na spotkania itp. Nie zaleca się wykonywania tej operacji.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
        <button type="button" class="btn btn-danger" onclick="delete_user_confirm()">Usuń</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="warning" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Uważaj co robisz!</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Ta strona daje ci dostęp do bazy danych nie wykonując żadnych testów bezpieczeństwa. Nie wiedząc co robisz, możesz uszkodzić całą bazę danych z próbami użytkowników. Wyjdź z tej strony, jeżeli nie wiesz co oznaczają poszczególne przyciski.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Wchodzę</button>
        <button type="button" class="btn btn-dark" onclick="escape()">Zabierz mnie stąd!</button>
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
  $( document ).ready(function() {
    $("#warning").modal('show');
    $.ajax({
      url: baseurl + "/admin/execute.php",
      data: {
        query: "select id,name,email,phone,team,active,commitee,admin from users",
      }
    })
    .done(function(data) {
      var root = JSON.parse(data);
      if(root.status != "ok") alert("Nie można załadować listy użytkowników: " + root.details);
      else{
        if(root.rows > 0){
          for(var i = 0; i < root.rows; ++i){
            var user = root.data[i];
            var active = "Tak";
            if(user["active"] == false){
              active = '<button class="btn btn-dark" onclick="activate_account(\'' + user["email"] + '\')">Aktywuj</button><button class="btn btn-dark" onclick="resend_activation_email(\'' + user["email"] + '\')">Wyślij email aktywacyjny</button>';
            }
            var permissions = "Kandydat";
            if(user["commitee"] == "member") permissions = "Członek";
            else if(user["commitee"] == "admin") permissions = "Sekretarz";
            if(user["admin"] == 1) permissions += ", Admin";
            $("#users_table").append('<tr><td class="text-center">' + user["id"] + '</td><td class="nowrap text-center">' + user["name"] + '</td><td class="text-center">' + user["email"] + '</td><td class="nowrap text-center">' + user["phone"] + '</td><td class="text-center">' + user["team"] + '</td><td class="text-center nowrap">' + active + '</td><td class="nowrap"><button class="btn btn-danger" onclick="popup_pwd_reset(' + user["id"] + ', \'' + user["name"] + '\')">Resetuj</button></td><td class="text-center">' + permissions + '</td><td><button class="btn btn-danger" onclick="popup_user_delete(' + user["id"] + ', \'' + user["name"] + '\')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button></td></tr>');
          }
        }else $("#users_table").append("<tr><td></td><td>Brak użytkowników w bazie.</td></tr>");
      }
    })
    .fail(function() {
      fallback();
    });
  });
  
  function popup_pwd_reset(id, name){
    $("#confirm_password_reset_id").text(id);
    $("#confirm_password_reset_name").text(name);
    $("#confirm_password_reset").modal('show');
  }
  
  function reset_password_confirm(){
    var id = $("#confirm_password_reset_id").text();
    var name = $("#confirm_password_reset_name").text();
    //sendmail
    $("#confirm_password_reset").modal('hide');
  }
  
  function popup_user_delete(id, name){
    $("#confirm_user_delete_id").text(id);
    $("#confirm_user_delete_name").text(name);
    console.log(id, name);
    $("#confirm_user_delete").modal('show');
  }
  
  function delete_user_confirm(){
    var id = $("#confirm_user_delete_id").text();
    var name = $("#confirm_user_delete_name").text();
    $("#confirm_user_delete").modal('hide');
    $.ajax({
      url: baseurl + "/admin/execute.php",
      data: {
        query: "delete from users where `id`='" + id + "'",
      }
    })
    .done(function(data) {
      var root = JSON.parse(data);
      if(root.status != "ok") alert("Nie można usunąć użytkownika: " + root.details);
      else location.reload();
    })
    .fail(function() {
      fallback();
    });
  }
  
  function activate_account(email){
    $.ajax({
      url: baseurl + "/admin/execute.php",
      data: {
        query: "update users set `active` = true where `email` = '" + email + "'",
      }
    })
    .done(function(data) {
      var root = JSON.parse(data);
      if(root.status != "ok") alert("Nie można aktywować użytkownika: " + root.details);
      else location.reload();
    })
    .fail(function() {
      fallback();
    });
  }
  
  function resend_activation_email(email){
    $.ajax({
      url: baseurl + "/api/user/resend_activation_email.php",
      method: "POST",
      data: {
        email: email,
      }
    })
    .done(function(data) {
      if(data != "OK") alert("Nie można wysłać maila z linkiem aktywacyjnym: " + data);
      else alert("Wysłano");
    })
    .fail(function() {
      fallback();
    });
  }
  
  function fallback(){
    alert("Błąd - strona zostanie załadowana ponownie");
    location.reload();
  }
  
  function escape(){
    document.location.href = baseurl;
  }
</script>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>