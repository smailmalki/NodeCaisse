const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');

$( "#popmsg" ).load( "modals/popmsg.html" );
$( "#ModalTicket" ).load( "modals/modal_ticket.html" );
$( "#ModalListTicket" ).load( "modals/ModalListTicket.html" );

var path=window.location.href.replace("stats.html","").replace("file:///","");
$('.myTableP').on('click', '.clickable-row', function(event) {
	$(this).addClass('active').siblings().removeClass('active');
});
var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var db = new sqlite3.Database(path+'db/caisse.db');
$('.myTableCXZ').on('click', '.clickable-row', function(event) {
		$(this).addClass('active').siblings().removeClass('active');
		$('#TbTick > tbody').html("");
		$('#TbServ > tbody').html("");
		if ($(this).find('td:first').html()=="X") {
			db.each("SELECT idt, dte, round(tot,2) tot, tva, service FROM tot where dtez='' group by 1,2", function(err, row) {
				$('#TbTick > tbody').append('<tr class="clickable-row d-flex"><td class="col-2">'+row.idt+'</td><td class="col-3">'+row.dte+'</td><td class="col-2">'+row.tot+'</td><td class="col-2">'+row.tva+'</td><td class="col-2">'+row.service+'</td><td class="col-1"><img src="img/view.png" style="width:20px;cursor:pointer;" data-toggle="modal" data-target="#ModalTicket" onclick="fillTick(\''+row.idt+'\')"></td></tr>');
			});
			db.each("SELECT idv, nom, count(*) nb, sum(round(tot,2)) mont FROM tot, serveur where idv=sv and dtez='' group by 1,2", function(err, row) {
				$('#TbServ > tbody').append('<tr class="clickable-row d-flex"><td class="col-4">'+row.nom+'</td><td class="col-3">'+row.nb+'</td><td class="col-3">'+row.mont.toFixed(2)+'</td><td class="col-2"><img src="img/view.png" style="width:20px;cursor:pointer;" data-toggle="modal" data-target="#ModalListTicket" onclick="fillListTick(\''+row.idv+'\',\''+row.nom+'\',\'\')"></td></tr>');
			});
		} else {
			db.each("SELECT * FROM tot where dtez='"+$(this).find('td:last').attr("z")+"'", function(err, row) {
				$('#TbTick > tbody').append('<tr class="clickable-row d-flex"><td class="col-2">'+row.idt+'</td><td class="col-3">'+row.dte+'</td><td class="col-2">'+row.tot+'</td><td class="col-2">'+row.tva+'</td><td class="col-2">'+row.service+'</td><td class="col-1"><img src="img/view.png" style="width:20px;cursor:pointer;" data-toggle="modal" data-target="#ModalTicket" onclick="fillTick(\''+row.idt+'\')"></td></tr>');
			});
			db.each("SELECT idv, nom, count(*) nb, sum(round(tot,2)) mont FROM tot, serveur where idv=sv and dtez='"+$(this).find('td:last').attr("z")+"' group by 1,2", function(err, row) {
				$('#TbServ > tbody').append('<tr class="clickable-row d-flex"><td class="col-4">'+row.nom+'</td><td class="col-3">'+row.nb+'</td><td class="col-3">'+row.mont.toFixed(2)+'</td><td class="col-2"><img src="img/view.png" style="width:20px;cursor:pointer;" data-toggle="modal" data-target="#ModalListTicket" onclick="fillListTick(\''+row.idv+'\',\''+row.nom+'\',\''+$(this).find('td:last').attr("z")+'\')"></td></tr>');
			});
		}

		
		/*var db = new sqlite3.Database('db/caisse.db');
		$('#TbProduct > tbody').html("");
		db.each("SELECT * FROM prd where idc="+$(this).find('td:first').html(), function(err, row) {
			$('#TbProduct').append('<tr class="clickable-row"><td>'+row.idp+'</td><td>'+row.nom+'</td><td>'+row.prix+'</td><td><a href="#"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer produit\';poptext.innerText=\'Voulez-vous supprimer le produit : '+row.nom+' ?\';popvalid.onclick=function() { supprprd('+row.idc+','+row.idp+') }"><img src="img/trash.png" width=20></img></a></td></tr>');		
		});*/
	  });

