<?php require_once(dirname(__FILE__)."/../ui/header.php"); ?>
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
                  </tr>
                </thead>
                <tbody id="appointment_table">
                </tbody>
              </table>
            </div>
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
  var baseurl = "<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>";
  //var baseurl = "http://zwierz.majudev.net/zwierz";
</script>
<script src="<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://".$_SERVER["HTTP_HOST"].$config["base_url"]; ?>/js/public_appointments.js"></script>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>