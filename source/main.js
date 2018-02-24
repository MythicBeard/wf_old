var loading = true;
/*
if ('speechSynthesis' in window) {
 // Synthesis support. Make your web apps talk!
}
else {
	
}
*/

/* ----- Header shrink ----- */
var scrollD = function () {
	$('#header').css('height', '40px').css('padding-top', '3px').css('font-size', '20px');
	$('#header #icons').css('top', '10px');
	$('#header img').css('height', '30px');
};

var scrollU = function () {
	$('#header').css('height', '80px').css('padding-top', '25px').css('font-size', '24px');
	$('#header #icons').css('top', '29px');
	$('#header img').css('height', '40px');
};

$(document).scroll(function(e) {
	$(window).scrollTop() > 10 ? scrollD() : scrollU();
});


/* ----- Collapse Tab ----- */
var collapse_tab = function (tab) {
	var ht = $('#'+tab).css('height');
	if (ht === '40px') {
		//$('#'+tab).css('height', 'auto');
		$('#'+tab).animate({
			height: $('#'+tab).get(0).scrollHeight
		}, 200, function(){
			$(this).height('auto');
		});
		$('#'+tab+' .collapse_tab').css('color', 'rgb(0,155,0)');
	}
	else {
		//$('#'+tab).css('max-height', '40px');
		$('#'+tab).stop().animate({'height': '40px'}, 200);
		$('#'+tab+' .collapse_tab').css('color', 'rgb(225,0,0)');
	}
	var audio = new Audio('source/click1.mp3');
	audio.play();
};


/* ----- Auto refresh ----- */

var refresh = {
	'rate': 30,
};
refresh.start = function () {
	var rate = refresh.rate*1000;
	clearInterval(refresh.interval);
	refresh.interval = setInterval(function(){get_data();}, rate);
	$('#header #refresh').css('color', 'rgb(0,155,0)');
	refresh.on = true;
};
refresh.start();

refresh.stop = function () {
	clearInterval(refresh.interval);
	$('#header #refresh').css('color', 'rgb(155,0,0)');
	refresh.on = false;
};

refresh.toggle = function () {
	if (refresh.on)
		refresh.stop();
	else {
		get_data();
		refresh.start();
	}
	var audio = new Audio('source/click1.mp3');
	audio.play();
};

setTimeout(function(){
	$('#rrate').on('input',function(e){
		refresh.rate = $('#rrate').val();
		if (refresh.rate == '')
			refresh.rate = 30;
		if (refresh.rate < 5)
			refresh.rate = 5;
		refresh.start();
	});
}, 100);


/* ----- Speech ----- */
var speech = {
	'on': true,
	'queue': {},
};
speech.voices = window.speechSynthesis.getVoices();
speech.settings = {
	'all': true,
	'alerts': true,
	'fissures': true,
	'invasions': false,
	'cetusalarm': true,
};
	
speech.say = function (phrase) {
	if (!speech.on)
		return;
	var synth = window.speechSynthesis;
	speech.voices = window.speechSynthesis.getVoices();
	var voice = setInterval(function() {
		if (!speech.voices || speech.voices.length == 0)
			return;
		
		var msg = new SpeechSynthesisUtterance(phrase);
		msg.voice = speech.voices[4];
		msg.pitch = 1.1;
		msg.rate = 1;
		var vol;
		if (vol !== '')
			vol = ($('#volume').val())/100;
		else {
			$('#volume').val(0);
			vol = 0;
		}
		if (vol > 1)
			vol = 1;
		else if (vol < 0.00)
			vol = 0;
		msg.volume = vol;
		synth.speak(msg);
		speech.mute = function () {
			
		};
		clearInterval(voice)
	}, 200);	
};

speech.next = function () {
	var phrase;
	for (let key in speech.queue) {
		phrase = key;
		break;
	}
	if (speech.on)
		speech.say(phrase);
	delete speech.queue[phrase];	
	var total = Object.keys(speech.queue).length;
	if (total !== 0)
		return;
	clearInterval(speech.interval);
	delete speech.interval;
};

speech.addqueue = function (phrase) {
	if (!speech.on)
		return;
	speech.queue[phrase] = true;
	if (speech.interval) 
		return;
	speech.next();
	speech.interval = setInterval(speech.next, 3000);
};

