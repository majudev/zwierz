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
					$("#attachment_new").before('<div class="col" id="attachment' + n + '"><div class="card shadow-sm attachment" onclick="click_attachment(' + n + ')">' + img + '<div class="card-body"><p class="card-text">' + root[i].title + '</p><div class="d-flex justify-content-between align-items-center"><small class="text-muted">' + unix2time(root[i].creation_date) + '</small><div class="btn-group"><button type="button" class="btn btn-sm btn-danger" onclick="delete_attachment(' + n + ')">Usuń</button></div></div></div></div></div>');
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