var rw=0;

const { remote, ipcRenderer } = require ('electron');
let mainWindow = remote.getGlobal ('mainWindow');
var path=window.location.href.replace("caisse.html","").replace("file:///","");
var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var db = new sqlite3.Database(path+'db/caisse.db');
//var device;
//var printer;
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');
escpos.SerialPort = require('escpos-SerialPort');
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

let code = "";
let reading = false;
document.addEventListener('keypress', e=>{
	//usually scanners throw an 'Enter' key at the end of read
	if (!$('.modal.show').length) {
		if (e.key=="Enter") {
			//alert(code)
			var db = new sqlite3.Database(path+'db/caisse.db');
			db.run("CREATE TABLE IF NOT EXISTS barres (cb NUMBER, nom VARCHAR, prix NUMERIC, tva NUMERIC);");
			db.get("Select * from barres where cb="+code+";", function(error, row) {
				if (row !== undefined) {
					$(cbtext).text(row.nom)
					cbtext.style.color="black"
					encaissP(row.cb,'null',row.nom,row.prix, 'null', row.tva,1,0,'')
					plusbarre.onclick=function() {
						encaissP(row.cb,'null',row.nom,row.prix, 'null', row.tva,1,0,'')
					}
					moinsbarre.onclick=function() {
						db.get("Select max(idr) mx from tick_temp where idp="+row.cb+";", function(error2, row2) {
							supprencaiss(row2.mx,row.prix)
						})
					}
					plusbarre.style.visibility="visible"
					moinsbarre.style.visibility="visible"
				} else {
					$(cbtext).text("non trouvé")
					cbtext.style.color="red"
					plusbarre.style.visibility="hidden"
					moinsbarre.style.visibility="hidden"
				}
			})
		}
		if(code.length>12){
			
			console.log(code);
			/// code ready to use                
			code="";
		//}
		}else{
			//console.log(code);
			$(cbtext).text("")
			$("#modebar").show()
			
			code+=e.key;//while this is not an 'enter' it stores the every key         
			$(codeb).text(code)   
		}
		//run a timeout of 200ms at the first read and clear everything
		if(!reading){
			reading=true;
			setTimeout(()=>{
			//console.log(code);
			//code="";
			reading=false;
		}, 200);}
	}
})

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
	logo=row2.logo;
});

db.each("SELECT * FROM cat", function(err, row) {
	$('#catB').append('<div class="card col-12 p-2 m-1" style="min-height:75px;cursor:pointer;" onclick="$(\'#catB > div\').css(\'background-color\',\'\');$(this).css(\'background-color\',\'lightgreen\');fillP('+row.idc+','+row.tvas+','+row.tvae+','+row.imp+')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'</div></div>');
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
			resethash.parentElement.style.visibility = "visible";
			$('#img_hash').attr('src','img/reset.png');
		}
	}
});

db.get("Select * from tickonoff;", function(error, row2) {
	if (row2 == undefined) {
		db.run("insert into tickonoff values (1,'on');");
		$('#txttickonoff').text("ON");
		$('#imgtickonoff').attr('src','img/ticket_ON.png');
	} else {
		$('#txttickonoff').text(row2.onoff.toUpperCase());
		$('#imgtickonoff').attr('src','img/ticket_'+row2.onoff+'.png');
	}
});

fillTick()

$( "#ModalPaiement" ).load( "modals/modal_paiement.html" );
$( "#ModalMenu" ).load( "modals/modal_menu.html" );
$( "#ModalPoids" ).load( "modals/modal_poids.html" );
$( "#ModalAtt" ).load( "modals/modal_att.html" );
$( "#ModalTables" ).load( "modals/modal_tables.html" );
$( "#Modalcmd" ).load( "modals/modal_commandes.html" );
$( "#Modallivr" ).load( "modals/modal_livraisons.html" );
$( "#ModalClient" ).load( "modals/modal_client.html" );
$( "#popmsg" ).load( "modals/popmsg.html" );
$( "#popmoney" ).load( "modals/popmoney.html" );

if (mainWindow) mainWindow.webContents.send ('annulerclient', "0.00");

