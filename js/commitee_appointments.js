var appointmentid_mappings = {};
var archivedappointmentid_mappings = {};
$( document ).ready(function() {
	var date = new Date();

	for(var i = 0; i < 365; ++i){
		$("#newappointment_date").append('<option value="' + Math.floor(date/1000) + '">' + date.getDate() + '.' + ("0" + (date.getMonth() + 1)).substr(-2) + '.' + (date.getYear() + 1900) + '</option>');
		date.setDate(date.getDate() + 1);
	}
	
	refresh_appointments();
	if(commitee == "admin"){
		$("#new_appointment_button").show();
		$("#show_archived_button").show();
	}
});

function refresh_appointments(archived = false){
	var table_div = "#appointment_table";
	var appointment_div = "#appointment";
	var link_parameters = "";
	if(archived){
		var table_div = "#archived_appointment_table";
		var appointment_div = "#archived_appointment";
		var link_parameters = "&archived=yes";
	}
	// Load appointments data
	$.ajax({
		url: baseurl + "/api/appointments/get_appointments.php?all=yes" + link_parameters,
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.appointments;
			if(root){
				if(!archived){
					appointmentid_mappings = {};
					var max = $(table_div).children("tr").length;
					for(var i = 1; i < max; ++i){
						$(appointment_div + i).remove();
					}
				}else{
					$('#show_archived_button').attr("style", "display: none !important");
					archivedappointmentid_mappings = {};
					$(table_div).empty();
				}
				var archived_str = '';
				if(archived) archived_str = 'archived_';
				for(var i = 0; i < root.length; ++i){
					var n = $(table_div).children("tr").length;
					var total = root[i].total_candidates;
					var taken = root[i].registered_candidates;
					var date = root[i].date;
					var time = root[i].time;
					var registered = root[i].registered;
					var registered_list = "<table class=\"table\"><thead><th class=\"text-center nowrap\">Imię i nazwisko</th><th class=\"text-center longrecord\">Cel</th><th class=\"text-center nowrap\">Akcje</th></thead><tbody id=\"candidates" + n + "\">";
					for(var j = 0; j < registered.length; ++j){
						var delete_candidate = '';
						if(commitee == "admin" && !archived) delete_candidate = '<button class="btn btn-danger nowrap" onclick="kick_candidate(' + n + ', ' + j + ', \'' + registered[j].login + '\')">Usuń ze spotkania</button>';
						registered_list += '<tr><td class="text-center name">' + registered[j].name + '</td><td class="text-center">' + registered[j].intent + '</td><td><button class="btn btn-dark nowrap" onclick="show_trial(\'' + registered[j].login + '\')">Otwórz próbę</button>' + delete_candidate + '</td><input type="hidden" class="login" value="' + registered[j].login + '"></tr>';
					}
					registered_list += "</tbody></table>";
					if(registered.length == 0) registered_list = "<br><br>Brak zapisanych kandydatów";
					var actionbuttons = "";
					if(commitee == "admin" && !archived){
						/// TODO: allow edit of appointments
						//if(registered.length < total) actionbuttons += '<button class="btn btn-dark" onclick="edit_appointment(' + n + ')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg></button>';
						actionbuttons += '<button class="btn btn-danger" onclick="delete_appointment(' + n + ')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button>';
					}
					var toappend = '<tr id="' + archived_str + 'appointment' + n + '"><td class="nowrap" scope="row">' + unix2date(date) + '</td><td>' + time + registered_list + '</td><td class="text-center nowrap">' + taken + ' z ' + total + '</td><td class="nowrap">' + actionbuttons + '</td></tr>';
					if(!archived){
						$("#new_appointment").before(toappend);
						appointmentid_mappings["appointment" + n] = root[i].id;
					}else{
						$(table_div).append(toappend);
						archivedappointmentid_mappings["appointment" + n] = root[i].id;
					}
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
}

function show_trial(login){
	window.open(baseurl + "/commitee/trials/show.php?id=" + encodeURIComponent(login), '_blank').focus();
}

function save_new_appointment(){
	if(!($("#newappointment_textbox").val() == "" || $("#newappointment_date").val() == null || $("#newappointment_candidates_select").val() == null)){
		var n = $("#quest_table").children("tr").length;
		$("#new_appointment").hide();
		
		$.ajax({
			url: baseurl + "/api/appointments/new_appointment.php",
			data: {
				date: $("#newappointment_date").val(),
				time: $("#newappointment_textbox").val(),
				max_candidates: $("#newappointment_candidates_select").val()
			}
		})
		.done(function(data) {
			var root = JSON.parse(data);
			if(root.status == "ok"){
				refresh_appointments();
				$("#new_appointment_button").show();
			}else fallback();
		})
		.fail(function() {
			fallback();
		});
	}else{
		alert("Wybierz datę spotkania, ilość kandydatów oraz wpisz czas trwania!");
	}
}

function enter_add_appointment_mode(){
	$("#new_appointment_button").hide();
	$("#newappointment_date").val("");
	$("#newappointment_textbox").val("");
	$("#newappointment_candidates_select").val("");
	$("#new_appointment").show();
}

function delete_appointment(n){
	if($("#candidates" + n).children("tr").length == 0){
		$("#confirm_appointment_delete").modal('show');
		$("#confirm_appointment_delete_n_entry").text(n);
	}else{
		$("#appointment_delete_nonempty").modal('show');
	}
}

function kick_candidate(appointment, n, login){
	$("#confirm_appointment_kick").modal('show');
	$("#confirm_appointment_kick_n_entry").text(appointment);
	$("#confirm_appointment_kick_name_entry").text($("#candidates" + appointment).children("tr:nth-child(" + (n+1) + ")").children(".name").text());
	$("#confirm_appointment_kick_login_entry").text($("#candidates" + appointment).children("tr:nth-child(" + (n+1) + ")").children(".login").val());
	//.log($("#candidates" + n).children("tr:nth-child(" + (n-1) + ") .login").text());
}

function delete_appointment_confirm(){
	var n = $("#confirm_appointment_delete_n_entry").text();
	$("#confirm_appointment_delete").modal('hide');
	
	$.ajax({
		url: baseurl + "/api/appointments/delete_appointment.php",
		data: {
			id: appointmentid_mappings["appointment" + n],
		}
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status == "ok"){
			refresh_appointments();
		}else fallback();
	})
	.fail(function() {
		fallback();
	});
}

function kick_appointment_confirm(){
	var n = $("#confirm_appointment_kick_n_entry").text();
	var login = $("#confirm_appointment_kick_login_entry").text();
	$("#confirm_appointment_kick").modal('hide');
	
	$.ajax({
		url: baseurl + "/api/appointments/kick_from_appointment.php",
		data: {
			id: appointmentid_mappings["appointment" + n],
			login: login
		}
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status == "ok"){
			refresh_appointments();
		}else fallback();
	})
	.fail(function() {
		fallback();
	});
}

function unix2date(timestamp){
	var date = new Date(timestamp * 1000);
	
	var day = date.getDate();
	var month = "0" + (date.getMonth() + 1);
	var year = date.getYear() + 1900;

	var formattedTime = day + '.' + month.substr(-2) + '.' + year;
	
	return formattedTime;
}

function fallback(){
	alert("Błąd - strona zostanie załadowana ponownie");
	location.reload();
}