sqlite.open(path+'db/caisse.db').then(db=>{
	db.each("SELECT 'Z' zx, count(*) nb, round(sum(tot),2) tot, dtez FROM tot where dtez<>'' group by dtez order by dtez asc;", function(err, row) {
		$('#TbZX').append('<tr class="clickable-row" id="'+row.dtez+'"><td>'+row.zx+'</td><td class="text-center">'+row.nb+'</td><td class="text-center">'+row.tot+'</td><td class="z">'+row.dtez+'</td><td class="pl-0" z="'+row.dtez+'" style="cursor:pointer;" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Imprimer Z\';poptext.innerText=\'Imprimer Z du '+row.dtez+'?\';popvalid.onclick=function() { Imprimer(\''+row.dtez+'\') }"><img src="img/receipt_printer.png"></td></tr>');
	}).then( () => {
		db.each("SELECT 'X' zx, count(*) nb, round(sum(tot),2) tot, dtez FROM tot where dtez='' group by dtez;", function(err, row) {
			$('#TbZX').append('<tr class="clickable-row" id="'+row.dtez+'"><td>'+row.zx+'</td><td class="text-center">'+row.nb+'</td><td class="text-center">'+row.tot+'</td><td class="text-center"><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Cloture\';poptext.innerText=\'Confirmer la cloture\';popvalid.onclick=function() { Cloturer() }">Cloturer</button></td><td class="pl-0" style="cursor:pointer;" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Imprimer X \';poptext.innerText=\'Imprimer X ?\';popvalid.onclick=function() { Imprimer(\'\') }"><img src="img/receipt_printer.png"></td></tr>');
		});
	})
})

var soc="";
var adr="";
var vl="";
var tel="";
var comp1="";
var comp2="";
var comp3="";

db.get("select * from soc", function(error, row2) {
	soc=row2.nom;
	adr=row2.ad;
	vl=row2.cp+' '+row2.vl;
	tel=row2.tl;
	comp1=row2.ic1;
	comp2=row2.ic2;
	comp3=row2.ic2;
});

function fillListTick(sv,nomsv,dtez) {
	//alert(sv)
	console.log("SELECT idt, dte, round(tot,2) tot, tva, service FROM tot where idv="+sv+" and dtez='"+dtez+"' group by 1,2");
	ticklisttitle.innerText=nomsv;
	$('#TbListTicket').html("");
	db.each("SELECT idt, dte, round(tot,2) tot, tva, service FROM tot where idv="+sv+" and dtez='"+dtez+"' group by 1,2", function(err, row) {
		$('#TbListTicket').append('<tr class="clickable-row d-flex"><td class="col-2">'+row.idt+'</td><td class="col-3">'+row.dte+'</td><td class="col-2">'+row.tot+'</td><td class="col-2">'+row.tva+'</td><td class="col-2">'+row.service+'</td><td class="col-1"><img src="img/view.png" style="width:20px;cursor:pointer;" data-toggle="modal" data-target="#ModalTicket" onclick="fillTick(\''+row.idt+'\')"></td></tr>');
	});
}
function fillTick(idt) {
	ticktitle.innerText=idt;
	$('#TbTicket').html("");
	var rw=0;
	db.each("SELECT * FROM tick where idt="+idt, function(err, row) {
		var px;
		if (row.nom.substring(0,5)=="-----") {px="";} else {px=row.prix;}
		$('#TbTicket').append('<tr class="clickable-row d-flex" rw="'+rw+'"><td class="col-10">'+row.nom+'</td><td class="col-2">'+px+'</td></tr>');
		rw++;
	});
}

