<?php require_once(dirname(__FILE__)."/../ui/header.php"); ?>
<main>
  <div class="d-flex flex-column mb-3 justify-content-center align-items-center">
  <form action="<?php echo $config["base_url"]; ?>/api/user/login.php" method="post">
    <img class="mb-4" src="<?php echo $config["base_url"]; ?>/imgs/zwierzyniec-login.jpg">
    <h1 class="h3 mb-3 fw-normal text-center">Zaloguj się</h1>
    <?php if(isset($_GET["error"])){ ?>
    <p class="text-danger text-center">Błąd: <?php echo $_GET["error"]; ?></p>
    <?php } ?>

    <div class="form-floating">
      <input type="email" class="form-control" id="floatingInput" name="email" placeholder="">
      <label for="floatingInput">Email</label>
    </div>
    <div class="form-floating">
      <input type="password" class="form-control" id="floatingPassword" name="password" placeholder="">
      <label for="floatingPassword">Hasło</label>
    </div>

    <div class="checkbox mb-3">
      <label>
        <input type="checkbox" value="1" name="remember-me"> Nie wylogowywuj mnie
      </label>
    </div>
    <button class="w-100 btn btn-lg btn-primary" type="submit">Zaloguj się</button>
    <p class="mt-3 text-center">Nie masz konta? <a href="<?php echo $config["base_url"]; ?>/user/register.php">Zarejestruj się</a>.</p>
  </form>
  </div>
</main>
<?php require_once(dirname(__FILE__)."/../ui/footer.php"); ?>