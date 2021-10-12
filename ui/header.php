<?php if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) die(); ?>
<?php
require_once(dirname(__FILE__)."/../config.php");
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="Maju">
    <title><?php echo $config["page_name"]; ?></title>

    <!-- Bootstrap core CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

    <style>
      .bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }

      @media (min-width: 768px) {
        .bd-placeholder-img-lg {
          font-size: 3.5rem;
        }
      }
    </style>

    
    <!-- Custom styles for this template -->
    <link href="<?php echo $config["base_url"]; ?>/navbar-top.css" rel="stylesheet">
    <link href="<?php echo $config["base_url"]; ?>/signin.css" rel="stylesheet">
  </head>
  <body>
    
<nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
  <div class="container-fluid">
    <a class="navbar-brand" href="<?php echo $config["base_url"]; ?>"><?php echo $config["page_name"].' '.$config["version"]; ?></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarCollapse">
      <ul class="navbar-nav me-auto mb-2 mb-md-0">
        <?php
        session_start();
        if(isset($_SESSION["timeout"]) && ($_SESSION["timeout"] < time())){
          session_unset();
          session_destroy();
          session_start();
        }
        ?>
        <?php if(isset($_SESSION["login"])){ ?>
        <?php if(!isset($_SESSION["commitee"])){ ?>
        <li class="nav-item">
          <a id="link_profile" class="nav-link <?php if(substr($_SERVER["REQUEST_URI"], 0, strlen($config["base_url"]."/profile")) === $config["base_url"]."/profile") echo "active"; ?>" aria-current="page" href="<?php echo $config["base_url"]; ?>/profile">Mój profil</a>
        </li>
        <li class="nav-item">
          <a id="link_trial" class="nav-link <?php if(substr($_SERVER["REQUEST_URI"], 0, strlen($config["base_url"]."/trial")) === $config["base_url"]."/trial") echo "active"; ?>" href="<?php echo $config["base_url"]; ?>/trial">Moja próba</a>
        </li>
        <li class="nav-item">
          <a id="link_appointments" class="nav-link <?php if(substr($_SERVER["REQUEST_URI"], 0, strlen($config["base_url"]."/appointments")) === $config["base_url"]."/appointments") echo "active"; ?>" href="<?php echo $config["base_url"]; ?>/appointments">Moje spotkania z kapitułą</a>
        </li>
        <?php } else { ?>
        <li class="nav-item">
          <a id="link_commitee_trials" class="nav-link <?php if(substr($_SERVER["REQUEST_URI"], 0, strlen($config["base_url"]."/commitee/trials")) === $config["base_url"]."/commitee/trials") echo "active"; ?>" href="<?php echo $config["base_url"]; ?>/commitee/trials">Próby</a>
        </li>
        <li class="nav-item">
          <a id="link_commitee_appointments" class="nav-link <?php if(substr($_SERVER["REQUEST_URI"], 0, strlen($config["base_url"]."/commitee/appointments")) === $config["base_url"]."/commitee/appointments") echo "active"; ?>" href="<?php echo $config["base_url"]; ?>/commitee/appointments">Spotkania</a>
        </li>
        <?php } ?>
        <?php if(isset($_SESSION["admin"]) && $_SESSION["admin"]){ ?>
        <li class="nav-item">
          <a id="link_admin" class="nav-link <?php if(substr($_SERVER["REQUEST_URI"], 0, strlen($config["base_url"]."/admin")) === $config["base_url"]."/admin") echo "active"; ?>" href="<?php echo $config["base_url"]; ?>/admin">Panel administratora</a>
        </li>
        <?php } ?>
        <?php } ?>
        <li class="nav-item">
          <a id="link_profile" class="nav-link <?php if(substr($_SERVER["REQUEST_URI"], 0, strlen($config["base_url"]."/info")) === $config["base_url"]."/info") echo "active"; ?>" aria-current="page" href="<?php echo $config["base_url"]; ?>/info">Pomoc i kontakt</a>
        </li>
      </ul>
      <ul class="navbar-nav mb-2 mb-md-0">
        <li class="nav-item">
          <?php if(isset($_SESSION["login"])){ ?>
          <a class="nav-link active" aria-current="page" href="<?php echo $config["base_url"]; ?>/api/user/logout.php">Wyloguj się</a>
          <?php } else { ?>
          <a class="nav-link active" aria-current="page" href="<?php echo $config["base_url"]; ?>/user/login.php">Zaloguj się</a>
          <?php } ?>
          <?php session_write_close(); ?>
        </li>
      </ul>
      <!--- <form class="d-flex">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form> --->
    </div>
  </div>
</nav>