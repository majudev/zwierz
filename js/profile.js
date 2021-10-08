var reload_pending = false;
$( document ).ready(function() {
	// Load available teams
	$.ajax({
		url: baseurl + "/api/db/get_teams.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			$("#team_select").empty();
			for(var i = 0; i < root.teams.length; ++i){
				$("#team_select").append('<option value="' + root.teams[i] + '">' + root.teams[i] + '</option>');
			}
		}
	})
	.fail(function() {
		alert("Błąd - strona zostanie załadowana ponownie");
		fallback();
	});
	
	// Load user data
	$.ajax({
		url: baseurl + "/api/user/get_profile_data.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			name = root.profile.name;
			phone = root.profile.phone;
			team = root.profile.team;
			ft = root.profile["function"];
			interests = root.profile.interests;
			
			if(name == null) name = '';
			$("#name_entry").text(name);
			$("#name_entry").css("display", "inline");

			if(phone == null) phone = '';
			$("#phone_entry").text(phone);
			$("#phone_entry").css("display", "inline");
			
			if(team == null) team = '';
			$("#team_entry").text(team);
			$("#team_entry").css("display", "inline");
			
			if(ft == null) ft = '';
			$("#function_entry").text(ft);
			$("#function_entry").css("display", "inline");
			
			if(interests == null) interests = JSON.parse('[]');
			for(var i = 0; i < interests.length && i < 3; ++i){
				if(interests[i] != ''){
					$("#interest_entry" + (i+1)).text(interests[i]);
					$("#interest_entry" + (i+1)).css("display", "inline");
					$("#interests_li_" + (i+1)).show();
				}
			}
			
			if(name == '' || phone == '' || team == '' || ft == '' || interests.length < 3){
				reload_pending = true;
				enter_profile_edit_mode();
				$("#profile_tutorial").show();
				$("#link_trial").hide();
				$("#link_appointments").hide();
				$("#link_commitee_trials").hide();
				$("#link_commitee_appointments").hide();
				$("#link_admin").hide();
			}else{
				$("#profile_edit").show();
			}
		}
	})
	.fail(function() {
		alert("Błąd - strona zostanie załadowana ponownie");
		fallback();
	});
});

$( document ).ready(function() {
	$.ajax({
		url: baseurl + "/api/trial/get_trial_data.php",
	})
	.done(function(data) {
		//data = '{"status":"ok","trial":{"exists":true,"open_date":1629234728,"projected_date":1639779128, "closed_date":1639779128,"close_document":""}}';
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.trial;
			if(root.exists){
				if(isNaN(root.open_date) || root.open_date == null){
					$("#trial_tutorial").show();
				}
				if(!isNaN(root.open_date) && !isNaN(root.projected_date)){
					if(!isNaN(root.closed_date)){
						$("#trial_progress_entry_text").text("zakończona, trwała " + delta_text(root.open_date, root.closed_date));
						//$("#trial_progress_progressbar").css("width", "100%");
						$("#trial_progress_progressbar_wrapper").hide();
					}else{
						$("#trial_progress_entry_text").text("trwa już " + delta_text(root.open_date) + " (z " + delta_text2(root.open_date, root.projected_date) + ")");
						$("#trial_progress_progressbar").css("width", ((Math.floor(Date.now()/1000) - root.open_date)/(root.projected_date - root.open_date)*100) + "%");
					}
					$("#trial_progress_entry").show();
				}
				if(root.open_document != null){
					//get link...
					$("#trial_opening_entry_text").html('<a href="">zobacz</a>');
					$("#trial_opening_entry").show();
				}else if(!isNaN(root.open_date)){
					$("#trial_opening_entry_text").text("oczekuje na wydanie");
					$("#trial_opening_entry").show();
				}
				if(root.close_document != null){
					//get link...
					$("#trial_closing_entry_text").html('<a href="">zobacz</a>');
					$("#trial_closing_entry").show();
				}
			}else $("#no_trial_warning").show();
		}
	})
	.fail(function() {
		alert("Błąd - strona zostanie załadowana ponownie");
		fallback();
	});
});

function enter_profile_edit_mode(){
	var name = $("#name_entry").text();
	if(name.substring(0, 2) == 'dh'){
		$("#name_deg_select").val('dh');
		$("#name_textbox").val(name.substring(3, name.length));
	}else if(name.substring(0, 3) == 'mł.'){
		$("#name_deg_select").val('mł.');
		$("#name_textbox").val(name.substring(4, name.length));
	}else if(name.substring(0, 4) == 'wyw.'){
		$("#name_deg_select").val('wyw.');
		$("#name_textbox").val(name.substring(5, name.length));
	}else if(name.substring(0, 3) == 'ćw.'){
		$("#name_deg_select").val('ćw.');
		$("#name_textbox").val(name.substring(4, name.length));
	}else if(name.substring(0, 2) == 'HO'){
		$("#name_deg_select").val('HO');
		$("#name_textbox").val(name.substring(3, name.length));
	}
	$("#name_entry").hide();
	$("#name_textbox").show();
	$("#name_deg_select").show();
	
	
	$("#phone_textbox").val($("#phone_entry").text());
	$("#phone_entry").hide();
	$("#phone_textbox").show();
	
	$("#team_select").val($("#team_entry").text());
	$("#team_entry").hide();
	$("#team_select").show();
	
	$("#function_textbox").val($("#function_entry").text());
	$("#function_entry").hide();
	$("#function_textbox").show();
	
	$("#interest_textbox1").val($("#interest_entry1").text());
	$("#interest_textbox1").show();
	$("#interest_entry1").hide();
	$("#interests_li_1").show();
	$("#interest_textbox2").val($("#interest_entry2").text());
	$("#interest_textbox2").show();
	$("#interest_entry2").hide();
	$("#interests_li_2").show();
	$("#interest_textbox3").val($("#interest_entry3").text());
	$("#interest_textbox3").show();
	$("#interest_entry3").hide();
	$("#interests_li_3").show();
	
	$("#profile_save").show();
	if(!reload_pending) $("#profile_cancel").show();
	$("#profile_edit").hide();
}

