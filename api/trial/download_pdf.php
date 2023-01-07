<?php
session_start();
require_once(dirname(__FILE__)."/../../db.php");
require_once(dirname(__FILE__)."/../../util.php");
require_once(dirname(__FILE__)."/../../dompdf/autoload.inc.php");
if(!isset($_SESSION["login"])){
	die('{"status":"error","details":"user not logged in","code":"user_not_logged_in"');
}
$login = $_SESSION["login"];
if(isset($_GET["id"])){
	if(!isset($_SESSION["commitee"]) || $_SESSION["commitee"] == ""){
		$sql = "SELECT COUNT(*) as results FROM trials WHERE `trials`.`archived` = FALSE AND `trials`.`login` = '".mysqli_real_escape_string($db, $_GET["id"])."' AND `trials`.`mentor_email` = '".mysqli_real_escape_string($db, $_SESSION["login"])."'";
		$result = mysqli_query($db, $sql);
		if(!$result || mysqli_num_rows($result) <= 0 || mysqli_fetch_assoc($result)["results"] == 0){
			die('{"status":"error","details":"user doesn\'t have permissions","code":"user_not_authorized"}');
		}
	}
	$login = $_GET["id"];
}
session_write_close();

$name = null;
$phone = null;
$team = null;
$function = null;
$interests = null;
$mentor_name = null;
$mentor_phone = null;
$mentor_email = null;
$open_date = null;
$projected_date = null;
$closed_date = null;
$created = null;

$sql = "SELECT * FROM trials INNER JOIN users ON trials.login = users.email WHERE trials.`login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
if (mysqli_num_rows($result) > 0){
	$row = mysqli_fetch_assoc($result);
	if(isset($row["name"])) $name = $row["name"];
	if(isset($row["phone"])) $phone = $row["phone"];
	if(isset($row["team"])) $team = $row["team"];
	if(isset($row["function"])) $function = $row["function"];
	//ignore interests for now
	if(isset($row["mentor_name"])) $mentor_name = $row["mentor_name"];
	if(isset($row["mentor_phone"])) $mentor_phone = $row["mentor_phone"];
	if(isset($row["mentor_email"])) $mentor_email = $row["mentor_email"];
	if(isset($row["open_date"])) $open_date = $row["open_date"];
	if(isset($row["closed_date"])) $closed_date = $row["closed_date"];
	if(isset($row["projected_date"])) $projected_date = $row["projected_date"];
	if(isset($row["created"])) $created = $row["created"];
} else {
	http_response_code(404);
	die("Próba nie istnieje");
}

// reference the Dompdf namespace
use Dompdf\Dompdf;

$monthlist = array(
	1 => 'styczeń',
	2 => 'luty',
	3 => 'marzec',
	4 => 'kwiecień',
	5 => 'maj',
	6 => 'czerwiec',
	7 => 'lipiec',
	8 => 'sierpień',
	9 => 'wrzesień',
	10 => 'październik',
	11 => 'listopad',
	12 => 'grudzień'
);

$html =
'<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Próba';
if($name != null){
	$html .= ' '.htmlspecialchars($name, ENT_HTML5, 'UTF-8');
}
$html .= '</title>

    <!-- Bootstrap core CSS -->
	<link href="https://fonts.googleapis.com/css2?family=Cantarell:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" />
	<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
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
	  
	  .page-center {
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
      }
	  
	  .table-row {
	    border-top: 1px solid black;
		/*border-bottom: 1px solid black;*/
	  }
    </style>
	<style>
	  .libre-franklin {
	      font-family: "Libre Franklin";
	  }
	  .cantarell {
	      font-family: "Cantarell";
	  }
	</style>
  </head>
  <body>
    <div id="firstpage" style="page-break-after: always;">
      <div class="container-fuild">
        <div style="margin-top: 100pt; text-align: center">
          <p class="libre-franklin text-center" style="font-size: 18pt">
            Związek Harcerstwa Rzeczypospolitej<br>
            Hufiec Harcerzy Kraków Zwierzyniec<br>
            Kapituła Stopnia Harcerza Orlego
          </p>
          <img style="width: 400px; height: auto; margin-top: 10pt; margin-bottom: 10pt" src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Polish_Scouts_Cross.svg">
          <p class="libre-franklin text-center" style="font-size: 18pt">
            Próba na stopień Harcerza Orlego';
if($name != null){
	$html .= '<br>
            '.htmlspecialchars($name, ENT_HTML5, 'UTF-8');
}
$html .= '
	      </p>
        </div>
      </div>
	</div>
    <div id="secondpage" style="page-break-after: always; width: 80%" class="page-center">
      <div class="container">
        <div class="row">
          <div class="col-4">
            <div class="p-3">
              <ul class="list-group" id="infodiv">
                <li class="list-group-item bg-dark text-center text-white">
                  <h4 class="cantarell" style="font-size: 22pt; margin-top: 0px; margin-bottom: 0px; line-height: 1.0">Informacje o próbie</h4>
                </li>';
if($name != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Imię i nazwisko:</b> '.htmlspecialchars($name, ENT_HTML5, 'UTF-8').'
                </li>';
}
$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>E-mail:</b> '.htmlspecialchars($login, ENT_HTML5, 'UTF-8').'
				</li>';
