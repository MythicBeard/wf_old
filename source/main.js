/*
if ('speechSynthesis' in window) {
 // Synthesis support. Make your web apps talk!
}

if ('SpeechRecognition' in window) {
  // Speech recognition support. Talk to your apps!
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


/* ----- Auto refresh ----- */
var refresh = {};
refresh.start = function () {
	refresh.interval = setInterval(function(){get_data();}, 10000);
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
};


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
		msg.rate = 1.1;
		msg.volume = .8;
		synth.speak(msg);
		console.log(this);
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
};


/* ------ Tracking ----- */
var track = {
	'old': {
		'alerts': {},
		'fissures': {},
		'invasions': {},
	},
	'tracking': {
		'alerts': true,
		'cetus': true,
		'fissures': false,
		'invasions': false,
	},
	'bad': [],
};

track.alerts = function (alerts) {
	if (!track.tracking.alerts)
		return;
	for (let i=0; i<alerts.length; i++) {
		var at = alerts[i];
		if (track.old.alerts[at.id])
			continue;
		if (at.expired) {
			delete track.old.alerts[key];
			continue;
		}
		var d = new Date();
		var t = d.getTime();
		track.old.alerts[at.id] = t;
		if (at.mission.reward.itemString == '')
			at.mission.reward.itemString = at.mission.reward.credits+' Credits';
		speech.addqueue('On alert is... '+at.mission.reward.itemString);
	}
	for (let key in track.old.alerts) {
		var d = new Date();
		var t = d.getTime();
		var diff = t-Number(track.old.alerts[key]);
		if (diff > 3600000)
			delete track.old.alerts[key];
	}
};



/* totop button */





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
	if (wf.cetusCycle.isDay) cetusc.time = 'Day'; else cetusc.time = 'Night';
	$('#cetusCycle #time').html(cetusc.time);
	$('#cetusCycle #sundial').html('<img src="source/time-'+cetusc.time+'.png">');
	var cetusLeft = wf.cetusCycle.timeLeft.replace(new RegExp(" \\d+s","g"), '');
	$('#cetusCycle #left').html(cetusLeft);


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
		$('#voidTrader #open').html(' &nbsp;(click for inventory)');
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
			+ '<td class="vt_ducats">'+item.ducats+'</td>'
			+ '<td class="vt_credits">'+item.credits+'</td>'
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
			'tier': fiss.tier,
			'type': fiss.missionType,
			'eta': fiss.eta.replace(new RegExp("\\d+s","g"), ''),
			'node': fiss.node.replace(' (', ', ').replace(')', ''),
		})
	}
	var show_fiss = function (fiss) {
		let html = '<td class="fs_tier">'+fiss.tier+'</td>'
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


	/* ----- Invasions ----- */
	$('#invasions #info tr').remove();
	for (let i=0; i<wf.invasions.length; i++) {
		var inv = {};
		inv.prog = Math.floor(wf.invasions[i].completion);
		if (wf.invasions[i].completed) continue;
		inv.node = wf.invasions[i].node.replace(' (', ', ').replace(')', ' (');
		inv.node = inv.node+''+inv.prog+'%)';
		inv.atk_reward = wf.invasions[i].attackerReward.asString.replace('Mutalist ', '').replace('Blueprint', 'BP').replace(' Coordinate', '').replace(' Injector', '').replace(' Mass', '');
		if (wf.invasions[i].attackerReward.asString == '') inv.a_thumb = ''; else inv.a_thumb = wf.invasions[i].attackerReward.thumbnail;
		inv.def_reward = wf.invasions[i].defenderReward.asString.replace('Mutalist ', '').replace('Blueprint', 'BP').replace(' Coordinate', '').replace(' Injector', '').replace(' Mass', '');
		inv.reward = '<td class="inv_reward inv_'+wf.invasions[i].defendingFaction+'">'
			+ '<div class="inv_atk"><img src="'+inv.a_thumb+'" onerror="this.style.display=\'none\'" alt="">'+inv.atk_reward+'</div>'
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

	

	$('#header #refresh').css('color', 'rgb(0,155,0)');
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




