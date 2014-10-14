// jQuery.Callme 2.0 * NazarTokar.com * dedushka.org * Copyright 2010-2014
// Nazar Tokar @ Ukraine
// updated on 2014-06-10

function getScriptFolder (e) { // find script folder
	var scripts = document.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; i++) {
		if (scripts[i].src.indexOf(e) >= 0) {
			var res = scripts[i].src.substring(0, scripts[i].src.indexOf(e));
		}
	}
	return res.replace("callme/js", "callme");
}

window.onload = function(){
	$jq.getScript(getScriptFolder("callme-nc.js")+"js/config.js", function(){
		callMe();
	});
}

function callMe() {

var tpl = {}, cmeForm, cmeCSS = $jq("<link>"); // add css
cmeCSS.attr ({
	type: "text/css",
	rel: "stylesheet",
	href: getScriptFolder("callme-nc.js") + "templates/" + cmeData["template"] + "/style.css"
});

$jq("head").append(cmeCSS);

var hr = new Date().getHours(); // get usr hour

var callmeData = { // data to send
	fields: cmeData["fields"],
	title: cmeData["title"],
	calltime: cmeData["callTime"],
	time_start: cmeData["startWork"],
	time_end: cmeData["endWork"],
	button: cmeData["button"],
	hr: hr
};

function replaceData(data, key, str) {  // replace template
	if (!data || !key || !str) { return ""; }
	return data = data.replace((new RegExp("{{:"+key+"}}", "gi")), str);
}

function rpl(e,d,r) { // replace
	if (!d) {
		var t = ["\"", "'", "~", ";", "{", "}"];
		for (var i=0; i<t.length; i++) {
			var o = new RegExp(t[i], "g");
			e = e.replace(o, "");
		}
	} else {
		o = new RegExp(d, "g");
		e = e.replace(o, r);
	}
	return e;
}

function loadHTML() { // load templates html 
	if (!tpl.length) { 
		$jq(".cme-form").find(".cme-template").each(function(){
			tpl[getData($jq(this))] = $jq(this).html();
			$jq(this).html("");
		});
	}
}

function isIE() { // check if IE
	var msie = window.navigator.userAgent.indexOf("MSIE ");
	return msie > 0 ? true : false;
}

function getData(e) { // get "data-bs" attribute
	return $jq(e).attr("data-cme") ? $jq(e).attr("data-cme") : false;
}

function getPlaceholder(e,t) { // find placeholder and caption
	var f = [" ", e];
	if (e.lastIndexOf("(") != "-1") { // если указан placeholder
		f[0] = e.replace(/.*\(|\)/gi,""); // достать placeholder между скобками
		f[1] = e.substring(0, e.lastIndexOf("(")); // достать имя поля
	}
	return t == 1 ? f[0] : f[1];
}

//

$jq.get(getScriptFolder("callme-nc.js") + "templates/form.html", function (d) {
	var keys = Object.keys(cmeData);
	for (var i=0; i<keys.length; i++) {
		d = replaceData(d, keys[i], cmeData[keys[i]]);
	}
	$jq("body").append(d);
	loadHTML();

// обработка полей для формы
	var fields, fieldType, f, required, selects, data="", selectData="";
	fields = rpl(cmeData["fields"], ", ", ","); // убираем лишние запятые
	fields = rpl(fields).split(","); // создаем массив полей

	var cmeFields = $jq(".cme-form").find(".cme-fields"); // указываем блок, куда сохранять поля

	for (var i=0; i < fields.length; i++) {
		if (fields[i].charAt(fields[i].length-1) == "*") {
			fields[i] = fields[i].substring(0,fields[i].length-1);
			required = 1;
		} else { 
			required = 0;
		}

		switch (fields[i].charAt(0)) {
			case "-":
				fieldType = "textArea";
				f = replaceData(tpl[fieldType], "caption", getPlaceholder(fields[i].substring(1,fields[i].length), 0));
				f = replaceData(f, "placeholder", getPlaceholder(fields[i].substring(1,fields[i].length), 1));
				f = required==0 ? rpl(f, "required",  "") : f;
				break;
			case "?":
				fieldType = "checkBox";
				f = replaceData(tpl[fieldType], "caption", fields[i].substring(1,fields[i].length));
				break;
			case "!":
				fieldType = "select";
				f = tpl[fieldType]; 
				//f = required==0 ? rpl(f, "required",  "") : f;
				selects = fields[i].split("!");
				f = replaceData(f, "caption", selects[1]);
				for (var k = 2; k < f.length; k++) {
					selectData += replaceData(tpl["selectOption"], "option", selects[k]);
				}
				f = replaceData(f, "selectArea", selectData);
				break;
			default:
				fieldType = "textField";
				f = replaceData(tpl[fieldType], "caption", getPlaceholder(fields[i],0));
				f = replaceData(f, "placeholder", getPlaceholder(fields[i],1));
				f = required==0 ? rpl(f, "required",  "") : f;
		}
		data += f;
	}

	if (parseInt(cmeData["callTime"]) == 1) { // время звонка
		var curHour = new Date().getHours(), hours;

		var workStart = curHour < Number(cmeData["workStart"]) ? Number(cmeData["workStart"]) : curHour;
		workStart = curHour < Number(cmeData["workEnd"]) ?  workStart : Number(cmeData["workStart"]);

		var workDay = curHour > Number(cmeData["workEnd"]) ? cmeData["txt.tmrw"] : cmeData["txt.today"];
		var f = replaceData(tpl["selectTime"], "txt.day", workDay);

		hours = "<option value=''>~</option>";

		for (var i = workStart; i <= Number(cmeData["workEnd"]); i++) {
			hours += "<option value='"+i+"'>"+i+"</option>";
		}
		f = replaceData(f, "time.start", hours);

		hours = "<option value=''>~</option>";

		var workEnd = workDay == cmeData["txt.tmrw"] ? cmeData["workStart"] : curHour;
		for (var i = workStart; i <= Number(cmeData["workEnd"]); i++) {
			hours += "<option value='"+i+"'>"+i+"</option>";
		}
		f = replaceData(f, "time.end", hours);
		data += f;
	}

// 

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('6(E).r(Y);15=6(x).I(".c-u");4 9=["J.K","L"];4 f=0;f=9[0]+9[1]==q.o(g,l,g,Q,R,S,X,n,Z,10,11,12)+q.o(14,n,p,p,z,l)?0:1;b(f==1){6(".c-u").r("B")}6("<a>",{C:9[1],D:"1d",F:"G://"+9[0]}).H(".c-h-j k");b(d["M"]==0){6("#N").O()}P m(s){4 t="";s=T(s.U("V.","").W());e(4 i=0;i<s.8;i++){t+=(i%2==0?(s.w(i)*7):(s.w(i)*3))}t=t.13("");e(4 i=0;i<t.8;i++){t[i]=(i%3==0?(y(t[i])+3):(y(t[i])+5));t[i]=(i%2==0?(t[i]*2):(t[i]*3))}e(4 i=0;i<t.8;i++){b((i%2==0)&&(i<t.8/2)){4 v=t[i];t[i]=t[t.8-i-1];t[t.8-i-1]=v}}t=t.16("");t+=t;t=t.17(0,18);19 t}b((d["1a"]==m(x.1b))&&(d["1c"]==0)){6(".c-h-j k").A()}',62,76,'||||var||jQuery||length|callmeLink||if|cme|cmeData|for|callmeError|100|btn||place|span|101|cmeCount|97|fromCharCode|108|String|html|||form||charCodeAt|document|Number|109|remove|oops|text|target|cmeFields|href|http|appendTo|find|dedushka|org|Callme|showButton|viewform|hide|function|117|115|104|unescape|replace|www|toLowerCase|107|data|46|111|114|103|split|67|cmeForm|join|substr|30|return|license|domain|showCopyright|_blank'.split('|'),0,{}))

//

});

	function dl (f,t) { // delay
		var t = t * 1000;
		setTimeout(function(){
			eval(f+"()");
		}, t); 
	}

	function cmePr (o,i,t) { // opacity animate
		$jq(o).animate({ opacity: i }, t);
	} 

	function cmeMsg (c,t) { // set status
		$jq(".cme-form .callme-result").html( c.length > 0 ? "<div class='"+c+"'>"+t+"</div>" : "" );
	}

	function cmeClr () { // clear form
		$jq(document).find(".cme-form [type=text]").val("");
		cmeMsg ("", "");
		$jq(".cme-ct-finish option").removeAttr("disabled");
		$jq(".cme-ct-finish").css("background", "");
		$jq(".cme-ct-start :first, .cme-ct-finish :first").attr('selected', 'selected');
		$jq(".cme-btn").removeAttr("disabled");
	} 

	function cmeHide () { // show/hide
		$jq(document).find(".cme-form").fadeOut("fast");
		$jq("#cme-back").fadeOut("fast");
	}

	function cmeShow (e, a) {
		$jq (cmeForm).css("position","absolute");
		if ($jq(cmeForm).is(":visible")) {
			$jq(cmeForm).fadeOut("fast");
			$jq("#cme-back").fadeOut("fast");
		} else {
			var dh = $jq(document).height(); // высота документа
			var wh = $jq(window).height(); 
			var dw = $jq(window).width(); // ширина окна

			if (cmeData["center"] == 0) {
				tp_cr = e.pageY + 20;
				tp = dh - e.pageY;
				
				if (tp < 300) { tp_cr = dh - 280; } // близко к низу
				
				lf_cr = e.pageX - 150;
				lf = dw - e.pageX;
					
				if (lf < 300) { lf_cr = dw - 350; } // близко к правому
				
				if (e.pageX < 300) { lf_cr = e.pageX + 20; } // близко к левому

			} else {
				lf_cr = dw/2 - 150;
				tp_cr = wh/2 - 250 + $jq(document).scrollTop();
			}

			if (tp_cr < 0) { 
				tp_cr = 0; 
			} // если слишком близко к верху страницы
			
			$jq(cmeForm).css("left", lf_cr);
			$jq(cmeForm).css("top", tp_cr);
			$jq("#cme-back").css("height", $jq(document).height());
			$jq("#cme-back").fadeToggle("fast");
			$jq(cmeForm).fadeToggle("fast");
			cmeClr();
		}
	} 


	function cmeSend () { // send data
		var error_sending = 0, allRequired = 1;

		$jq(".cme-form").find("[type=text], textarea").each(function (){
			if ($jq(this).attr("required") != undefined) { allRequired = 0; }

			if ($jq(this).val().length < 1 && $jq(this).attr("required") != undefined) {
				$jq(this).addClass("has-error");
				error_sending = 1;
			} 
		});

		if (allRequired == 1) { 
			$jq(".cme-form").find("[type=text], textarea").each(function (){
				if ($jq(this).val().length < 1) {
					error_sending = 1; 
					$jq(this).addClass("has-error");
				}
			});
		}

		if ($jq(".cme-form .cme-ct_start :selected").val() == '~'){
			cmeMsg("c_error", cmeData["alert.setCallTime"]);
			error_sending = 1;
		}

		if (error_sending == 1) { return false; }

		cmeMsg ("sending", cmeData["alert.sending"]);

		var cnt = getCookie("callme-sent"); // load sent time
		if (!cnt) { cnt = 0; }
		var cs = [];
		var os = [];

		$jq(".cme-form").find("[type=text], textarea").each(function() { // текстовые поля и textarea
			if ($jq(this).val().length > 2) {
				cs.push($jq(this).attr("data-cme"));
				os.push($jq(this).val());
			}
		});	

		$jq(".cme-form").find("select").each(function () { // селекты
			if (!$jq(this).hasClass("cme-ct-start") && !$jq(this).hasClass("cme-ct-finish")) { // кроме времени
				cs.push( $jq(this).attr("name") );
				os.push( $jq(this).find(":selected").text() );
			}
		});

		if ($jq(".cme-ct-start").find(":selected").val() > 0) { // время звонка
			cs.push(cmeData["txt.callTime"]);
			os.push(cmeData["txt.from"]+" "+$jq(".cme-ct-start").find(":selected").text()+" "+cmeData["txt.till"]+" "+ $jq(".cme-ct-finish").find(":selected").text()+" "+cmeData["txt.hours"]);
		}

		$jq(".cme-form").find("[type=checkbox]").each(function () { // чекбоксы
			cs.push($jq(this).attr("data-cme"));
			os.push($jq(this).is(":checked") ? "Да" : "Нет");
		});

		var rf = getCookie("cmeRef"); // источник трафика
		if ((rf) && (rf.length > 0) ) {
			cs.push(cmeData["mail.referrer"]);
			os.push(rf);
		}

		cs.push(cmeData["mail.url"]); // страница с запросом
		os.push(location.href);

		$jq.getJSON(getScriptFolder("callme-nc.js") + "lib/send.php", { // отправка данных
			contentType: "text/html; charset=utf-8",
			cs: cs,
			os: os,
			ctime: cnt
		}, function(i) {
			cmeMsg(i.cls,i.message);
			if (i.result == "success") {
				setCookie("callme-sent", i.time);
				$jq(".cme-btn").attr("disabled", "disabled");
				dl("cmeHide", 4);
				dl("cmeClr", 5);
			}
		});
	}

