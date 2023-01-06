var reload_pending = false;
var trialid_mappings = {};
var archivedid_mappings = {};
$( document ).ready(function() {	
	// Load user data
	$.ajax({
		url: baseurl + "/api/user/get_profile_data.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			name = root.profile.name;
			
			if(name == null) name = '';
			$("#name_entry").text(name);
			$("#name_entry").css("display", "inline");
			
			if(name == ''){
				reload_pending = true;
				enter_edit_mode();
				$("#profile_tutorial").show();
				$("#link_commitee_trials").hide();
				$("#link_commitee_appointments").hide();
				$("#link_admin").hide();
				$(".firstrun-shadow").hide();
			}else{
				$("#profile_edit").show();
			}
		}
	})
	.fail(function() {
		alert("Błąd - strona zostanie załadowana ponownie");
		fallback();
	});
	
	// Load trials data
	refresh_trials();
});

function refresh_trials(){
	$.ajax({
		url: baseurl + "/api/commitee/get_trials.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.trials;
			if(root){
				trialid_mappings = {};
				$("#trials_active").children(".trial-entry").remove();
				for(var i = 0; i < root.length; ++i){
					var n = $("#trials_active").children("li").length;
					var state_text = ' (czeka na otwarcie)';
					if(root[i].is_open) state_text = ' (otwarta)';
					if(root[i].is_closed) state_text = ' (zamknięta)';
					/*var state_button = '<button class="btn btn-dark nowrap" onclick="open_trial(' + n + ')">Otwórz</button>';
					if(root[i].is_open) state_button = '<button class="btn btn-dark nowrap" onclick="close_trial(' + n + ')">Zamknij</button>';
					if(root[i].is_closed) state_button = '<button class="btn btn-dark nowrap" onclick="archive_trial(' + n + ')">Archiwizuj</button>';*/
					$("#trials_active").append('<li class="list-group-item trial-entry"><table><td class="longrecord"><p class="text-vert-center">' + root[i].name + state_text + '</p></td><td><button class="btn btn-dark nowrap" onclick="show_trial(' + n + ')">Wyświetl</button></td></table></li>');
					trialid_mappings["trial" + n] = root[i].id;
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
}

function refresh_archived(){
	$.ajax({
		url: baseurl + "/api/commitee/get_trials.php?archived=yes",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.trials;
			if(root){
				archivedid_mappings = {};
				$("#trials_archived").children(".trial-entry").remove();
				for(var i = 0; i < root.length; ++i){
					var n = $("#trials_archived").children("li").length;
					var state_text = ' (czeka na otwarcie)';
					if(root[i].is_open) state_text = ' (otwarta)';
					if(root[i].is_closed) state_text = ' (zamknięta)';
					$("#trials_archived").append('<li class="list-group-item trial-entry"><table><td class="longrecord"><p class="text-vert-center">' + root[i].name + state_text + '</p></td><td><button class="btn btn-dark nowrap" onclick="show_archived(' + n + ')">Wyświetl</button></td></table></li>');
					archivedid_mappings["trial" + n] = root[i].id;
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
}

function show_trial(n){
	var login = trialid_mappings["trial" + n];
	window.open(baseurl + "/commitee/trials/show.php?id=" + encodeURIComponent(login), '_blank').focus();
}

function show_archived(n){
	var login = archivedid_mappings["trial" + n];
	window.open(baseurl + "/commitee/trials/show.php?id=" + encodeURIComponent(login), '_blank').focus();
}

function enter_edit_mode(){
	$("#name_textbox").val($("#name_entry").text());
	$("#name_entry").hide();
	$("#name_textbox").show();
	
	$("#profile_save").show();
	if(!reload_pending) $("#profile_cancel").show();
	$("#profile_edit").hide();
}

function edit_save(){
	$("#name_entry").text($("#name_textbox").val());
	
	if($("#name_textbox").val() != ""){
		$("#profile_save").hide();
		$("#profile_cancel").hide();

		$.ajax({
			url: baseurl + "/api/user/update_profile_data.php",
			data: {
				name: $("#name_entry").text()
			}
		})
		.done(function(data) {
			var root = JSON.parse(data);
			if(root.status == "ok"){
				edit_cancel();
				if(reload_pending) location.reload();
			}else fallback();
		})
		.fail(function() {
			fallback();
		});
	}else{
		alert("Uzupełnij swoje imię i nazwisko!");
		enter_edit_mode();
	}
}

function edit_cancel(){
	$("#name_entry").css("display", "inline");
	$("#name_textbox").hide();
	
	$("#profile_save").hide();
	$("#profile_cancel").hide();
	$("#profile_edit").show();
}

function fallback(){
	alert("Błąd - strona zostanie załadowana ponownie");
	location.reload();
}