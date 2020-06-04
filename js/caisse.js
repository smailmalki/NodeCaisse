var rw=0;
const { remote, ipcRenderer } = require ('electron');
let mainWindow = remote.getGlobal ('mainWindow');
var path=window.location.href.replace("caisse.html","").replace("file:///","");
var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var db = new sqlite3.Database(path+'db/caisse.db');
var soc="";
var adr="";
var vl="";
var tel="";
var comp1="";
var comp2="";
var comp3="";
var clt=1;
var appel=1;
var dev="";

db.get("Select * from soc;", function(error, row2) {
	if (row2 !== undefined) {
		devise.innerText=row2.devise;
		dev=row2.devise;
	}
});

db.get("Select * from clt;", function(error, row2) {
	if (row2 == undefined) {
		db.run("insert into clt values (1);");
	} else {
		clt=row2.idt;
	}
});
db.get("select * from soc", function(error, row2) {
	soc=row2.nom;
	adr=row2.ad;
	vl=row2.cp+' '+row2.vl;
	tel=row2.tl;
	comp1=row2.ic1;
	comp2=row2.ic2;
	comp3=row2.ic2;
});
db.each("SELECT * FROM cat", function(err, row) {
	$('#catB').append('<div class="card col-12 p-2 m-1" style="min-height:75px" style="cursor:pointer;" onclick="fillP('+row.idc+','+row.tvas+','+row.tvae+','+row.imp+')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'</div></div>');
	//$('#TbCategory').append('<tr class="clickable-row" id="cat'+row.idc+'"><td>'+row.idc+'</td><td>'+row.nom+'</td><td><a href="#"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer catégorie\';poptext.innerText=\'Voulez-vous supprimer la catégorie : '+row.nom+' ?\';popvalid.onclick=function() { supprcat('+row.idc+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
});
db.get("Select * from appel;", function(error, row2) {
	if (row2 == undefined) {
		db.run("insert into appel values (1, 'OFF');");
	} else {
		appel=row2.ida;
		if (row2.act=="ON") {
			$('#hash').attr('bol','ON');

			hash_num.innerText=appel;
			hash_num.style.visibility = "visible";
			resethash.style.visibility = "visible";
			$('#img_hash').attr('src','img/reset.png');
		}
	}
});
$( "#ModalPaiement" ).load( "modals/modal_paiement.html" );
$( "#ModalMenu" ).load( "modals/modal_menu.html" );
$( "#popmsg" ).load( "modals/popmsg.html" );

if (mainWindow) mainWindow.webContents.send ('annulerclient', "0.00");

function fillP(idc,tvas,tvae,imp) {
	$('#prodB').html("");
	db.each("SELECT *, case when menu is null then 0 else menu end menu2 FROM prd where idc="+idc, function(err, row) {
		$('#prodB').append('<div class="card col-3 ml-1 mb-1" style="min-width:100px;max-width:150px;min-height:150px;max-height:200px;" onclick="encaissP('+row.idp+','+row.idc+',\''+row.nom+'\','+row.prix+','+tvas+','+tvae+','+imp+','+row.menu2+')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'<br>'+row.prix+' '+dev+'</div></div>')
	});
}

function fillP2(idc,tvas,tvae,imp, idp) {
	$('#prodB2').html("");
	//alert(idc+" "+idp);
	db.each("SELECT * FROM prd where idc="+idc+" and idp in (select idpi from menu where idp="+idp+")", function(err, row) {
		$('#prodB2').append('<div class="card col-3 ml-1 mb-1" style="min-width:100px;max-width:150px;min-height:150px;max-height:200px;" onclick="encaissP('+row.idp+','+row.idc+',\'----- '+row.nom+'\',\'\','+tvas+','+tvae+','+imp+',0)"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'<br>Inclus</div></div>')
	});
}

function fillTick() {
	$('#TbTicket').html("");
	db.each("SELECT * FROM tick_temp", function(err, row) {
		var px;
		if (row.nom.substring(0,5)=="-----") {px="";} else {px=row.prix+' '+dev;}
		$('#TbTicket').append('<tr class="clickable-row d-flex" rw="'+row.idr+'"><td class="col-7">'+row.nom+'</td><td class="col-3">'+px+'</td><td class="col-2"><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer encaissement\';poptext.innerText=\'Voulez-vous supprimer : '+row.nom+' ?\';popvalid.onclick=function() { supprencaiss('+row.idr+','+row.prix+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
	});
}

function encaissP(idp,idc,nm,px,tvas,tvae,imp,menu) {
	rw++;
	
	$('#TbTicket').append('<tr class="clickable-row d-flex" rw="'+rw+'"><td class="col-7">'+nm+'</td><td class="col-3">'+px+(px!=""?(' '+dev):'')+'</td><td class="col-2"><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer encaissement\';poptext.innerText=\'Voulez-vous supprimer : '+nm+' ?\';popvalid.onclick=function() { supprencaiss('+rw+','+px+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
	
	if (mainWindow) mainWindow.webContents.send ('encaissp', {'rw':rw,'nm':nm,'px':px});
	var dte = new Date();
	
	if (px==""){px=0;}
	var time = dte.getFullYear()+'-'+(dte.getMonth()<10?'0':'')+dte.getMonth()+'-'+(dte.getDate()<10?'0':'')+dte.getDate()+'T'+(dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds();
	//alert("insert into tick_temp values ("+rw+", '"+time+"', "+idp+", "+idc+", '"+nm+"', "+px+", "+tvas+", "+tvae+", "+imp+");");
	db.run("insert into tick_temp values ("+rw+", '"+time+"', "+idp+", "+idc+", '"+nm+"', "+px+", "+tvas+", "+tvae+", "+imp+");");

	if (menu=="1") {
		menutitle.innerText=nm;
		$('#catB2').html("");
		db.each("SELECT distinct cat.* FROM menu, cat, prd where menu.idpi=prd.idp and cat.idc=prd.idc and menu.idp="+idp, function(err, row) {
			$('#catB2').append('<div class="card col-12 p-2 m-1" style="min-height:75px" style="cursor:pointer;" onclick="fillP2('+row.idc+','+row.tvas+','+row.tvae+','+row.imp+','+idp+')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'</div></div>');
		})
		$("#ModalMenu").modal("show");
	}
	var total=(parseFloat($('#tot').text())+px).toFixed(2);
	$('#tot').text(total);
	
	if (mainWindow) mainWindow.webContents.send ('tot', total);
	$('#scrol').animate({ scrollTop: 999999 }, 50);
}

function supprencaiss(rw,px) {
	if (px==null) {px=0;}
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("delete from tick_temp where idr="+rw+";").then( () => {
			fillTick();
			$("#popmsg").modal("hide");	
			var total=(parseFloat($('#tot').text())-px).toFixed(2);
			$('#tot').text(total);
			if (mainWindow) mainWindow.webContents.send ('supprencaiss', "");
			if (mainWindow) mainWindow.webContents.send ('tot', total);
		});
	});	
}

function annulerclient() {
	db.run("delete from tick_temp;");
	$('#TbTicket').html("");
	rw=0;
	$('#tot').text("0.00");
	if (mainWindow) mainWindow.webContents.send ('annulerclient', "0.00");
	$('#popmsg').modal('hide');
}

var device;
var printer;
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');

$('#otir').on('click', function(e) {
	/**
	const { remote, ipcRenderer } = require ('electron');
	let mainWindow = remote.getGlobal ('mainWindow');
	if (mainWindow) mainWindow.webContents.send ('store-data', "Test ok2");
	*/
	/**
	const electron = require('electron').remote;
	const app = electron.app;
	const BrowserWindow = electron.BrowserWindow;
	var ipcRenderer = require('electron').ipcRenderer;
	ipcRenderer.send('store-data', "Test ok");
	*/
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.get("SELECT * FROM printers where idp=1;").then( (row) => {
			getDevice(row.conn,row.params);	
			if (printer) {
				device.open(function(){
					printer
					.print(new Buffer('\x1b\x70\x00\x19\xfa\x1b\x40'))
					.close()
				});
				/*device.open(function(){
					printer
					.print(new Buffer(''))
					.close()
				});*/
			}
		})
	})
})

$('#resethash').on('click', function(e) {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("update appel set ida=1;").then( () => {
			appel=1;
			hash_num.innerText=1;
		})
	})
})
$('#hash').on('click', function(e) {
	if ($('#hash').attr('bol')=='OFF') {
		$('#hash').attr('bol','ON');
		hash_num.innerText=appel;
		hash_num.style.visibility = "visible";
		resethash.style.visibility = "visible";
		$('#img_hash').attr('src','img/reset.png');
		db.run("update appel set act='ON'");
	} else {
		$('#hash').attr('bol','OFF');
		hash_num.style.visibility = "hidden";
		resethash.style.visibility = "hidden";
		$('#img_hash').attr('src','img/hashoff.png');
		db.run("update appel set act='OFF'");
	}
})

$('#tickonoff').on('click', function(e) {
	if ($('#txttickonoff').text()=='ON') {
		db.run("insert or replace into tickonoff values (1,'off')");
		$('#txttickonoff').text("OFF");
		$('#imgtickonoff').attr('src','img/ticket_OFF.png');
	} else {
		db.run("insert or replace into tickonoff values (1,'on')");
		$('#txttickonoff').text("ON");
		$('#imgtickonoff').attr('src','img/ticket_ON.png');
	}
})

$('#spemp').on('click', function(e) {
	if ($('#txtspemp').text()=='Sur Place') {
		$('#txtspemp').text("A Emporter");
		$('#imgspemp').attr('src','img/a_emporter.png');
	} else {
		$('#txtspemp').text("Sur Place");
		$('#imgspemp').attr('src','img/sur_place.png');
	}
})

$('#paie').on('click', function(e) {
	if ($('#tot').text()!="0.00") {
		$("#ModalPaiement").modal("show");
	}
});


function encais() {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.get("SELECT * FROM printers where idp=1;").then( (row) => {
			getDevice(row.conn,row.params);	
			if (printer) {
				device.open(function(){
					printer.font('a')
					printer.align('ct')
					printer.style('bu')
					printer.size(1, 1)
					if ($('#hash').attr('bol')=='ON') {
						printer.size(5, 5)
						printer.text("#"+appel)
						printer.size(1, 1)
						hash_num.innerText=appel+1;
						sqlite.open(path+'db/caisse.db').then(db=>{
							db.run("update appel set ida="+(appel+1)+";").then( () => {
								appel++;
							})
						})
					}
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
					db.each("select count(*) nb, nom, sum(prix) px from tick_temp group by 2 order by dte asc;", function(err, row) {
						printer.tableCustom([ 
							{ text:row.nb+'x '+row.nom, align:"LEFT", width:0.66 },
							{ text:row.px, align:"RIGHT", width:0.33 }
							])
						printer.text("");
						printer.text("");
						printer.align("LT");
						printer.text("Client :"+(clt+1));
						printer.text($('#txtspemp').text());
						printer.text("");
						printer.align("CT");
						printer.text("Merci et a bientot");
						printer.text("");
					}).then( () => {
						printer.cut()
						printer.close()
					})
				})
			}
		}).then(() => {
			var dte = new Date();
			var paimt="";
			var montP=0;
			var arr =[['esp','Espèces'],['cb','CB'],['chq','Chéque'],['av','Avoir']];
			arr.forEach( (it) => {
				if ($('#'+it[0]).val()!="") {
					montP+=+$('#'+it[0]).val();
					paimt+=(paimt==""?'':',')+it[1]+':'+$('#'+it[0]).val();
				}
			})
			
			var ftva="tvae";
			if ($('#txtspemp').text()=='Sur Place') {
				ftva="tvas";
			}
			var time = dte.getFullYear()+'-'+(dte.getMonth()<10?'0':'')+dte.getMonth()+'-'+(dte.getDate()<10?'0':'')+dte.getDate()+'T'+(dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds();
			
			db.run("INSERT INTO tick select "+(clt+1)+" idt, dte, idp, tick_temp.idc, tick_temp.nom, prix, round(prix*(1-(1/(1+(round("+ftva+",2)/100)))),2) from tick_temp;")
			db.run("INSERT INTO tot select "+(clt+1)+" idt, 1010, '"+time+"', '"+paimt+"', sum(prix), round(sum(prix*(1-(1/(1+(round("+ftva+",2)/100))))),2), '"+$('#txtspemp').text()+"','' from tick_temp;")
			db.run("update clt set idt=idt+1;").then(()=> {
				clt++;
				annulerclient()
				cleanmodal()
				$("#ModalPaiement").modal("hide");	
			})
			
		})

		/*
		db.get("SELECT params FROM printers where idp=2;")
		.then( (row) => {
			paramCuisine=row.params;
			devices.forEach(function(el) {
				if (el.portNumbers==paramCuisine.split("-")[0] && el.deviceDescriptor.idVendor==paramCuisine.split("-")[1] && el.deviceDescriptor.idProduct==paramCuisine.split("-")[2]) {
					deviceC = new escpos.USB(el);
				}
			});
			var printer = new escpos.Printer(deviceC);
			deviceC.open(function(){
				printer.font('a')
				printer.align('ct')
				printer.style('bu')
				printer.size(1, 1)
				.text('Cuisine')
				db.each("select * from tick_temp where imp=2 group by 2 order by dte asc;", function(err, row) {
					printer.text(row.nom)
				}).then( () => {
					printer.cut()
					printer.close()
				})
			})
		})
		*/
		
	})

}


function getDevice(conn,param) {
	try {
		if (conn=="usb") {
			var devices = escpos.USB.findPrinter();
			device = new escpos.USB();
			printer = new escpos.Printer(device);
			devices.forEach(function(el) {
				if (el.portNumbers==param.split("-")[0] && el.deviceDescriptor.idVendor==param.split("-")[1] && el.deviceDescriptor.idProduct==param.split("-")[2]) {
					device = new escpos.USB(el);
					printer = new escpos.Printer(device);
				}
			});
		} else if (conn=="network") {
			device = new escpos.Network(param);
			printer = new escpos.Printer(device);
		} else if (conn=="serial") {
			device = new escpos.SerialPort(param.split("-")[0]);
			printer = new escpos.Printer(device);
		} else {
			device = new escpos.USB();
			printer = new escpos.Printer(device);
		}
	} catch(e) {
		
	}
}