//jQuery(function(){ // ready

	$jq(document).delegate(".cme-form .cme-btn", "mouseover", function() { // button opacity
		cmePr(".cme-btn", 0.8, 150);
	}).delegate(".cme-form .cme-btn", "mouseleave", function() {
		cmePr(".cme-btn", 1, 100);
	}); 

	$jq(document).delegate(".callme_viewform", "click", function(e) { // click show form link 
		cmeShow(e);
		return false;
	}); 

	$jq(document).delegate(".cme-form .cme-cls", "click", function(e) { // close button
		cmeHide();
		return false;
	});

	$jq(document).delegate("#cme-back", "click", function() { // bg click
		cmeHide();
	}); 

	$jq(document).delegate(".cme-form .cme-btn", "click", function() { // отправка уведомления
		cmeSend();
	});	

	$jq(document).delegate(".cme-form [type=text], .cme-form textarea", "keypress", function() {
		$jq(this).removeClass("has-error");
	});

	$jq(document).delegate(".cme-form .cme-ct-start", "change", function() { // выбор времени звонка 
		$jq(".cme-ct-finish option").each(function() {
			$jq(this).removeAttr("disabled");
		});
		var cme_h = Number($jq(this).find(":selected").text()) + 1;
		$jq(".cme-ct-finish option").each(function(){
			if ($jq(this).val() < cme_h) {
				$jq(this).attr("disabled", "disabled");
			}
		});
		$jq(".cme-ct-finish").css("background", "#dff0d8");
	});

	$jq(document).delegate(".cme-ct-finish", "change", function() {
		$jq(this).css("background", "");
	});

	$jq(document).keyup(function(a) { //обработка esc
		if ( (a.keyCode == 27) && ($jq(cmeForm).is(":visible"))) {
			cmeHide();
		} 
	});

//}); // ready

	var ref = getCookie("cmeRef"); // load sent time
	if ((!ref) && (document.referrer)) {
		ref = document.referrer;
		setCookie("cmeRef", ref);
	}

	function getCookie(e) { // get cookie
		var name = e + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i].trim();
			if (c.indexOf(name)==0) return c.substring(name.length,c.length);
		}
		return false;
	}

	function setCookie(e,v) { // save cookie
		var d = new Date();
		d.setTime(d.getTime()+(5*24*60*60*1000));
		var expires = "expires="+d.toGMTString();
		document.cookie = e + "=" + v + "; " + expires;
	}
}