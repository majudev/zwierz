var reload_pending = false;
var quest_date_selector_innerHTML = '';
var questid_mappings = {};
var attachmentid_mappings = {};
var attachmentext_mappings = {};
$( document ).ready(function() {	
	// Load trial data
	$.ajax({
		url: baseurl + "/api/trial/get_trial_data.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.trial;
			if(root){
				mentor_name = root.mentor_name;
				mentor_phone = root.mentor_phone;
				mentor_email = root.mentor_email;
				projected_date = root.projected_date;
				open_date = root.open_date;

				if(mentor_name == null) mentor_name = '';
				$("#mentor_name_entry").text(mentor_name);
				$("#mentor_name_entry").css("display", "inline");

				if(mentor_phone == null) mentor_phone = '';
				$("#mentor_phone_entry").text(mentor_phone);
				$("#mentor_phone_entry").css("display", "inline");

				if(mentor_email == null) mentor_email = '';
				$("#mentor_email_entry").text(mentor_email);
				$("#mentor_email_entry").css("display", "inline");
				
				if(projected_date == null){
					projected_date = '';
					$("#projected_date_entry").text(projected_date);
				}else{
					var projected_time = new Date(projected_date * 1000);
					var projected_month = projected_time.getMonth();
					var projected_year = projected_time.getYear() + 1900;
					$("#projected_date_entry").text(m2text(projected_month) + ' ' + projected_year);
				}
				$("#projected_date_entry").css("display", "inline");
				
				var start_time = Date.now();
				if(open_date != null && !isNaN(open_date)){
					start_time = open_date * 1000;
				}
				start_time = new Date(start_time);
				var month = start_time.getMonth();
				var year = start_time.getYear() + 1900;
				for(var i = 0; i < 14; ++i){
					++month;
					if(month > 11){
						month = 0;
						++year;
					}
					$("#projected_date_select").append('<option value="' + m2text(month) + ' ' + year + '">' + m2text(month) + ' ' + year + '</option>');
					quest_date_selector_innerHTML = quest_date_selector_innerHTML + '<option value="' + m2text(month) + ' ' + year + '">' + m2text(month) + ' ' + year + '</option>';
				}
				
				$("#newquest_date_select").html(quest_date_selector_innerHTML);

				if(!root.exists || mentor_name == '' || mentor_phone == '' || mentor_email == '' || projected_date == ''){
					reload_pending = true;
					$(".firstrun-shadow").hide();
					$("#trial_tutorial").show();
					enter_trial_edit_mode();
				}else{
					$("#trial_edit").show();
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
	
	// Load quests data
	$.ajax({
		url: baseurl + "/api/trial/get_quests_data.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.quests;
			if(root){
				for(var i = 0; i < root.length; ++i){
					var n = $("#quest_table").children("tr").length;
					var finish_time = new Date(root[i].finish_date * 1000);
					var finish_month = finish_time.getMonth();
					var finish_year = finish_time.getYear() + 1900;
					helper_createquest(n, root[i].content, m2text(finish_month) + ' ' + finish_year);
					questid_mappings["quest" + n] = root[i].id;
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
	
	// Load attachments list
	refresh_attachments();
	
	// Load logbook
	$.ajax({
		url: baseurl + "/api/trial/get_trial_logbook.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.log;
			if(root){
				for(var i = 0; i < root.length; ++i){
					$("#logbook").append('<tr><td class="nowrap" scope="row">' + root[i]["date"] + '</td><td>' + root[i]["content"] + '</td></tr>');
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
});

function enter_trial_edit_mode(){
	var name = $("#mentor_name_entry").text();
	if(name.substring(0, 2) == 'HO'){
		$("#mentor_deg_select").val('HO');
		$("#mentor_name_textbox").val(name.substring(3, name.length));
	}else if(name.substring(0, 2) == 'HR'){
		$("#mentor_deg_select").val('HR');
		$("#mentor_name_textbox").val(name.substring(3, name.length));
	}else if(name.substring(0, 4) == 'pwd.'){
		if(name.substring(name.length - 2, name.length) == 'HO'){
			$("#mentor_deg_select").val('pwd. HO');
			$("#mentor_name_textbox").val(name.substring(5, name.length - 3));
		}else{
			$("#mentor_deg_select").val('pwd. HR');
			$("#mentor_name_textbox").val(name.substring(5, name.length - 3));
		}
	}else if(name.substring(0, 4) == 'phm.'){
		$("#mentor_deg_select").val('phm.');
		$("#mentor_name_textbox").val(name.substring(5, name.length));
	}else if(name.substring(0, 2) == 'hm.'){
		$("#mentor_deg_select").val('hm.');
		$("#mentor_name_textbox").val(name.substring(4, name.length));
	}
	$("#mentor_name_entry").hide();
	$("#mentor_name_textbox").show();
	$("#mentor_deg_select").show();
	
	$("#mentor_phone_textbox").val($("#mentor_phone_entry").text());
	$("#mentor_phone_entry").hide();
	$("#mentor_phone_textbox").show();
	
	$("#mentor_email_textbox").val($("#mentor_email_entry").text());
	$("#mentor_email_entry").hide();
	$("#mentor_email_textbox").show();
	
	$("#projected_date_select").val($("#projected_date_entry").text());
	$("#projected_date_entry").hide();
	$("#projected_date_select").show();
	
	$("#trial_save").show();
	if(!reload_pending) $("#trial_cancel").show();
	$("#trial_edit").hide();
}

function trial_edit_save(){
	if($("#mentor_deg_select").val() == "pwd. HO"){
		$("#mentor_name_entry").text('pwd. ' + $("#mentor_name_textbox").val() + ' HO');
	}else if($("#mentor_deg_select").val() == "pwd. HR"){
		$("#mentor_name_entry").text('pwd. ' + $("#mentor_name_textbox").val() + ' HR');
	}else{
		$("#mentor_name_entry").text($("#mentor_deg_select").val() + ' ' + $("#mentor_name_textbox").val());
	}
	$("#mentor_name_entry").css("display", "inline");
	$("#mentor_name_textbox").hide();
	$("#mentor_deg_select").hide();	
	
	$("#mentor_phone_entry").text($("#mentor_phone_textbox").val());
	$("#mentor_phone_entry").css("display", "inline");
	$("#mentor_phone_textbox").hide();
	
	$("#mentor_email_entry").text($("#mentor_email_textbox").val());
	$("#mentor_email_entry").css("display", "inline");
	$("#mentor_email_textbox").hide();
	
	$("#projected_date_entry").text($("#projected_date_select").val());
	$("#projected_date_entry").css("display", "inline");
	$("#projected_date_select").hide();
	
	var projected_date = $("#projected_date_entry").text();
	var month = projected_date.substring(0, projected_date.length - 5);
	month = text2m(month);
	var year = projected_date.substring(projected_date.length - 4, projected_date.length);
	var datum = new Date(Date.UTC(year, month, 1, 12, 0, 0));
	datum = Math.floor(datum.getTime() / 1000);
	projected_date = year + "-" + (month + 1) + "-1 12:00:00";
	
	if(!($("#mentor_deg_select").val() == null || $("#mentor_name_textbox").val() == '' || $("#mentor_phone_entry").text() == '' || $("#mentor_email_entry").text() == '' || $("#projected_date_entry").text() == '')){
		$("#trial_save").hide();
		$("#trial_cancel").hide();

		$.ajax({
			url: baseurl + "/api/trial/update_trial_data.php",
			data: {
				mentor_name: $("#mentor_name_entry").text(),
				mentor_phone: $("#mentor_phone_entry").text(),
				mentor_email: $("#mentor_email_entry").text(),
				projected_date: projected_date
			}
		})
		.done(function(data) {
			var root = JSON.parse(data);
			if(root.status == "ok"){
				$("#trial_edit").show();
			}else fallback();
			if(reload_pending) location.reload();
		})
		.fail(function() {
			fallback();
		});
	}else{
		alert("Uzupełnij wszystkie pola (w tym stopień opiekuna)!");
		enter_trial_edit_mode();
	}
}

function trial_edit_cancel(){
	if($("#mentor_deg_select").val() == "pwd. HO"){
		$("#mentor_name_entry").text('pwd. ' + $("#mentor_name_textbox").val() + ' HO');
	}else if($("#mentor_deg_select").val() == "pwd. HR"){
		$("#mentor_name_entry").text('pwd. ' + $("#mentor_name_textbox").val() + ' HR');
	}else{
		$("#mentor_name_entry").text($("#mentor_deg_select").val() + ' ' + $("#mentor_name_textbox").val());
	}
	$("#mentor_name_entry").css("display", "inline");
	$("#mentor_name_textbox").hide();
	$("#mentor_deg_select").hide();	
	
	$("#mentor_phone_entry").text($("#mentor_phone_textbox").val());
	$("#mentor_phone_entry").css("display", "inline");
	$("#mentor_phone_textbox").hide();
	
	$("#mentor_email_entry").text($("#mentor_email_textbox").val());
	$("#mentor_email_entry").css("display", "inline");
	$("#mentor_email_textbox").hide();
	
	$("#projected_date_entry").text($("#projected_date_select").val());
	$("#projected_date_entry").css("display", "inline");
	$("#projected_date_select").hide();
	
	$("#trial_save").hide();
	$("#trial_cancel").hide();
	$("#trial_edit").show();
}

function timestamp2my(timestamp){
	return "it works, kind of";
}

function my2timestamp(my){
	return 0;
}

function m2text(month){
	var months = [
		"styczeń",
		"luty",
		"marzec",
		"kwiecień",
		"maj",
		"czerwiec",
		"lipiec",
		"sierpień",
		"wrzesień",
		"październik",
		"listopad",
		"grudzień"
	];
	return months[month];
}

function text2m(month){
	var months = [
		"styczeń",
		"luty",
		"marzec",
		"kwiecień",
		"maj",
		"czerwiec",
		"lipiec",
		"sierpień",
		"wrzesień",
		"październik",
		"listopad",
		"grudzień"
	];
	for(var i = 0; i < 12; ++i){
		if(months[i] == month) return i;
	}
}

function enter_add_quest_mode(){
	$("#quest_new").hide();
	$("#newquest_n").text($("#quest_table").children("tr").length);
	$("#newquest_textbox").val("");
	$("#newquest_date_select").val("");
	$("#newquest_entry").show();
}

function save_new_quest(){
	if(!($("#newquest_textbox").val() == "" || $("#newquest_date_select").val() == "" || $("#newquest_date_select").val() == null)){
		var n = $("#quest_table").children("tr").length;
		$("#newquest_entry").hide();

		var finish_date = $("#newquest_date_select").val();
		var month = finish_date.substring(0, finish_date.length - 5);
		month = text2m(month);
		var year = finish_date.substring(finish_date.length - 4, finish_date.length);
		var datum = new Date(Date.UTC(year, month, 1, 12, 0, 0));
		datum = Math.floor(datum.getTime() / 1000);
		month = (month + 1);
		finish_date = year + "-" + month + "-1 12:00:00";
		
		var text = $("#newquest_textbox").val();
		for(var i = 0; i < 10; ++i){
			text = text.replace('\n', '<br>');
		}
		
		$.ajax({
			url: baseurl + "/api/trial/new_quest.php",
			data: {
				content: text,
				finish_date: finish_date
			}
		})
		.done(function(data) {
			var root = JSON.parse(data);
			if(root.status == "ok"){
				questid_mappings["quest" + n] = root.id;
				helper_createquest(n, $("#newquest_textbox").val(), $("#newquest_date_select").val());
				$("#quest_new").show();
			}else fallback();
		})
		.fail(function() {
			fallback();
		});
	}else{
		alert("Uzupełnij treść zadania oraz termin jego wykonania!");
	}
}

function helper_createquest(n, text, date){
	for(var i = 0; i < 10; ++i){
		text = text.replace('\n', '<br>');
	}
	$("#newquest_entry").before('<tr id="quest_entry' + n + '"><td class="nowrap" scope="row">' + n + '</td><td><textarea id="quest_edit_textbox' + n + '" class="longrecord" style="display: none"></textarea><div id="quest_textbox' + n + '" style="display: inline">' + text + '</div><td><select id="quest_edit_date_select' + n + '" style="display: none"></select><div id="quest_date_select' + n + '" class="text-center nowrap" style="display: inline">' + date + '</div></td><td class="nowrap"><button type="button" class="btn btn-dark" id="quest_edit_button' + n + '" onclick="edit_quest(' + n + ')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg></button><button type="button" class="btn btn-danger" id="quest_delete_button' + n + '" onclick="delete_quest(' + n + ')" style="display: none"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button><button type="button" class="btn btn-success" id="quest_save_button' + n + '" onclick="save_quest(' + n + ')" style="display: none"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/></svg></button></td></tr>');
}

function edit_quest(n){
	$("#quest_edit_date_select" + n).html(quest_date_selector_innerHTML);
	
	var text = $("#quest_textbox" + n).html();
	for(var i = 0; i < 10; ++i){
		text = text.replace('<br>', '\n');
	}
	$("#quest_edit_textbox" + n).val(text);
	$("#quest_textbox" + n).hide();
	$("#quest_edit_textbox" + n).show();
	
	$("#quest_edit_date_select" + n).val($("#quest_date_select" + n).text());
	$("#quest_date_select" + n).hide();
	$("#quest_edit_date_select" + n).show();
	
	$("#quest_edit_button" + n).hide();
	$("#quest_save_button" + n).show();
	$("#quest_delete_button" + n).show();
}

function delete_quest(n){
	$("#confirm_quest_delete").modal('show');
	$("#confirm_quest_delete_n_entry").text(n);
}

function delete_quest_confirm(){
	var n = $("#confirm_quest_delete_n_entry").text();
	$("#confirm_quest_delete").modal('hide');
	$("#quest_save_button" + n).hide();
	$("#quest_delete_button" + n).hide();
	
	$.ajax({
		url: baseurl + "/api/trial/delete_quest.php",
		data: {
			id: questid_mappings["quest" + n],
		}
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status == "ok"){
			$("#quest_entry" + n).hide();
		}else fallback();
	})
	.fail(function() {
		fallback();
	});
}

function save_quest(n){
	var text = $("#quest_edit_textbox" + n).val();
	for(var i = 0; i < 10; ++i){
		text = text.replace('\n', '<br>');
	}
	$("#quest_textbox" + n).html(text);
	$("#quest_edit_textbox" + n).hide();
	$("#quest_textbox" + n).css("display", "inline");
	
	$("#quest_date_select" + n).text($("#quest_edit_date_select" + n).val());
	$("#quest_edit_date_select" + n).hide();
	$("#quest_date_select" + n).css("display", "inline");
	
	$("#quest_save_button" + n).hide();
	$("#quest_delete_button" + n).hide();
	if(!($("#quest_textbox" + n).html() == "" || $("#quest_date_select" + n).text() == "" || $("#quest_date_select" + n).text() == "null")){
		var finish_date = $("#quest_date_select" + n).text();
		var month = finish_date.substring(0, finish_date.length - 5);
		month = text2m(month);
		var year = finish_date.substring(finish_date.length - 4, finish_date.length);
		var datum = new Date(Date.UTC(year, month, 1, 12, 0, 0));
		datum = Math.floor(datum.getTime() / 1000);
		month = (month + 1);
		//if((month + "").length == 1) month = "0" + month;
		finish_date = year + "-" + month + "-1 12:00:00";
		
		$.ajax({
			url: baseurl + "/api/trial/update_quest_data.php",
			data: {
				id: questid_mappings["quest" + n],
				content: text,
				finish_date: finish_date
			}
		})
		.done(function(data) {
			var root = JSON.parse(data);
			if(root.status == "ok"){
				$("#quest_edit_button" + n).show();
			}else fallback();
		})
		.fail(function() {
			fallback();
		});
	}else{
		alert("Uzupełnij treść zadania oraz termin jego wykonania!");
		edit_quest(n);
	}
}

function refresh_attachments(){
	// Load attachments data
	$.ajax({
		url: baseurl + "/api/trial/get_attachments.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.attachments;
			if(root){
				attachmentid_mappings = {};
				attachmentext_mappings = {};
				var max = $("#attachments_div").children("div").length;
				for(var i = 1; i < max; ++i){
					$("#attachment" + i).remove();
				}
				for(var i = 0; i < root.length; ++i){
					var n = $("#attachments_div").children("div").length;
					var img = '<svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#55595c"></rect><text x="50%" y="50%" fill="#eceeef" dy=".3em">Thumbnail</text></svg>';
					
					if(root[i].extension == 'pdf')
					img = '<svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eceeef"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"> <path fill="currentColor" d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M9.5 11.5C9.5 12.3 8.8 13 8 13H7V15H5.5V9H8C8.8 9 9.5 9.7 9.5 10.5V11.5M14.5 13.5C14.5 14.3 13.8 15 13 15H10.5V9H13C13.8 9 14.5 9.7 14.5 10.5V13.5M18.5 10.5H17V11.5H18.5V13H17V15H15.5V9H18.5V10.5M12 10.5H13V13.5H12V10.5M7 10.5H8V11.5H7V10.5Z" /></svg></g></svg>';
					else if(root[i].has_thumbnail) img = '<img height="225" src="' + baseurl + '/api/trial/get_attachment_thumbnail.php?id=' + root[i].id + '">';
					else if(root[i].extension == 'xls' || root[i].extension == 'xlsx' || root[i].extension == 'ods')
					img = '<svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#009900"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"><path fill="currentColor" d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L7.09 10.96L7.06 11.03Q6.8 10.5 6.5 9.96 6.25 9.43 5.97 8.89H4.16L6.05 12.08L4 15.28H5.78M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z" /></svg></g></svg>';
					else if(root[i].extension == 'doc' || root[i].extension == 'docx' || root[i].extension == 'odt' || root[i].extension == 'rtf' || root[i].extension == 'txt')
					img = '<svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#3366ff"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"><path fill="currentColor" d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7.03 11.34L8.23 15.28H9.6L10.91 8.72H9.53L8.75 12.6L7.64 8.85H6.5L5.31 12.62L4.53 8.72H3.09L4.4 15.28H5.77M20.75 19.5V17H8.25V19.5M20.75 15.75V12.63H12V15.75M20.75 11.38V8.25H12V11.38M20.75 7V4.5H8.25V7Z" /></svg></g></svg>';
					else if(root[i].extension == 'ppt' || root[i].extension == 'pptx' || root[i].extension == 'odp')
					img = '<svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#ffa64d"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"><path fill="currentColor" d="M13.25 3.25Q14.46 3.25 15.58 3.56 16.7 3.88 17.67 4.45 18.64 5 19.44 5.81 20.23 6.61 20.8 7.58 21.38 8.55 21.69 9.67 22 10.79 22 12 22 13.21 21.69 14.33 21.38 15.45 20.8 16.42 20.23 17.39 19.44 18.19 18.64 19 17.67 19.55 16.7 20.13 15.58 20.44 14.46 20.75 13.25 20.75 12.18 20.75 11.15 20.5 10.12 20.24 9.2 19.76 8.28 19.27 7.5 18.58 6.69 17.88 6.07 17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.25 2.5 7 2.83 7H6.07Q6.69 6.12 7.5 5.42 8.28 4.72 9.2 4.24 10.13 3.76 11.15 3.5 12.18 3.25 13.25 3.25M13.88 4.53V11.37H20.72Q20.6 10 20.03 8.81 19.46 7.62 18.55 6.7 17.64 5.79 16.43 5.22 15.23 4.65 13.88 4.53M9.5 10.84Q9.5 10.27 9.3 9.87 9.11 9.46 8.78 9.21 8.45 8.95 8 8.84 7.55 8.72 7 8.72H4.37V15.27H5.91V13H6.94Q7.42 13 7.87 12.84 8.33 12.7 8.69 12.43 9.05 12.17 9.27 11.76 9.5 11.36 9.5 10.84M13.25 19.5Q14.23 19.5 15.14 19.26 16.04 19 16.85 18.58 17.66 18.13 18.33 17.5 19 16.89 19.5 16.13 20 15.36 20.33 14.47 20.64 13.58 20.72 12.62H12.64V4.53Q11.19 4.65 9.91 5.29 8.63 5.93 7.67 7H11.17Q11.5 7 11.76 7.25 12 7.5 12 7.83V16.17Q12 16.5 11.76 16.76 11.5 17 11.17 17H7.67Q8.2 17.6 8.84 18.06 9.5 18.5 10.19 18.84 10.91 19.17 11.68 19.33 12.45 19.5 13.25 19.5M6.85 10Q7.32 10 7.61 10.19 7.89 10.38 7.89 10.89 7.89 11.11 7.79 11.25 7.69 11.39 7.53 11.5 7.37 11.57 7.18 11.6 7 11.64 6.8 11.64H5.91V10H6.85Z" /></svg></g></svg>';
					else
					img = '<svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eceeef"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"> <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg></g></svg>';
					
					$("#attachment_new").before('<div class="col" id="attachment' + n + '"><div class="card shadow-sm attachment" onclick="click_attachment(' + n + ')">' + img + '<div class="card-body"><p class="card-text">' + root[i].title + '.' + root[i].extension + '</p><div class="d-flex justify-content-between align-items-center"><small class="text-muted">' + unix2time(root[i].creation_date) + '</small><div class="btn-group"><button type="button" class="btn btn-sm btn-danger" onclick="delete_attachment(' + n + ')">Usuń</button></div></div></div></div></div>');
					attachmentid_mappings["attachment" + n] = root[i].id;
					attachmentext_mappings["attachment" + n] = root[i].extension;
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
}

function add_new_attachment(){
	var fd = new FormData();
	var files = $('#attachment_file')[0].files;	

	if(files.length > 0){
		fd.append('title', $('#attachment_title').val());
		fd.append('file', files[0]);
		
		$('#attachment_file').val("");
		$('#attachment_title').val("");

		$.ajax({
			url: baseurl + '/api/trial/upload_attachment.php',
			type: 'post',
			data: fd,
			contentType: false,
			processData: false
		})
		.done(function(data) {
			var root = JSON.parse(data);
			if(root.status == "ok"){
				refresh_attachments();
				$("#new_attachment").modal("hide");
			}else fallback();
		})
		.fail(function() {
			fallback();
		});
	}else{
		console.log("hi");
		$("#new_attachment_error").text("Proszę wybrać załącznik!");
		$("#new_attachment_error").show();
	}
}

function download_attachment(){
}

function click_attachment(n){
	if(!$(window.event.target).is("button")){
		download_attachment = function(){
			window.location = baseurl + "/api/trial/download_attachment.php?id=" + attachmentid_mappings["attachment" + n];
		}
		//if(attachmentext_mappings["attachment" + n]){
			//$("#view_attachment").modal("show");
		//} else {
			download_attachment();
		//}
	}
}

function delete_attachment(n){
	$("#confirm_attachment_delete_n_entry").text(n);
	$("#confirm_attachment_delete").modal("show");
}

function delete_attachment_confirm(){
	var n = $("#confirm_attachment_delete_n_entry").text();
	$("#confirm_attachment_delete").modal('hide');
	
	$.ajax({
		url: baseurl + "/api/trial/delete_attachment.php",
		data: {
			id: attachmentid_mappings["attachment" + n],
		}
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status == "ok"){
			refresh_attachments();
		}else fallback();
	})
	.fail(function() {
		fallback();
	});
}

function unix2time(timestamp){
	var date = new Date(timestamp * 1000);
	
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	//var seconds = "0" + date.getSeconds();
	
	var day = date.getDate();
	var month = "0" + (date.getMonth() + 1);
	var year = date.getYear() + 1900;

	// Will display time in 10:30:23 format
	var formattedTime = day + '.' + month.substr(-2) + '.' + year + ' ' + hours + ':' + minutes.substr(-2);
	
	return formattedTime;
}

function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });
}

// Set input filters
document.addEventListener("DOMContentLoaded", () => {
	
	// Filter new quest textbox
	/*setInputFilter(document.getElementById("newquest_textbox"), function(value) {
		return /^\d*$/.test(value); // Allow digits and '.' only, using a RegExp
	});*/ //allow all
});



function fallback(){
	alert("Błąd - strona zostanie załadowana ponownie");
	location.reload();
}