function profile_edit_save(){
	$("#name_entry").text($("#name_deg_select").val() + ' ' + $("#name_textbox").val());
	$("#name_entry").css("display", "inline");
	$("#name_textbox").hide();
	$("#name_deg_select").hide();
	
	
	$("#phone_entry").text($("#phone_textbox").val());
	$("#phone_entry").css("display", "inline");
	$("#phone_textbox").hide();
	
	$("#team_entry").text($("#team_select").val());
	$("#team_entry").css("display", "inline");
	$("#team_select").hide();
	
	$("#function_entry").text($("#function_textbox").val());
	$("#function_entry").css("display", "inline");
	$("#function_textbox").hide();
	
	$("#interest_entry1").text($("#interest_textbox1").val());
	$("#interest_textbox1").hide();
	$("#interest_entry1").css("display", "inline");
	if($("#interest_entry1").text() == '') $("#interests_li_1").hide();
	$("#interest_entry2").text($("#interest_textbox2").val());
	$("#interest_textbox2").hide();
	$("#interest_entry2").css("display", "inline");
	if($("#interest_entry2").text() == '') $("#interests_li_2").hide();
	$("#interest_entry3").text($("#interest_textbox3").val());
	$("#interest_textbox3").hide();
	$("#interest_entry3").css("display", "inline");
	if($("#interest_entry3").text() == '') $("#interests_li_3").hide();
	
	if(!($("#name_deg_select").val() == null || $("#name_textbox").val() == '' || $("#phone_entry").text() == '' || $("#team_entry").text() == '' || $("#function_entry").text == '' || ($("#interest_entry1").text() == '' && $("#interest_entry2").text() == '' && $("#interest_entry3").text() == ''))){
		var reload_pending = !$("#profile_cancel").is(":visible");
		$("#profile_save").hide();
		$("#profile_cancel").hide();

		$.ajax({
			url: baseurl + "/api/user/update_profile_data.php",
			data: {
				name: $("#name_entry").text(),
				phone: $("#phone_entry").text(),
				team: $("#team_entry").text(),
				"function": $("#function_entry").text(),
				interests: '["' + $("#interest_entry1").text() + '","' + $("#interest_entry2").text() + '","' + $("#interest_entry3").text() + '"]'
			}
		})
		.done(function(data) {
			if(reload_pending) location.reload();
			
			var root = JSON.parse(data);
			if(root.status != "ok"){
				alert("Wystąpił błąd wewnętrzny.");
				fallback();
			}else $("#profile_edit").show();
		})
		.fail(function() {
			alert("Błąd - strona zostanie załadowana ponownie");
			fallback();
		});
	}else{
		alert("Uzupełnij wszystkie pola (w tym stopień i przynajmniej 1 zainteresowanie)!");
		enter_profile_edit_mode();
	}
}

function profile_edit_cancel(){
	$("#name_entry").css("display", "inline");
	$("#name_textbox").hide();
	$("#name_deg_select").hide();
	
	$("#phone_entry").css("display", "inline");
	$("#phone_textbox").hide();
	
	$("#team_entry").css("display", "inline");
	$("#team_select").hide();
	
	$("#function_entry").css("display", "inline");
	$("#function_textbox").hide();
	
	$("#interest_textbox1").hide();
	$("#interest_entry1").css("display", "inline");
	if($("#interest_entry1").text() == '') $("#interests_li_1").hide();
	$("#interest_textbox2").hide();
	$("#interest_entry2").css("display", "inline");
	if($("#interest_entry2").text() == '') $("#interests_li_2").hide();
	$("#interest_textbox3").hide();
	$("#interest_entry3").css("display", "inline");
	if($("#interest_entry3").text() == '') $("#interests_li_3").hide();
	
	$("#profile_save").hide();
	$("#profile_cancel").hide();
	$("#profile_edit").show();
}

function delta_text(date1, date2 = null){
	if(date2 == null) date2 = Math.floor(Date.now()/1000);
	var delta = date2 - date1;
	var tr = Math.floor(delta/2635200);
	if(tr > 0){
		if(tr == 1) return "1 miesiąc";
		else if(tr > 1 && tr < 5) return tr + " miesiące";
		else return tr + " miesięcy";
	}
	var tr = Math.floor(delta/604800);
	if(tr > 0){
		if(tr == 1) return "1 tydzień";
		else if(tr > 1 && tr < 5) return tr + " tygodnie";
		else return tr + " tygodni";
	}
	var tr = Math.floor(delta/86400);
	if(tr > 0){
		if(tr == 1) return "1 dzień";
		else return tr + " dni";
	}
	return "kilka godzin";
}

function delta_text2(date1, date2 = null){
	if(date2 == null) date2 = Math.floor(Date.now()/1000);
	var delta = date2 - date1;
	var tr = Math.floor(delta/2635200);
	if(tr > 0){
		if(tr == 1) return "1 miesiąca";
		else return tr + " miesięcy";
	}
	var tr = Math.floor(delta/604800);
	if(tr > 0){
		if(tr == 1) return "1 tygodnia";
		else return tr + " tygodni";
	}
	var tr = Math.floor(delta/86400);
	if(tr > 0){
		if(tr == 1) return "1 dzień";
		else return tr + " dni";
	}
	return "kilku godzin";
}

function fallback(){
	alert("Błąd - strona zostanie załadowana ponownie");
	location.reload();
}