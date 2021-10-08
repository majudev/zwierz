var appointmentid_mappings = {};
$( document ).ready(function() {
	$(".intent-normal").click(function(){
		$('#register_intent_other').hide();
	});
	$(".intent-other").click(function(){
		$('#register_intent_other').show();
	});
	refresh_appointments();
});

function refresh_appointments(){
	// Load appointments data
	$.ajax({
		url: baseurl + "/api/appointments/get_appointments.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.appointments;
			if(root){
				appointmentid_mappings = {};
				/*var max = $("#appointment_table").children("tr").length;
				for(var i = 0; i < max; ++i){
					$("#attachment" + i).remove();
				}*/
				$("#appointment_table").empty();
				for(var i = 0; i < root.length; ++i){
					var n = $("#appointment_table").children("tr").length;
					var total = root[i].total_candidates;
					var free = root[i].total_candidates - root[i].registered_candidates;
					var date = root[i].date;
					var time = root[i].time;
					var registered = root[i].registered;
					var regtext = "Zapisz się";
					var regdisabled = "";
					if(registered){
						regtext = "Zapisano";
						regdisabled = "disabled";
					}
					//var img = '<svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#55595c"></rect><text x="50%" y="50%" fill="#eceeef" dy=".3em">Thumbnail</text></svg>';
					$("#appointment_table").append('<tr id="appointment' + n + '"><td class="nowrap" scope="row">' + unix2date(date) + '</td><td>' + time + '</td><td class="text-center nowrap">' + free + ' z ' + total + '</td><td class="nowrap"><button type="button" class="btn btn-dark" id="appointment_register' + n + '" onclick="appointment_register(' + n + ')" ' + regdisabled + '>' + regtext + '</button></td></tr>');
					appointmentid_mappings["appointment" + n] = root[i].id;
				}
			}else fallback();
		}
	})
	.fail(function() {
		fallback();
	});
}

function appointment_register(n){
	$("#register_appointment_n").text(n);
	$("#register_modal").modal("show");
}

function appointment_register_confirm(){
	var n = $("#register_appointment_n").text();
	var intent = $("#register_intent").val();
	if($("#register_intent_other").is(":visible")){
		intent = $("#register_intent_other_textbox").val();
	}
	$("#register_modal").modal("hide");

	$.ajax({
		url: baseurl + "/api/appointments/register_to_appointment.php",
		data: {
			id: appointmentid_mappings["appointment" + n],
			intent: intent
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