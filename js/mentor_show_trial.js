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
				closed_date = root.closed_date;
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
				
				if(open_date != null){
					var open_time = new Date(open_date * 1000);
					var open_day = open_time.getDay() + 1;
					var open_month = open_time.getMonth() + 1;
					if (open_month < 10) {
						open_month = `0${open_month}`;
					}
					var open_year = open_time.getYear() + 1900;
					$("#open_date_entry").text(open_day + '.' + open_month + '.' + open_year);
					$("#trial_open_div").show();
				}
				
				if(closed_date != null){
					var closed_time = new Date(closed_date * 1000);
					var closed_day = closed_time.getDay() + 1;
					var closed_month = closed_time.getMonth() + 1;
					if (closed_month < 10) {
						closed_month = `0${closed_month}`;
					}
					var closed_year = closed_time.getYear() + 1900;
					$("#closed_date_entry").text(closed_day + '.' + closed_month + '.' + closed_year);
					$("#trial_closed_div").show();
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
	
	$('#download_trial_pdf').click(function(e){
		e.preventDefault();  //stop the browser from following
    	window.location.href = baseurl + "/api/trial/download_pdf.php?id=" + encodeURIComponent(trialid);
	});
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
	text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");
	/*for(var i = 0; i < 10; ++i){
		text = text.replace('\n', '<br>');
	}*/
	$("#quest_table").append('<tr id="quest_entry' + n + '"><td class="nowrap" scope="row">' + n + '</td><td><textarea id="quest_edit_textbox' + n + '" class="longrecord" style="display: none"></textarea><div id="quest_textbox' + n + '" style="display: inline">' + text + '</div><td><select id="quest_edit_date_select' + n + '" style="display: none"></select><div id="quest_date_select' + n + '" class="text-center nowrap" style="display: inline">' + date + '</div></td></tr>');
}

function size2human(bytes, decimals = 1) {
    if (!+bytes) return '0';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
				/*var max = $("#attachments_div").children("div").length;
				for(var i = 1; i < max; ++i){
					$("#attachment" + i).remove();
				}*/
				$("#attachments_div").empty();
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
					
					$("#attachments_div").append('<div class="col" id="attachment' + n + '"><div class="card shadow-sm attachment" onclick="click_attachment(' + n + ')">' + img + '<div class="card-body"><p class="card-text">' + root[i].title + '.' + root[i].extension + ' (' + size2human(root[i].size) + 'B)</p><div class="d-flex justify-content-between align-items-center"><small class="text-muted">' + unix2time(root[i].creation_date) + '</small></div></div></div></div>');
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


function fallback(){
	alert("Błąd - strona zostanie załadowana ponownie");
	location.reload();
}