function getMxRow(idp) {
	db.get("Select max(idr) mx from tick_temp where idp="+idp+";", function(error, row) {
		return row.mx			
	})
}

function fillP(idc,tvas,tvae,imp) {
	$('#prodB').html("");
	db.each("SELECT *, case when menu is null then 0 else menu end menu2 FROM prd where idc="+idc, function(err, row) {
		$('#prodB').append('<div class="card col-3 ml-1 mb-1" style="min-width:150px;max-width:150px;min-height:150px;max-height:150px;" onclick="encaissP('+row.idp+','+row.idc+',\''+row.nom.replace("\'"," ")+'\','+row.prix.toFixed(2)+','+tvas+','+tvae+','+imp+','+row.menu2+',\''+row.unit+'\')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'<br>'+row.prix.toFixed(2)+' '+dev+'</div><img src="img/'+row.idp+'.jpg" class="img-fluid" style="max-height:90px;" onerror="$(this).hide()"></div>')
	});
}

function fillP2(idc,tvas,tvae,imp, idp) {
	$('#prodB2').html("");
	//alert(idc+" "+idp);
	db.each("SELECT * FROM prd where idc="+idc+" and idp in (select idpi from menu where idp="+idp+")", function(err, row) {
		$('#prodB2').append('<div class="card col-3 ml-1 mb-1" style="min-width:100px;max-width:150px;min-height:150px;max-height:200px;" onclick="encaissP('+row.idp+','+row.idc+',\'----- '+row.nom.replace("\'"," ")+'\',\'\','+tvas+','+tvae+','+imp+',0, \'unit\')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'<br>Inclus</div></div>')
	});
}

function fillTickA(ida, px) {
	$(dumida).text(ida)
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("delete from tick_temp;")
		.then( () => {
			db.run("insert into tick_temp select idr, dte, idp, idc, nom, prix, tvas, tvae, imp from tick_att where ida='"+ida+"';")
			.then( () => {
				$('#tot').text(px.toFixed(2));
				fillTick()
				$("#ModalAtt").modal("hide");
			})
		})
	})

}
function fillTickT(idt,px) {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("delete from tick_temp;")
		.then( () => {
			db.run("insert into tick_temp select idr, dte, idp, idc, nom, prix, tvas, tvae, imp from tick_table where idt='"+idt+"';")
			.then( () => {
				$('#tot').text(px.toFixed(2));
				fillTick()
			})
		})
	})
}

function fillTick() {
	$('#TbTicket').html("");
	var prx=0;
	db.each("SELECT * FROM tick_temp", function(err, row) {
		var px;
		if (row.nom.substring(0,5)=="-----") {px="";} else {px=row.prix.toFixed(2)+' '+dev;prx+=row.prix;$('#tot').text(prx.toFixed(2));}
		$('#TbTicket').append('<tr class="d-flex p-0 m-0" rw="'+row.idr+'"><td class="col-7">'+row.nom+'</td><td class="col-4 text-right">'+px+'</td><td class="col-1 pl-0" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer encaissement\';poptext.innerText=\'Voulez-vous supprimer : '+row.nom+' ?\';popvalid.onclick=function() { supprencaiss('+row.idr+','+row.prix+') }"><img src="img/trash.png" width=20></img></td></tr>');
	});
}

