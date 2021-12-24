$( document ).ready(function() {
	refresh_appointments();
});

function refresh_appointments(){
	// Load appointments data
	$.ajax({
		url: baseurl + "/api/appointments/get_public_appointments.php",
	})
	.done(function(data) {
		var root = JSON.parse(data);
		if(root.status != "ok") fallback();
		else{
			root = root.appointments;
			if(root){
				$("#appointment_table").empty();
				for(var i = 0; i < root.length; ++i){
					var n = $("#appointment_table").children("tr").length;
					var total = root[i].total_candidates;
					var free = root[i].total_candidates - root[i].registered_candidates;
					var date = root[i].date;
					var time = root[i].time;
					$("#appointment_table").append('<tr id="appointment' + n + '"><td class="nowrap" scope="row">' + unix2date(date) + '</td><td>' + time + '</td><td class="text-center nowrap">' + free + ' z ' + total + '</td><td class="nowrap"></td></tr>');
				}
			}else fallback();
		}
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