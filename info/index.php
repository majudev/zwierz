<?php require_once(dirname(__FILE__)."/../ui/header.php");
require_once(dirname(__FILE__)."/../config.php");
require_once(dirname(__FILE__)."/../db.php");?>
<main class="container-fluid">
  <div class="row justify-content-center">
    <div class="col-lg-8 col-sm-12">
      <div class="p-5">
        <ul class="list-group">
          <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 class="mb-1 mt-1">Z kim do czego?</h4>
          </li>
          <li class="list-group-item">
            <b>Webmaster:</b> <div id="general_entry" style="display: inline"><?php echo $config["maindev"]; ?></div> <br><br>
            Do niego pisz w sprawach błędów na stronie, propozycji usprawnień itp.
          </li>
          <li class="list-group-item">
            <b>Członkowie kapituły:</b>
            <ul id="commitee_members">
              <?php
              $sql = "SELECT name,email FROM `users` WHERE `commitee` IS NOT NULL";
              $result = mysqli_query($db, $sql);
              if (mysqli_num_rows($result) > 0){
                while($row = mysqli_fetch_assoc($result)){
                  echo '<li>'.$row["name"].' ('.$row["email"].')</li>';
                }
              }else echo 'Aktualnie brak!';
              ?>
            </ul><br>
            Z nimi spotkasz się na kapitule :)
          </li>
          <li class="list-group-item">
            <b>Sekretarzowie kapituły:</b>
            <ul id="commitee_admins">
              <?php
              $sql = "SELECT name,email FROM `users` WHERE `commitee` = 'admin'";
              $result = mysqli_query($db, $sql);
              if (mysqli_num_rows($result) > 0){
                while($row = mysqli_fetch_assoc($result)){
                  echo '<li>'.$row["name"].' ('.$row["email"].')</li>';
                }
              }else echo 'Aktualnie brak!';
              ?>
            </ul><br>
            Do nich możesz pisać w kwestiach związanych z kapitułą - jak działają rejestracje w systemie, czy kapituła zapoznała się już z twoim zgłoszeniem itp.
          </li>
          <li class="list-group-item">
            <b>Administratorzy systemu:</b>
            <ul id="admins">
              <?php
              $sql = "SELECT name,email FROM `users` WHERE `admin` = true";
              $result = mysqli_query($db, $sql);
              if (mysqli_num_rows($result) > 0){
                while($row = mysqli_fetch_assoc($result)){
                  echo '<li>'.$row["name"].' ('.$row["email"].')</li>';
                }
              }else echo 'Aktualnie brak!';
              ?>
            </ul><br>
            Do nich możesz pisać w sprawie swojego konta, np. utraty hasła lub gdy zapomniałeś czy masz już konto, czy nie.
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>