function encaissP(idp,idc,nm,px,tvas,tvae,imp,menu,unit) {
	rw++;
	if (unit=="kg") {
		//alert("ok")
		poidsvalid.onclick=function() { if (tpoids.innerText!="0.000") { encaissP(idp, idc, nm +' : '+tpoids.innerText+' Kg',Math.floor((tpoids.innerText-0)*px*10)/10,tvas,tvae,imp,menu,'') } };
		$("#ModalPoids").modal("show");
	} else {
		$('#TbTicket').append('<tr class="d-flex" rw="'+rw+'"><td class="col-7">'+nm+'</td><td class="col-4 text-right">'+(px!=""?(px.toFixed(2)+' '+dev):'')+'</td><td class="col-1 pl-0" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer encaissement\';poptext.innerText=\'Voulez-vous supprimer : '+nm+' ?\';popvalid.onclick=function() { supprencaiss('+rw+','+px+') }"><img class="float-left" src="img/trash.png" width=20></img></td></tr>');
		
		if (mainWindow) mainWindow.webContents.send ('encaissp', {'rw':rw,'nm':nm,'px':px});
		var dte = new Date();
		
		if (px==""){px=0;}
		var time = dte.getFullYear()+'-'+((dte.getMonth()+1)<10?'0':'')+(dte.getMonth()+1)+'-'+(dte.getDate()<10?'0':'')+dte.getDate()+'T'+(dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds();
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
		$("#ModalPoids").modal("hide");
	}
}

function supprencaiss(rw,px) {
	if ($('#tot').text()!="0.00") {
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
}

function annulerclient() {
	//db.run("delete from tick_temp;");
	$('#TbTicket').html("");
	rw=0;
	$('#tot').text("0.00");
	
	if ($(dumida).text()!=""){
		db.run("delete from tick_att where ida="+$(dumida).text()+";")
		$(dumida).text("")
	}
	
	if (mainWindow) mainWindow.webContents.send ('annulerclient', "0.00");
	$('#popmsg').modal('hide');
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("delete from tick_temp;").then( () => {
			location.reload()
		})
	})
}