if($phone != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Telefon:</b> '.htmlspecialchars($phone, ENT_HTML5, 'UTF-8').'
                </li>';
}
if($team != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Drużyna:</b> '.htmlspecialchars($team, ENT_HTML5, 'UTF-8').'
                </li>';
}
if($function != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Funkcja:</b> '.htmlspecialchars($function, ENT_HTML5, 'UTF-8').'
                </li>';
}
if($interests != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Zainteresowania:</b>
                  <ul>
                    <li id="interests_li_1" style=""><div id="interest_entry1" style="display: inline;">Historia</div></li>
                    <li id="interests_li_2" style="display: none"><div id="interest_entry2" style="display: none"></div></li>
                    <li id="interests_li_3" style="display: none"><div id="interest_entry3" style="display: none"></div></li>
                  </ul>
                </li>';
}
if($mentor_name != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Opiekun:</b> '.htmlspecialchars($mentor_name, ENT_HTML5, 'UTF-8').'
                </li>';
}
if($mentor_email != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>E-mail opiekuna:</b> '.htmlspecialchars($mentor_email, ENT_HTML5, 'UTF-8').'
                </li>';
}
if($mentor_phone != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Telefon opiekuna:</b> '.htmlspecialchars($mentor_phone, ENT_HTML5, 'UTF-8').'
                </li>';
}
if($projected_date != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Planowane zamknięcie stopnia:</b> '.htmlspecialchars($monthlist[intval(date('m', strtotime($projected_date)))].' '.date('Y', strtotime($projected_date)), ENT_HTML5, 'UTF-8').'
                </li>';
}
$html .= '
              </ul>
            </div>
          </div>
        </div>
      </div>
	  <div style="margin-top: 30px;"></div>
	  <div class="container">
        <div class="row">
          <div class="col-4">
            <div class="p-3">
              <ul class="list-group">
                <li class="list-group-item bg-dark text-center text-white">
                  <h4 class="cantarell" style="font-size: 22pt; margin-top: 0px; margin-bottom: 0px; line-height: 1.0">Informacje techniczne</h4>
                </li>
                ';
if($created != null){
	$html .= '<li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Wprowadzono do systemu:</b> '.htmlspecialchars(date('d.m.Y', strtotime($created)), ENT_HTML5, 'UTF-8').'
                </li>';
}
if($open_date != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Stopień otwarto:</b> '.htmlspecialchars(date('d.m.Y', strtotime($open_date)), ENT_HTML5, 'UTF-8').'
				</li>';
}
if($closed_date != null){
	$html .= '
                <li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Stopień zamknięto:</b> '.htmlspecialchars(date('d.m.Y', strtotime($closed_date)), ENT_HTML5, 'UTF-8').'
                </li>';
}
$html .= '
				<li class="list-group-item libre-franklin" style="line-height: 1.0">
                  <b>Dokument wygenerowany:</b> '.htmlspecialchars(date('d.m.Y h:i:s'), ENT_HTML5, 'UTF-8').'
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
	</div>
    <div id="thirdpage" style="width: 100%" class="">
	  <main class="container-fuild">
	    <div class="row">
          <div class="col-12">
            <div class="p-3">
              <ul class="list-group">
                <li class="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                  <h4 class="cantarell" style="font-size: 22pt; margin-top: 0px; margin-bottom: 0px; line-height: 1.0">Zadania</h4>
                </li>
                <li class="list-group-item libre-franklin">
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
                      <tbody id="quest_table">';

$sql = "SELECT * FROM quests WHERE `login`='".mysqli_real_escape_string($db, $login)."'";
$result = mysqli_query($db, $sql);
$n = 0;
if (mysqli_num_rows($result) > 0){
	while($row = mysqli_fetch_assoc($result)){
		++$n;
		$content = str_replace('\"', '"', $row["content"]);
		$html .= '
                        <tr class="table-row">
						  <td class="nowrap" scope="row"><b>'.htmlspecialchars($n, ENT_HTML5, 'UTF-8').'</b></td>
						  <td><div style="display: inline">'.htmlspecialchars($content, ENT_HTML5, 'UTF-8').'</div></td>
						  <td style="text-align: right;"><div class="text-center nowrap" style="display: inline">'.htmlspecialchars($monthlist[intval(date('m', strtotime($row["finish_date"])))].' '.date('Y', strtotime($row["finish_date"])), ENT_HTML5, 'UTF-8').'</div></td>
						</tr>';
	}
}
$html .='
                      </tbody>
                    </table>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </body>
</html>';

// instantiate and use the dompdf class
$tmp = sys_get_temp_dir();
$dompdf = new Dompdf([
	'logOutputFile' => '',
	// authorize DomPdf to download fonts and other Internet assets
	'isRemoteEnabled' => true,
	// all directories must exist and not end with /
	'fontDir' => $tmp,
	'fontCache' => $tmp,
	'tempDir' => $tmp,
	'chroot' => $tmp,
]);
$options = $dompdf->getOptions();
$options->setDefaultFont('Cantarell');
$dompdf->setOptions($options);

$dompdf->loadHtml($html);

// (Optional) Setup the paper size and orientation
$dompdf->setPaper('A4', 'portrait');

// Render the HTML as PDF
$dompdf->render();

// Output the generated PDF to Browser
$dompdf->stream();