function Cloturer() { 
	var dte = new Date();
	var time = dte.getFullYear()+'-'+(dte.getMonth()<10?'0':'')+dte.getMonth()+'-'+(dte.getDate()<10?'0':'')+dte.getDate()+'T'+(dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds();
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("update tot set dtez='"+time+"' where dtez is null or dtez=''").then( () => {
			location.reload();
		})
	})
}


function Imprimer(dtez) {

	sqlite.open(path+'db/caisse.db').then(db=>{
		db.get("SELECT * FROM printers where idp=1;").then( (row) => {
			
			var device = getDevice(row.conn,row.params);
			var printer = new escpos.Printer(device);
			device.open(function(){
			printer.font('a')
			printer.align('lt')
			printer.style('normal')
			printer.size(2, 2)
			printer.style('b')
			printer.align('ct')
			if (dtez=="") {
				printer.text("X")
			} else {
				printer.text("Z")
				printer.text(dtez)
			}
			printer.text("")
			printer.align('lt')
			printer.text("Categories :")
			printer.size(1, 1)
			printer.style('normal')
			printer.text("")
			db.each("select cat.nom nom, sum(tick.prix) px from tot,tick,cat where cat.idc=tick.idc and tot.idt=tick.idt and dtez='"+dtez+"' group by 1;", function(err, row) {
				printer.tableCustom([ 
					{ text:row.nom, align:"LEFT", width:0.66 },
					{ text:row.px.toFixed(2), align:"RIGHT", width:0.33 }
				]);
			})
			.then( () => {
				printer.text("")
				printer.text("")
				printer.size(2, 2)
				printer.style('b')
				printer.text("TVA :")
				printer.size(1, 1)
				printer.style('normal')
				printer.text("")
				db.each("select case when service ='Sur Place' or service like 'Table%' then tvas else tvae end || '%'  tva, sum(tick.prix) px from tot,tick,cat where cat.idc=tick.idc and tot.idt=tick.idt and dtez='"+dtez+"' group by 1;", function(err, row) {
					printer.tableCustom([ 
						{ text:row.tva, align:"LEFT", width:0.66 },
						{ text:row.px.toFixed(2), align:"RIGHT", width:0.33 }
					]);
				}).then( () => {
					printer.text("")
					printer.text("")
					printer.size(2, 2)
					printer.style('b')
					printer.text("Service :")
					printer.size(1, 1)
					printer.style('normal')
					printer.text("")
					db.each("select case when service ='Sur Place' or service like 'Table%' then 'Sur Place' else 'A emporter' end service, sum(tick.prix) px from tot,tick,cat where cat.idc=tick.idc and tot.idt=tick.idt and dtez='"+dtez+"' group by 1;", function(err, row) {
						printer.tableCustom([ 
							{ text:row.service, align:"LEFT", width:0.66 },
							{ text:row.px.toFixed(2), align:"RIGHT", width:0.33 }
						]);
					}).then( () => {
						printer.text("")
						printer.text("")
						printer.size(2, 2)
						printer.style('b')
						printer.text("Paiement :")
						printer.size(1, 1)
						printer.style('normal')
						printer.text("")
						db.each("select sum(case when paimt like '%Espèces%' then substr(paimt, instr(paimt,'Espèces:')+8)-0 else 0 end) esp, sum(case when paimt like '%CB%' then substr(paimt, instr(paimt,'CB:')+3)-0 else 0 end) cb, sum(case when paimt like '%Chéque%' then substr(paimt, instr(paimt,'Chéque:')+7)-0 else 0 end) chq from tot where dtez='"+dtez+"';", (error,row) => {
							printer.tableCustom([ 
								{ text:'Espece', align:"LEFT", width:0.66 },
								{ text:row.esp.toFixed(2), align:"RIGHT", width:0.33 }
							]);
							printer.tableCustom([ 
								{ text:'CB', align:"LEFT", width:0.66 },
								{ text:row.cb.toFixed(2), align:"RIGHT", width:0.33 }
							]);
							printer.tableCustom([ 
								{ text:'Cheque', align:"LEFT", width:0.66 },
								{ text:row.chq.toFixed(2), align:"RIGHT", width:0.33 }
							]);
						}).then(() => {
							printer.text("");
							printer.text("");
							printer.cut();
							printer.close();
							$("#popmsg").modal("hide");
						})
					})
				})
			})
		})
	})
	})
	//alert($(e.parentElement).html())
}