$('#addition').on('click', function(e) {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.get("SELECT * FROM printers where idp=1;").then( (row) => {
			var device = getDevice(row.conn,row.params);
			var printer = new escpos.Printer(device);	
			if (printer&&$('#txttickonoff').text()=="ON") {
				device.open(function(){
					printer.font('a')
					printer.align('ct')
					printer.style('normal')
					printer.size(1, 1)
					if ($('#hash').attr('bol')=='ON') {
						printer.size(5, 5)
						printer.text("#"+appel)
						printer.size(1, 1)
						hash_num.innerText=appel+1;
						db.run("update appel set ida="+(appel+1)+";").then( () => {
							appel++;
						})
					}
					if (logo!="") {
						escpos.Image.load(path+"img/"+logo, function(image){
							printer.image(image, 's24').then(() =>{
								printer.close()
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
					var tota=0;
					db.each("select count(*) nb, nom, sum(prix) px from tick_temp group by idp,idc order by dte asc;", function(err, row) {
						printer.tableCustom([ 
						{ text:row.nb+'x '+row.nom, align:"LEFT", width:0.66 },
						{ text:row.px, align:"RIGHT", width:0.33 }
						]);
						tota+=(row.px+0);
					})
					.then( () => {
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
						printer.text("Client :"+(clt+1));
						var dte = new Date();
						printer.text( (dte.getDate()<10?'0':'')+dte.getDate()+'/'+((dte.getMonth()+1)<10?'0':'')+(dte.getMonth()+1)+'/'+dte.getFullYear() );
						printer.text( (dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds() );
						printer.text("Addition");
						/*
						if ( $("#modetbl").is(":hidden")&&$("#modecmd").is(":hidden")&&$("#modelivr").is(":hidden") ) {
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
					.then(() => {
						/*
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
						
						var modespemp=$('#txtspemp').text();
						var delreq="delete from tick_temp"
						if ( $("#modetbl").is(":visible") ) {
							modespemp="Table : "+document.getElementById('tbname').innerText;
							document.getElementById($("#modetbl").attr('idt')).parentElement.style.backgroundColor=""
							document.getElementById($("#modetbl").attr('idt')+'t').innerText=""
							delreq="delete from tick_table where idt="+$("#modetbl").attr('idt')
						} else if ( $("#modecmd").is(":visible") ) {
							modespemp="Commande : "+document.getElementById('cmdname').innerText;
							$('#cmd'+$("#modecmd").attr('idt').replace(" ","_")).remove()
							delreq="delete from tick_cmd where idcl='"+$("#modecmd").attr('idt')+"';"
						} else if ( $("#modelivr").is(":visible") ) {
							modespemp="Livraison : "+document.getElementById('livrname').innerText;
							$('#livr'+$("#modelivr").attr('idt').replace(" ","_")).remove()
							delreq="delete from tick_livr where idcl='"+$("#modelivr").attr('idt')+"';"
						}
			
						db.run("INSERT INTO tick select "+(clt+1)+" idt, dte, idp, tick_temp.idc, tick_temp.nom, prix, round(prix*(1-(1/(1+(round("+ftva+",2)/100)))),2) from tick_temp;")
						db.run("INSERT INTO tot select "+(clt+1)+" idt, 1010, '"+time+"', '"+paimt+"', sum(prix), round(sum(prix*(1-(1/(1+(round("+ftva+",2)/100))))),2), '"+modespemp+"','' from tick_temp;")
						db.run("update clt set idt=idt+1;")
						db.run(delreq).then(()=> {
							clt++;
							
							//cleanmodal()
							$("#ModalPaiement").modal("hide");
							arr.forEach( (it) => {
								if ($('#'+it[0]).val()!="") {	
									$('#'+it[0]).val("")
									$('#c'+it[0]).prop("checked",false)
								}
							})
							if (montP>=$('#tot').text()){
								$('#popmtext').text((montP-0-$('#tot').text()).toFixed(2)+' '+devise.innerText);
								$("#popmoney").modal("show");
								setTimeout(()=>{$("#popmoney").modal("hide");},3000)
							}
							$("#modetbl").hide()
							$("#modecmd").hide()
							$("#modelivr").hide()
							document.body.style.backgroundColor='';
							annulerclient()
						})
						*/
					})
				})
			}
		})
	})

})


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
		db.each("SELECT * FROM printers where idp=1;").then( (error, row) => {
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
$('#plshash').on('click', function(e) {
	//$(hash_num).text(''+(($(hash_num).text()-0)+1));
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("update appel set ida="+(($(hash_num).text()-0)+1)+";").then( () => {
			appel=(($(hash_num).text()-0)+1);
			hash_num.innerText=(($(hash_num).text()-0)+1);
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
		resethash.parentElement.style.visibility = "visible";
		$('#img_hash').attr('src','img/reset.png');
		db.run("update appel set act='ON'");
	} else {
		$('#hash').attr('bol','OFF');
		hash_num.style.visibility = "hidden";
		resethash.parentElement.style.visibility = "hidden";
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
function DoAtt() {
	if ($('#tot').text()!="0.00") {
		var ida="1";
		if ($(dumida).text()!="") {
			ida=$(dumida).text()
		} else if ($('#hash').attr('bol')=='ON') {
			ida=appel
			hash_num.innerText=appel+1;
			sqlite.open(path+'db/caisse.db').then(db=>{
				db.run("update appel set ida="+(appel+1)+";").then( () => {
					appel++;
				})
			})
		} else {
			db.get("Select max(ida+1) ida from tick_att;", function(error, row2) {
				if (row2 !== undefined) {
					ida=row2.ida
				}
			})
		}
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.run("delete from tick_att where ida="+ida).then(() =>{
				db.run("insert into tick_att select '"+ida+"', * from tick_temp")
				.then( () => {
					annulerclient()
					$(dumida).text("")
				})
			})
		})
	}
}
function encais() {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.get("SELECT * FROM printers where idp=1;").then( (row) => {
			var device = getDevice(row.conn,row.params);
			//alert(device)
			const options = { encoding: "UTF8"}
			var printer = new escpos.Printer(device,options);	
			if (printer && device && $('#txttickonoff').text()=="ON") {
				device.open(function(){
					//alert(path+"img/"+logo)
					printer.align('ct')
					if (logo!="") {
						//const tux = path.join(__dirname, 'img/logo.png');
						escpos.Image.load(path+"img/"+logo, function(image){
							printer.image(image, 's24').then(() =>{
								printer.close()
							})
						})
					}
					printer.font('a')
					
					printer.style('normal')
					printer.size(1, 1)
					if ($('#hash').attr('bol')=='ON') {
						printer.size(5, 5)
						printer.text("#"+appel)
						printer.size(1, 1)
						hash_num.innerText=appel+1;
						db.run("update appel set ida="+(appel+1)+";").then( () => {
							appel++;
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
					var tota=0;
					db.each("select count(*) nb, nom, sum(prix) px from tick_temp group by idp,idc order by dte asc;", function(err, row) {
						printer.tableCustom([ 
						{ text:row.nb+'x '+row.nom, align:"LEFT", width:0.66 },
						{ text:row.px.toFixed(2), align:"RIGHT", width:0.33 }
						]);
						tota+=(row.px+0);
					})
					.then( () => {
						printer.size(2, 2)
						printer.style('b')
						printer.tableCustom([ 
							{ text:'Total', align:"RIGHT", width:0.66 },
							{ text:tota.toFixed(2)+" "+devise.innerText, align:"RIGHT", width:0.33 }
						]);
						printer.size(1, 1)
						printer.style('normal')
						printer.text("");
						
						printer.align("LT");

						var service ="";
						if ( $("#modetbl").is(":hidden")&&$("#modecmd").is(":hidden")&&$("#modelivr").is(":hidden") ) {
							service=$('#txtspemp').text();
							//printer.text($('#txtspemp').text());
						} else if ( $("#modetbl").is(":visible") ) {
							service="Sur Place";
							//printer.text("Sur Place");
						} else if ( $("#modecmd").is(":visible") ) {
							service="A Emporter";
							//printer.text("A Emporter");
						} else if ( $("#modelivr").is(":visible") ) {
							service="Livraison";
							//printer.text("Livraison");
						}


						printer.text("Client :"+(clt+1)+"   "+service);
						var dte = new Date();
						printer.text( (dte.getDate()<10?'0':'')+dte.getDate()+'/'+((dte.getMonth()+1)<10?'0':'')+(dte.getMonth()+1)+'/'+dte.getFullYear() +" "+ (dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds() );
						var ids = $('#radioserveurs input:radio:checked').val();
						
						if (ids) {
							printer.text("Serveur : "+$('#sv'+ids+'_name').text())
						}
						
						
						printer.text("");
						printer.align("CT");
						printer.text("Merci et a bientot");
						printer.text("");
						printer.cut();
						printer.close();
					})
					.then(() => {
						var bol=false;
						if ($("#modetbl").is(":hidden")||$("#modecmd").is(":hidden")||$("#modelivr").is(":hidden")) {
							bol=true; //ne pas imprimer en cuisine
						}
						printc(bol).then(()=> {
							finaliserPaiement()
						})
					})
				})
			} else {
				finaliserPaiement()
			}
		})
		/*
		.then(() => {
			
			db.each("select distinct printers.idp from printers inner join cat on printers.idp=cat.imp left join tick_temp on cat.idc=tick_temp.idc where tick_temp.idc is not null and printers.idp>1;", (error,row) => {
				var device = getDevice(row.conn,row.params);
				var printer = new escpos.Printer(device);		
			
				if (device) {
					device.open(function(){
						printer.font('a')
						printer.align('ct')
						printer.style('bu')
						if ($('#hash').attr('bol')=='ON') {
							printer.size(5, 5)
							printer.text("#"+appel)
							printer.size(2, 2)
							hash_num.innerText=appel+1;
							sqlite.open(path+'db/caisse.db').then(db=>{
								db.run("update appel set ida="+(appel+1)+";").then( () => {
									appel++;
								})
							})
						}
						printer.size(3, 3)
						if ( $("#modetbl").is(":visible") ) {
							printer.text("Table : ")
							printer.size(2, 2)
							printer.text(document.getElementById('tbname').innerText)
						} else if ( $("#modecmd").is(":visible") ) {
							printer.text("Commande : ")
							printer.size(2, 2)
							printer.text(document.getElementById('cmdname').innerText)
						} else if ( $("#modelivr").is(":visible") ) {
							printer.text("Livraison : ")
							printer.size(2, 2)
							printer.text(document.getElementById('livrname').innerText)
						} else {
							printer.text($('#txtspemp').text());
						}
						printer.size(2, 2)
						
						printer.text("");
						printer.text("");
						//printer.align('lt')
						db.each("select count(*) nb, tick_temp.nom from tick_temp,cat where tick_temp.idc=cat.idc and cat.imp="+row.idp+" group by tick_temp.idp order by dte asc;", function(err, row2) {
							printer.text(row2.nb+'x '+row2.nom);
						}).then( () => {
							printer.cut()
							printer.close()
						})
					})
				}
			})
			
		})
		*/		
	})
}

function finaliserPaiement() {
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

	var ids = $('#radioserveurs input:radio:checked').val();
	var noms = $('#sv'+ids+'_name').text();

	if (!ids) {ids="null"}
	alert(ids+" "+noms)
	
	var ftva="tvae";
	if ($('#txtspemp').text()=='Sur Place') {
		ftva="tvas";
	}
	//alert(dte)
	var time = dte.getFullYear()+'-'+((dte.getMonth()+1)<10?'0':'')+(dte.getMonth()+1)+'-'+(dte.getDate()<10?'0':'')+dte.getDate()+'T'+(dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds();
	
	var modespemp=$('#txtspemp').text();
	var delreq="delete from tick_temp"
	if ( $("#modetbl").is(":visible") ) {
		modespemp="Table : "+document.getElementById('tbname').innerText;
		document.getElementById($("#modetbl").attr('idt')).parentElement.style.backgroundColor=""
		document.getElementById($("#modetbl").attr('idt')+'t').innerText=""
		delreq="delete from tick_table where idt="+$("#modetbl").attr('idt')
	} else if ( $("#modecmd").is(":visible") ) {
		modespemp="Commande : "+document.getElementById('cmdname').innerText;
		$('#cmd'+$("#modecmd").attr('idt').replace(" ","_")).remove()
		delreq="delete from tick_cmd where idcl='"+$("#modecmd").attr('idt')+"';"
	} else if ( $("#modelivr").is(":visible") ) {
		modespemp="Livraison : "+document.getElementById('livrname').innerText;
		$('#livr'+$("#modelivr").attr('idt').replace(" ","_")).remove()
		delreq="delete from tick_livr where idcl='"+$("#modelivr").attr('idt')+"';"
	}
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("INSERT INTO tick select "+(clt+1)+" idt, dte, idp, tick_temp.idc, tick_temp.nom, prix, round(prix*(1-(1/(1+(round("+ftva+",2)/100)))),2) from tick_temp;").then(()=>{
			db.run("INSERT INTO tot select "+(clt+1)+" idt, "+ids+", '"+time+"', '"+paimt+"', sum(prix), round(sum(prix*(1-(1/(1+(round("+ftva+",2)/100))))),2), '"+modespemp+"','' from tick_temp;").then(()=>{
				db.run("update clt set idt=idt+1;").then(()=>{
					db.run(delreq).then(()=> {
						clt++;
						
						//cleanmodal()
						$("#ModalPaiement").modal("hide");
						arr.forEach( (it) => {
							if ($('#'+it[0]).val()!="") {	
								$('#'+it[0]).val("")
								$('#c'+it[0]).prop("checked",false)
							}
						})
						if (montP>=$('#tot').text()){
							$('#popmtext').text((montP-0-$('#tot').text()).toFixed(2)+' '+devise.innerText);
							$("#popmoney").modal("show");
							setTimeout(()=>{$("#popmoney").modal("hide");},3000)
						}
						$("#modetbl").hide()
						$("#modecmd").hide()
						$("#modelivr").hide()
						document.body.style.backgroundColor='';
						if ($(dumida).text()!="") {
							db.run("delete from tick_att where ida="+ida)
						}
						$(dumida).text("")
						annulerclient()
					})
				})
			})		
		})
	})
}
function printc(notprintcuisine) {
	return new Promise(resolve => {
		if (notprintcuisine) {
			resolve()
		} else {
			sqlite.open(path+'db/caisse.db').then(db=>{
				db.each("select distinct printers.idp from printers inner join cat on printers.idp=cat.imp left join tick_temp on cat.idc=tick_temp.idc where tick_temp.idc is not null and printers.idp>1;", (error,row) => {
					var device = getDevice(row.conn,row.params);
					var printer = new escpos.Printer(device);		
				
					if (device) {
						device.open(function(){
							printer.font('a')
							printer.align('ct')
							printer.style('bu')
							if ($('#hash').attr('bol')=='ON') {
								printer.size(5, 5)
								printer.text("#"+appel)
								printer.size(2, 2)
								hash_num.innerText=appel+1;
								sqlite.open(path+'db/caisse.db').then(db=>{
									db.run("update appel set ida="+(appel+1)+";").then( () => {
										appel++;
									})
								})
							}
							printer.size(3, 3)
							if ( $("#modetbl").is(":visible") ) {
								printer.text("Table : ")
								printer.size(2, 2)
								printer.text(document.getElementById('tbname').innerText)
							} else if ( $("#modecmd").is(":visible") ) {
								printer.text("Commande : ")
								printer.size(2, 2)
								printer.text(document.getElementById('cmdname').innerText)
							} else if ( $("#modelivr").is(":visible") ) {
								printer.text("Livraison : ")
								printer.size(2, 2)
								printer.text(document.getElementById('livrname').innerText)
							} else {
								printer.text($('#txtspemp').text());
							}
							printer.size(2, 2)
							
							printer.text("");
							printer.text("");
							//printer.align('lt')
							db.each("select count(*) nb, tick_temp.nom from tick_temp,cat where tick_temp.idc=cat.idc and cat.imp="+row.idp+" group by tick_temp.idp order by dte asc;", function(err, row2) {
								printer.text(row2.nb+'x '+row2.nom);
							}).then( () => {
								printer.cut()
								printer.close()
							})
						})
					}
				}).then(() => {
					resolve()
				})
			})
		}
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

function savecmd(idcl,cmdname,mod) {
	if (tot.innerText!="0.00") {
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.run("delete from tick_"+mod+" where idcl='"+idcl+"';")
			.then( () => {
				db.run("insert into tick_"+mod+" select '"+idcl+"' idcl, * from tick_temp;")
				.then( () => {
					location.reload();
					/*
					Envoyer ticket cuisine?
					*/
				})
			})
		})
	} else {
		/* verify if ticktable and ask & supprimer ticktemp idt */
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.get("select distinct idcl from tick_"+mod+" where idcl='"+idcl+"'")
			.then((row,error) => {
				if (row!== undefined) {
					var modT="Commande";
					if (mod=="livr") {modT="Livraison"}
					poptitle.innerText='Annuler '+modT;
					poptext.innerText='Voulez-vous annuler la '+modT+' '+cmdname+'?';popvalid.onclick=function() {sqlite.open(path+'db/caisse.db').then(db=>{db.run("delete from tick_"+mod+" where idcl='"+idcl+"';").then(() => {window.location.reload() }) }) };$('#popmsg').modal('show');
				}
			})
		})
	}
}

function savetbl(idt,tbname) {
	if (tot.innerText!="0.00") {
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.run("delete from tick_table where idt='"+idt+"';")
			.then( () => {
				db.run("insert into tick_table select '"+idt+"' idt, * from tick_temp;")
				.then( () => {
					location.reload();
					/*
					Envoyer ticket cuisine?
					*/
				})
			})
		})
	} else {
		/* verify if ticktable and ask & supprimer ticktemp idt */
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.get("select distinct idt from tick_table where idt='"+idt+"'")
			.then((row,error) => {
				if (row!== undefined) {
					poptitle.innerText='Annuler table';
					poptext.innerText='Voulez-vous annuler la table '+tbname+'?';popvalid.onclick=function() {sqlite.open(path+'db/caisse.db').then(db=>{db.run("delete from tick_table where idt='"+idt+"';").then(() => {window.location.reload() }) }) };$('#popmsg').modal('show');
					
				}
			})
		})
	}
}


function searchclient(mod) {
	$("#cards"+mod+" > div").remove();
	if (document.getElementById("telp"+mod).value=="" && document.getElementById("nom"+mod).value=="") {
		$("#telorname"+mod).show();
	} else {
		$("#noclient"+mod).hide();
		$("#telorname"+mod).hide();
		sqlite.open(path+'db/caisse.db').then(db=>{
			if (document.getElementById("telp"+mod).value!=="") {
				db.get("select * from clients where tel='"+document.getElementById("telp"+mod).value+"'")
				.then((row,error) => {
					if (row!==undefined) {
						$("#cards"+mod).append('<div class="card col-12 mt-1 p-3" style="cursor:pointer" onclick="fillclient(\''+row.tel+'\', \''+row.nom+'\',\''+mod+'\')"><span style="font-weight: bold;">Tel. : <span style="font-weight:normal;">'+row.tel+'</span></span><span style="font-weight: bold;">Nom : <span style="font-weight:normal;">'+row.nom+'</span></span><span style="font-weight: bold;">Adresse : <span style="font-weight:normal;">'+row.adr+'</span></span><span style="font-weight: bold;">Compl : <span style="font-weight:normal;"><br>'+row.ic1+'<br>'+row.ic2+'<br>'+row.ic3+'</span></span></div>')
					} else {
						$("#noclient"+mod).show();
					}
				})
			} else if (document.getElementById("nom"+mod).value!=="") {
				var bl = false
				db.each("select * from clients where nom like '%"+document.getElementById("nom"+mod).value+"%'", (error,row) => {
					bl=true
					$("#cards"+mod).append('<div class="card col-12 mt-1 p-3" style="cursor:pointer" onclick="fillclient(\''+row.tel+'\', \''+row.nom+'\',\''+mod+'\')"><span style="font-weight: bold;">Tel. : <span style="font-weight:normal;">'+row.tel+'</span></span><span style="font-weight: bold;">Nom : <span style="font-weight:normal;">'+row.nom+'</span></span><span style="font-weight: bold;">Adresse : <span style="font-weight:normal;">'+row.adr+'</span></span><span style="font-weight: bold;">Compl : <span style="font-weight:normal;"><br>'+row.ic1+'<br>'+row.ic2+'<br>'+row.ic3+'</span></span></div>')
				}).then( () => {
					if (!bl) {
						$("#noclient"+mod).show();
					}
				})
			}
		})
	}
}

function fillclient(telf, nomf, mod,adrf, compf) {
	document.body.style.backgroundColor="lightblue";
	$("#mode"+mod).show();
	document.getElementById(mod+'name').innerText=telf+" "+nomf ;
	$("#Modal"+mod).modal("hide");
	$("#mode"+mod).attr("idt",telf);
	
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("delete from tick_temp;")
		.then( () => {
			db.run("insert into tick_temp select idr, dte, idp, idc, nom, prix, tvas, tvae, imp from tick_"+mod+" where idcl='"+telf+"';")
			.then( () => {
				fillTick()
			})
		})
	})
}

function createclient() {
	if (telpc.value=="") {
		$("#alertmsgtel").show();
	} else if (nomc.value=="") {
		$("#alertmsgnom").show();
	} else {
		$("#alertmsgtel").hide();
		$("#alertmsgnom").hide();
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.get("select * from clients where tel='"+telp.value+"'")
			.then((row,error) => {
				if (row!==undefined) {
					$("#clientexist").show();
				} else {
					$("#clientexist").hide();
					//alert("insert into clients values ('"+telpc.value.toString()+"','"+nomc.value+"','"+adrc.value+"','"+comp1c.value+"','"+comp2c.value+"','"+comp3c.value+"')")
					db.run("insert into clients values ('"+telpc.value.toString()+"','"+nomc.value+"','"+adrc.value+"','"+comp1c.value+"','"+comp2c.value+"','"+comp3c.value+"')")
					.then(() => {
						$("#commandcards > div").remove();
						$("#commandcards").append('<div class="card col-12 mt-1 p-3" style="cursor:pointer" onclick="fillclient(\''+telpc.value+'\', \''+nomc.value+'\')"><span style="font-weight: bold;">Tel. : <span style="font-weight:normal;">'+telpc.value+'</span></span><span style="font-weight: bold;">Nom : <span style="font-weight:normal;">'+nomc.value+'</span></span><span style="font-weight: bold;">Adresse : <span style="font-weight:normal;">'+adrc.value+'</span></span><span style="font-weight: bold;">Compl : <span style="font-weight:normal;"><br>'+comp1c.value+'<br>'+comp2c.value+'<br>'+comp3c.value+'</span></span></div>')
						$("#ModalClient").modal("hide");
					})
				}
			})
		})
	}
}

