//code snippet from http://www.sitepoint.com/html5-full-screen-api/
var ddpfx = ["webkit", "moz", "ms", "o", ""];
function ddRunPrefixMethod(obj, method) {
	var p = 0, m, t;
	while (p < ddpfx.length && !obj[m]) {
		m = method;
		if (ddpfx[p] == "") {
			m = m.substr(0,1).toLowerCase() + m.substr(1);
		}
		m = ddpfx[p] + m;
		t = typeof obj[m];
		if (t != "undefined") {
			//console.log("m:"+m);
			ddpfx = [ddpfx[p]];
			return (t == "function" ? obj[m]() : obj[m]);
		}
		p++;
	}
}


function ddLaunchFullScreen() {
	ddRunPrefixMethod(document.documentElement, "RequestFullScreen");
}

function ddFullScreenEnabled()
{
	return ddRunPrefixMethod(document, "FullScreen") || ddRunPrefixMethod(document, "IsFullScreen");
}

function ddCancelFullScreen()
{
	ddRunPrefixMethod(document, "CancelFullScreen");
}

function ddBindFullScreenEvent(handler)
{
	var screen_change_events = "webkitfullscreenchange mozfullscreenchange fullscreenchange";	
	$(document).on(screen_change_events, function ()
				   {
				   handler(ddFullScreenEnabled());
				   });
}