speech.togglemute = function () {
	speech.on = !speech.on;
	if (speech.on) {
		$('#header #sound').css('color', 'rgb(0,155,0)');
	}
	else {
		window.speechSynthesis.cancel();
		speech.queue = {};
		$('#header #sound').css('color', 'rgb(155,0,0)');
	}
	var audio = new Audio('source/click1.mp3');
	audio.play();
};


/* ------ Tracking ----- */
var track = {
	'old': {
		'alerts': {},
		'cetusCycle': 0,
		'fissures': {},
		'invasions': {},
	},
	'tracking': {
		'alerts': true,
		'cetusCycle': true,
		'fissures': true,
		'invasions': false,
	},
	'bad': [],
};

var cetus_alarm = {
	15:true,
	10:true,
	5:true,
	3:true,
	1:true,
};
track.cetusCycle = function (time, left) {
	if (!track.tracking.cetusCycle)
		return;
	if (left.match('h'))
		return;
	var min = Number(left.replace('m', ''));
	if (min === track.old.cetusCycle)
		return;
	var stop = true;
	if (cetus_alarm[min])
		stop = false;
	track.old.cetusCycle = min;
	var next;
	if (time === 'Day')
		next = 'night';
	else
		next = 'day';
	if (loading !== true && stop !== true)
		speech.addqueue('Cetus '+next+'time in... '+min+' minutes.');
};


track.alerts = function (alerts) {
	if (!track.tracking.alerts )
		return;
	for (let i=0; i<alerts.length; i++) {
		var at = alerts[i];
		if (track.old.alerts[at.id])
			continue;
		if (at.expired) {
			delete track.old.alerts[at.id];
			continue;
		}
		var d = new Date();
		var t = d.getTime();
		track.old.alerts[at.id] = t;
		if (at.mission.reward.itemString == '')
			at.mission.reward.itemString = at.mission.reward.credits+' Credits';
		if (loading !== true)
			speech.addqueue('Mission alert ... '+at.mission.reward.itemString);
	}
	for (let key in track.old.alerts) {
		var d = new Date();
		var t = d.getTime();
		var diff = t-Number(track.old.alerts[key]);
		if (diff > 3600000)
			delete track.old.alerts[key];
	}
};


track.fissures = function (fissures) {
	if (!track.tracking.fissures)
		return;
	for (let i=0; i<fissures.length; i++) {
		var fs = fissures[i];
		if (track.old.fissures[fs.id])
			continue;
		if (fs.expired) {
			delete track.old.fissures[fs.id];
			continue;
		}
		var d = new Date();
		var t = d.getTime();
		track.old.fissures[fs.id] = t;
		if (loading !== true)
			speech.addqueue('Void fissure ... T'+fs.tierNum+' '+fs.missionType);
	}
	for (let key in track.old.fissures) {
		var d = new Date();
		var t = d.getTime();
		var diff = t-Number(track.old.fissures[key]);
		if (diff > 3600000)
			delete track.old.fissures[key];
	}
};




var toggleoption = function (opt) {
	track.tracking[opt] = !track.tracking[opt];
	if (track.tracking[opt]) {
		$('#'+opt+' .sound_icon').css('color', 'rgb(0,155,0)');
	}
	else {
		$('#'+opt+' .sound_icon').css('color', 'rgb(155,0,0)');
	}
	var audio = new Audio('source/click1.mp3');
	audio.play();
};


setTimeout(function () {
	for (let key in track.tracking) {
		if (!track.tracking[key])
			continue;
		$('#'+key+' .sound_icon').css('color', 'rgb(0,155,0)');
	}
}, 0);










/* ----- Top / Bottom ----- */

$(window).scroll(function(){
	$("#collapse_all").css('top', ($(window).scrollTop()+300) + "px");
	$("#expand_all").css('top', ($(window).scrollTop()+340) + "px");
  	$("#to_top").css('top', ($(window).scrollTop()+300) + "px");
	$("#to_bottom").css('top', ($(window).scrollTop()+340) + "px");
	//$('#to_top').stop().animate({'top': ($(window).scrollTop()+300) + 'px'}, 'fast');
	//$('#to_bottom').stop().animate({'top': ($(window).scrollTop()+340) + 'px'}, 'fast');
});

function to_top() {
	$('html, body').animate({scrollTop: '0px'}, 250);
}

function to_bottom() {
	$('html, body').animate({scrollTop: '10000px'}, 1000);
}


