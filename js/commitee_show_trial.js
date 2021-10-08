var reload_pending = false;
var quest_date_selector_innerHTML = '';
var questid_mappings = {};
var attachmentid_mappings = {};
var attachmentext_mappings = {};
$( document ).ready(function() {	
	// Load trial data
	$.ajax({
		url: baseurl + "/api/trial/get_trial_data.php?id=" + encodeURIComponent(trialid),
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
				archived = root.archived;

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
				
				if(archived){
					$("#archive").hide();
					$("#dearchived").show();
				}else{
					$("#archive").show();
					$("#dearchive").hide();
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
	
	// Load quests data
	$.ajax({
		url: baseurl + "/api/trial/get_quests_data.php?id=" + encodeURIComponent(trialid),
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.quests;
			if(root){
				for(var i = 0; i < root.length; ++i){
					var n = $("#quest_table").children("tr").length + 1;
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
	
	// Load user data
	$.ajax({
		url: baseurl + "/api/user/get_profile_data.php?id=" + encodeURIComponent(trialid),
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
		}
	})
	.fail(function() {
		alert("Błąd - strona zostanie załadowana ponownie");
		fallback();
	});
	
	if(commitee == "admin") $("#trial_archive").show();
});

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

function helper_createquest(n, text, date){
	for(var i = 0; i < 10; ++i){
		text = text.replace('\n', '<br>');
	}
	$("#quest_table").append('<tr id="quest_entry' + n + '"><td class="nowrap" scope="row">' + n + '</td><td><textarea id="quest_edit_textbox' + n + '" class="longrecord" style="display: none"></textarea><div id="quest_textbox' + n + '" style="display: inline">' + text + '</div><td><select id="quest_edit_date_select' + n + '" style="display: none"></select><div id="quest_date_select' + n + '" class="text-center nowrap" style="display: inline">' + date + '</div></td></tr>');
}

function refresh_attachments(){
	// Load attachments data
	$.ajax({
		url: baseurl + "/api/trial/get_attachments.php?id=" + encodeURIComponent(trialid),
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
					$("#attachments_div").append('<div class="col" id="attachment' + n + '"><div class="card shadow-sm attachment" onclick="click_attachment(' + n + ')">' + img + '<div class="card-body"><p class="card-text">' + root[i].title + '</p><div class="d-flex justify-content-between align-items-center"><small class="text-muted">' + unix2time(root[i].creation_date) + '</small></div></div></div></div>');
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

function download_attachment(){
}

function click_attachment(n){
	if(!$(window.event.target).is("button")){
		download_attachment = function(){
			window.location = baseurl + "/api/trial/download_attachment.php?trialid=" + encodeURIComponent(trialid) + "&id=" + attachmentid_mappings["attachment" + n];
		}
		//if(attachmentext_mappings["attachment" + n]){
			//$("#view_attachment").modal("show");
		//} else {
			download_attachment();
		//}
	}
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

function archive(state){
	$.ajax({
		url: baseurl + "/api/trial/update_trial_archived.php?id=" + encodeURIComponent(trialid) + "&archived=" + state,
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else location.reload();
	})
	.fail(function() {
		fallback();
	});
}



function fallback(){
	alert("Błąd - strona zostanie załadowana ponownie");
	location.reload();
}