function printTicket() {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.get("SELECT * FROM printers where idp=1;").then( (row) => {
			var device = getDevice(row.conn,row.params);
			var printer = new escpos.Printer(device);
			device.open(function(){
				printer.font('a')
				printer.align('ct')
				printer.style('bu')
				printer.size(1, 1)
				if (soc!="")
					printer.text(soc)
				if (adr!="")
					printer.text(adr)
				if (vl!="")
					printer.text(vl)
				if (tel!="")
					printer.text(tel)
				if (comp1!="")
					printer.text(comp1)
				if (comp2!="")
					printer.text(comp2)
				if (comp3!="")
					printer.text(comp3)
				printer.text("");
				printer.text("");
				var tota=0;
				db.each("select count(*) nb, nom, sum(prix) px from tick where idt='"+ticktitle.innerText+"' group by idc,idp;", function(err, row) {
					printer.tableCustom([ 
						{ text:row.nb+'x '+row.nom, align:"LEFT", width:0.66 },
						{ text:row.px.toFixed(2), align:"RIGHT", width:0.33 }
					]);
					tota+=row.px;
				}).then( () => {
					printer.size(2, 2)
					printer.style('b')
					printer.tableCustom([ 
						{ text:'Total', align:"RIGHT", width:0.66 },
						{ text:tota, align:"RIGHT", width:0.33 }
					]);
					printer.size(1, 1)
					printer.style('normal')
					printer.text("");
					printer.text("");
					printer.align("LT");
					printer.text("Client :"+ticktitle.innerText);
					var dte = new Date();
					printer.text( (dte.getDate()<10?'0':'')+dte.getDate()+'/'+(dte.getMonth()<10?'0':'')+dte.getMonth()+'/'+dte.getFullYear() );
					printer.text( (dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds() );
					printer.text("Duplicata");
					/*if ( $("#modetbl").is(":hidden")&&$("#modecmd").is(":hidden")&&$("#modelivr").is(":hidden") ) {
						printer.text($('#txtspemp').text());
					} else if ( $("#modetbl").is(":visible") ) {
						printer.text("Sur Place");
					} else if ( $("#modecmd").is(":visible") ) {
						printer.text("A Emporter");
					} else if ( $("#modelivr").is(":visible") ) {
						printer.text("Livraison");
					}*/
					printer.text("");
					printer.align("CT");
					printer.text("Merci et a bientot");
					printer.text("");
					printer.cut();
					printer.close();
				})
			})
		})
	})
}

function getDevice(conn,param) {
	var device;
	try {
		if (conn=="usb") {
			var devices = escpos.USB.findPrinter();
			device = new escpos.USB();
			//printer = new escpos.Printer(device);
			devices.forEach(function(el) {
				if (el.portNumbers==param.split("-")[0] && el.deviceDescriptor.idVendor==param.split("-")[1] && el.deviceDescriptor.idProduct==param.split("-")[2]) {
					device = new escpos.USB(el);
					//printer = new escpos.Printer(device);
				}
			});
		} else if (conn=="network") {
			device = new escpos.Network(param);
			//printer = new escpos.Printer(device);
		} else if (conn=="serial") {
			device = new escpos.SerialPort(param.split("-")[0]);
			//printer = new escpos.Printer(device);
		} else {
			device = new escpos.USB();
			//printer = new escpos.Printer(device);
		}
		return device;
	} catch(e) {
		
	}
}