/* ----- Collapse / Expand ----- */
var collapse_all = function () {
	$('.info_box').each(function( index ) {
		var id = $(this).attr('id');
		if (id != 'conclave') {
			//$('#'+id).css('height', '40px');
			$('#'+id).stop().animate({'height': '40px'}, 200);
			$('#'+id+' .collapse_tab').css('color', 'rgb(225,0,0)');
		}
	});
	var audio = new Audio('source/click1.mp3');
	audio.play();
};
var expand_all = function () {
	$('.info_box').each(function( index ) {
		var id = $(this).attr('id');
		//$('#'+id).css('height', 'auto');
		$('#'+id).animate({
			height: $('#'+id).get(0).scrollHeight
		}, 200, function(){
			$(this).height('auto');
		});
		$('#'+id+' .collapse_tab').css('color', 'rgb(0,155,0)');
	});
	var audio = new Audio('source/click1.mp3');
	audio.play();
};





/* ---- Load Everything ----- */
var get_data = function () {
$('#header #refresh').css('color', 'rgb(185,185,0)');
var wf = {};
$.getJSON('https://ws.warframestat.us/pc', function (data) {
	wf = data;
	
	/* ----- Sorties ----- */
	var sortie = {
		'hr': wf.sortie.eta.match(new RegExp("\\d+h")),
	};
	if (wf.sortie.eta.match(new RegExp("\\d+m")))
		sortie.mn = wf.sortie.eta.match(new RegExp("\\d+m"));
	else
		sortie.mn = '0m';
	sortie.hr = Number(sortie.hr[0].replace('h', ''));
	sortie.mn = sortie.mn[0].replace('m', '');
	$('#sorties #left').html(sortie.hr+'h '+sortie.mn+'m');
	
	
	/* ----- Rep ----- */
	$('#rep #left').html((sortie.hr+7)+'h '+sortie.mn+'m');


	/* ----- Cetus Cycle ----- */
	var cetusc = {
		'Day': 'rgb(255,255,0)',
		'Night': 'rgb(0,125,255)'
	};
	if (wf.cetusCycle.isDay)
		cetusc.time = 'Day';
	else 
		cetusc.time = 'Night';
	$('#cetusCycle #time').html(cetusc.time);
	$('#cetusCycle #sundial').html('<img src="source/time-'+cetusc.time+'.png">');
	var cetusLeft = wf.cetusCycle.timeLeft.replace(new RegExp(" \\d+s","g"), '');
	$('#cetusCycle #left').html(cetusLeft);
	
	setTimeout(function(){ track.cetusCycle(cetusc.time, cetusLeft); }, 3000);


	// Daily Deal (Darvo) ----- */
	let darvos = wf.dailyDeals;
	$('#dailyDeals #info tr').remove();
	for (let i=0; i<darvos.length; i++) {
		let deal = {};
		deal.item = '<td class="dv_item">'+darvos[i].item+'</td>';
		deal.price = '<td class="dv_price"><span style="text-decoration: line-through; color: darkgrey;">'+darvos[i].originalPrice+'</span> '+darvos[i].salePrice+' (-'+darvos[i].discount+'%)</td>';
		deal.sold = '<td class="dv_sold">'+darvos[i].sold+'/'+darvos[i].total+'</td>';
		deal.time = '<td class="dv_time">'+darvos[i].eta.replace(new RegExp("\\d+s","g"), '')+'</td>';
		$('#dailyDeals #info').append('<tr>'+deal.item+deal.price+deal.sold+deal.time+'</tr>');
	}


	/* ----- Void Trader (Baro) ----- */
	var vt = {};
	if (wf.voidTrader.active) {
		vt.active = ''; 
		vt.left = wf.voidTrader.endString.replace(new RegExp("\\d+s","g"), '');
		$('#voidTrader #open').html(' &nbsp;(view inventory)');
	}
	else {
		vt.active = 'Arriving in';
		vt.left = wf.voidTrader.startString.replace(new RegExp("\\d+s","g"), '');
	}
	$('#voidTrader #active').html(vt.active);
	$('#voidTrader #left').html(vt.left);
	// if inventory > 0
	$('#preview #info tr').remove();
	for (let i=0; i<wf.voidTrader.inventory.length; i++) {
		var item = wf.voidTrader.inventory[i];
		item.credits = item.credits.toString().replace(new RegExp("000$","g"), 'k');
		item.credits = wf.voidTrader.inventory[i].credits.replace('000', ',000');
		var html = '<td class="vt_item">'+item.item+'</td>'
			+ '<td class="vt_ducats">'+item.ducats+'<img src="source/ducat.png"></td>'
			+ '<td class="vt_credits">'+item.credits+'<img src="source/credits.png"></td>'
		;
		$('#preview #info').append('<tr>'+html+'</tr>');
		if (i < wf.voidTrader.inventory.length-1)
			$('#preview #info').append('<tr class="al_spacer"><td colspan="3"></td></tr>');
	}
	


	/* ----- Events ----- */
	$('#events #info tr').remove();
	for (let i=0; i<wf.events.length; i++) {
		var evt = {};
		evt.name = wf.events[i].description;
		evt.reward = wf.events[i].rewards[0].asString;
		evt.eta = Math.floor(wf.events[i].health);
		let html = '<td class="evt_name">'+evt.name+'</td>'
			+ '<td class="evt_reward"><img src="'+wf.events[i].rewards[0].thumbnail+'" onerror="this.style.display=\'none\'" alt="">'+evt.reward+'</td>'
			+ '<td class="evt_eta">'+evt.eta+'% HP</td>'
		;
		evt.background = 'linear-gradient(to right, rgba(0, 105, 0, 1),	rgba(0, 105, 0, 1) '+evt.eta+'%, black, black, rgba(105, 0, 0, 1) '+evt.eta+'%, rgba(105, 0, 0, 1))';
		$('#events #info').append('<tr style="background: '+evt.background+'">'+html+'</tr>');
	}
	

	/* ----- Alerts ----- */
	$('#alerts #info tr').remove();
	for (let i=0; i<wf.alerts.length; i++) {
		if (wf.alerts[i].expired === true)
			continue;
		var alr = {};
		alr.icon_class = 'thumb effectScale';
		alr.icon = '<td class="al_icon"><img class="'+alr.icon_class+'" src="'+wf.alerts[i].mission.reward.thumbnail+'" alt=""></td>';
		alr.reward = '<td class="al_reward">'+wf.alerts[i].mission.reward.asString.replace(new RegExp("\\+ \\d+cr","g"), '').replace('Blueprint', 'BP')+
			'</br>'+wf.alerts[i].eta.replace(new RegExp("\\d+s","g"), '')+'</td>';
		alr.mission = '<td class="al_mission">'+wf.alerts[i].mission.type+'</br>'+wf.alerts[i].mission.minEnemyLevel+'-'+wf.alerts[i].mission.maxEnemyLevel+'</td>';
		$('#alerts #info').append('<tr>'+alr.icon+alr.reward+alr.mission+'</tr>');
		if (i < wf.alerts.length-1)
			$('#alerts #info').append('<tr class="al_spacer"><td colspan="3"></td></tr>');
	}
	setTimeout(function() {track.alerts(wf.alerts);}, 2000);


	/* ----- Fissures ----- */
	$('#fissures #info tr').remove();
	var fisses = {
		'Lith': [],
		'Meso': [],
		'Neo': [],
		'Axi': [],
	};
	for (let i=0; i<wf.fissures.length; i++) {
		var fiss = wf.fissures[i];
		fisses[fiss.tier].push({
			'tier': fiss.tierNum,
			'type': fiss.missionType,
			'eta': fiss.eta.replace(new RegExp("\\d+s","g"), ''),
			'node': fiss.node.replace(' (', ', ').replace(')', ''),
		})
	}
	var show_fiss = function (fiss) {
		let html = '<td class="fs_tier">T'+fiss.tier+'</td>'
			+ '<td class="fs_type">'+fiss.type+'</td>'
			+ '<td class="fs_eta">'+fiss.eta+'</td>'
			+ '<td class="fs_node">'+fiss.node+'</td>'
		;
		$('#fissures #info').append('<tr>'+html+'</tr>');
	};
	for (let i=0; i<fisses.Lith.length; i++) show_fiss(fisses.Lith[i]);
	$('#fissures #info').append('<tr class="fs_spacer"><td colspan="4"</tr>');
	for (let i=0; i<fisses.Meso.length; i++) show_fiss(fisses.Meso[i]);
	$('#fissures #info').append('<tr class="fs_spacer"><td colspan="4"</tr>');
	for (let i=0; i<fisses.Neo.length; i++) show_fiss(fisses.Neo[i]);
	$('#fissures #info').append('<tr class="fs_spacer"><td colspan="4"</tr>');
	for (let i=0; i<fisses.Axi.length; i++) show_fiss(fisses.Axi[i]);
	
	setTimeout(function() {track.fissures(wf.fissures);}, 1500);


	/* ----- Invasions ----- */
	$('#invasions #info tr').remove();
	for (let i=0; i<wf.invasions.length; i++) {
		var inv = {};
		inv.prog = Math.floor(wf.invasions[i].completion);
		if (wf.invasions[i].completed) continue;
		inv.node = wf.invasions[i].node.replace(' (', ', ').replace(')', ' (');
		inv.node = inv.node+''+inv.prog+'%)';
		inv.atk_reward = wf.invasions[i].attackerReward.asString.replace('Mutalist ', '').replace('Blueprint', 'BP').replace(' Coordinate', '').replace(' Injector', '').replace(' Mass', '');
		if (wf.invasions[i].attackerReward.asString == '')
			inv.a_thumb = 'source/credits.png'; 
		else 
			inv.a_thumb = wf.invasions[i].attackerReward.thumbnail;
		inv.def_reward = wf.invasions[i].defenderReward.asString.replace('Mutalist ', '').replace('Blueprint', 'BP').replace(' Coordinate', '').replace(' Injector', '').replace(' Mass', '');
		inv.reward = '<td class="inv_reward inv_'+wf.invasions[i].defendingFaction+'">'
			+ '<div class="inv_atk"><img src="'+inv.a_thumb+'" onerror="this.style.display=\'none\'" alt="" style="height: 15px;">'+inv.atk_reward+'</div>'
			+ '<div class="inv_node">'+inv.node+'</div>'
			+ '<div class="inv_def">'+inv.def_reward+'<img src="'+wf.invasions[i].defenderReward.thumbnail+'" onerror="this.style.display=\'none\'" alt=""></div>'
			+ '<div id="inv_'+wf.invasions[i].id+'" class="inv_prog"></div></td>'
		;
		$('#invasions #info').append('<tr>'+inv.reward+'</tr>');
		$('#inv_'+wf.invasions[i].id).css('width', inv.prog+'%').addClass('inv_'+wf.invasions[i].attackingFaction);
	}
	
	
	/* ----- News ----- */
	$('#news #info tr').remove();
	for (let i=wf.news.length-1; i>=0; i--) {
		var news = {
			'msg': wf.news[i].message,
			'link': wf.news[i].link,
			'eta': wf.news[i].eta.replace(new RegExp("\\d+s","g"), ''),//.replace('in ', '').replace(' ago', ''),
		};
		let html = '<td>['+news.eta+']</br><a href="'+news.link+'" target="_blank">'+news.msg+'</a></td>';
		$('#news #info').append('<tr>'+html+'</tr>');	
	}
	
	
	/* ----- Market ----- */
	$('#market #info tr').remove();
	for (let i=0; i<wf.flashSales.length; i++) {
		var sale = {
			'item': wf.flashSales[i].item,
			'price': wf.flashSales[i].premiumOverride+' (-'+wf.flashSales[i].discount+'%)',
			'discount': wf.flashSales[i].discount,
			'eta': wf.flashSales[i].eta.replace(new RegExp("\\d+s","g"), ''),
		};
		sale.price = sale.price.replace('000', 'k');
		let html = '<td class="sale_item">'+sale.item+'</td>'
			+ '<td class="sale_price">'+sale.price+'</td>'
			+ '<td class="sale_eta">'+sale.eta+'</td>'
		;
		$('#market #info').append('<tr>'+html+'</tr>');
	}		


	/* ----- Cephalon Simaris ----- */
	$('#simaris #info tr').remove();
	var simar = {
		'target': wf.simaris.target,
	}
	if (wf.simaris.isTargetActive)
		simar.active = "Active";
	else
		simar.active = "Inactive";
	simar.html = '<td class="simar_target"><a href="https://steamcommunity.com/sharedfiles/filedetails/?id=666483447" target="_blank">'+simar.target+'</a></td><td class="simar_active">'+simar.active+'</td>';
	$('#simaris #info').append('<tr>'+simar.html+'</tr>');

	
	/* ----- Finish ----- */
	$('#header #refresh').css('color', 'rgb(0,155,0)');
	if (loading !== false)
		setTimeout(function () { loading = false; }, 9000);
});
};
get_data();

// Preview Void Stuff
var preview_close = function () {
	$('#preview_wrap').css('visibility', 'hidden');
};
var preview_open = function () {
	$('#preview_wrap').css('visibility', 'visible');
};
$(document).keydown(function(e) {
    // ESCAPE key pressed
    if (e.keyCode == 27) {
        preview_close();
    }
});




