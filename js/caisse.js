var rw=0;

var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var db = new sqlite3.Database('db/caisse.db');
db.run("CREATE TABLE IF NOT EXISTS clt (idt NUMBER);");
db.run("CREATE TABLE IF NOT EXISTS cat(idc NUMBER, nom VARCHAR,tvas NUMERIC, tvae NUMERIC, imp VARCHAR);");
db.run("CREATE TABLE IF NOT EXISTS prd (idp NUMBER, idc NUMBER, nom VARCHAR, prix NUMERIC, color VARCHAR);");
db.run("CREATE TABLE IF NOT EXISTS soc (nom VARCHAR, ad VARCHAR, cp VARCHAR, vl VARCHAR, tl VARCHAR, ic1 VARCHAR, ic2 VARCHAR, ic3 VARCHAR, dev VARCHAR);");
db.run("CREATE TABLE IF NOT EXISTS tick_temp (idr NUMBER, dte VARCHAR, idp NUMBER, idc NUMBER, nom VARCHAR, prix NUMERIC,tvas,tvae);");
db.run("CREATE TABLE IF NOT EXISTS tot (idt NUMBER, idv NUMBER, dte VARCHAR, paimt VARCHAR, tot NUMERIC, tva NUMERIC, dtez VARCHAR);");
db.run("CREATE TABLE IF NOT EXISTS menu (idp NUMBER, idpi NUMBER);");
db.run("DELETE FROM tick_temp;");
db.run("CREATE TABLE IF NOT EXISTS appel (ida NUMBER, act VARCHAR);");
db.run("CREATE TABLE IF NOT EXISTS tickonoff (onoff VARCHAR);");
db.get("Select * from clt;", function(error, row2) {
	if (row2 !== undefined) {
		db.run("insert into clt values (1);");
	}
});
db.each("SELECT * FROM cat", function(err, row) {
	$('#catB').append('<div class="card col-12 p-2 m-1" style="min-height:75px" style="cursor:pointer;" onclick="fillP('+row.idc+','+row.tvas+','+row.tvae+')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'</div></div>');
	//$('#TbCategory').append('<tr class="clickable-row" id="cat'+row.idc+'"><td>'+row.idc+'</td><td>'+row.nom+'</td><td><a href="#"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer catégorie\';poptext.innerText=\'Voulez-vous supprimer la catégorie : '+row.nom+' ?\';popvalid.onclick=function() { supprcat('+row.idc+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
});
$( "#ModalCategory" ).load( "modals/modal_category.html" );
$( "#ModalProduct" ).load( "modals/modal_product.html" );
$( "#popmsg" ).load( "modals/popmsg.html" );

function fillP(idc,tvas,tvae) {
	$('#prodB').html("");
	var db = new sqlite3.Database('db/caisse.db');
	db.each("SELECT * FROM prd where idc="+idc, function(err, row) {
		$('#prodB').append('<div class="card col-3 ml-1 mb-1" style="min-width:100px;max-width:150px;min-height:150px;max-height:200px;" onclick="encaissP('+row.idp+','+row.idc+',\''+row.nom+'\','+row.prix+','+tvas+','+tvae+')"><div class="card-body p-0 m-0 text-center align-middle" style="cursor:pointer;">'+row.nom+'<br>'+row.prix+'€</div></div>')
	});
}

function fillTick() {
	$('#TbTicket').html("");
	var db = new sqlite3.Database('db/caisse.db');
	db.each("SELECT * FROM tick_temp", function(err, row) {
		$('#TbTicket').append('<tr class="clickable-row" rw="'+row.idr+'"><td>'+row.nom+'</td><td>'+row.prix+'</td><td><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer encaissement\';poptext.innerText=\'Voulez-vous supprimer : '+row.nom+' ?\';popvalid.onclick=function() { supprencaiss('+row.idr+','+row.prix+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
	});
}

function encaissP(idp,idc,nm,px,tvas,tvae) {
	rw++;
	$('#TbTicket').append('<tr class="clickable-row" rw="'+rw+'"><td>'+nm+'</td><td>'+px+'</td><td><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer encaissement\';poptext.innerText=\'Voulez-vous supprimer : '+nm+' ?\';popvalid.onclick=function() { supprencaiss('+rw+','+px+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
	var db = new sqlite3.Database('db/caisse.db');
	var dte = new Date();

	var time = dte.getFullYear()+'-'+(dte.getMonth()<10?'0':'')+dte.getMonth()+'-'+(dte.getDate()<10?'0':'')+dte.getDate()+'T'+(dte.getHours()<10?'0':'')+dte.getHours()+":" + (dte.getMinutes()<10?'0':'')+dte.getMinutes() + ":" + (dte.getSeconds()<10?'0':'')+dte.getSeconds();

	db.run("insert into tick_temp values ("+rw+", '"+time+"', "+idp+", "+idc+", '"+nm+"', "+px+", "+tvas+", "+tvae+");");

	$('#tot').text((parseFloat($('#tot').text())+px).toFixed(2));
}

function supprencaiss(rw,px) {
	var db = new sqlite3.Database('db/caisse.db');
	sqlite.open('db/caisse.db').then(db=>{
		db.run("delete from tick_temp where idr="+rw+";").then( () => {
			fillTick();
			$("#popmsg").modal("hide");	
			$('#tot').text((parseFloat($('#tot').text())-px).toFixed(2));
		});
	});	
}

function annulerclient() {
	var db = new sqlite3.Database('db/caisse.db');
	db.run("delete from tick_temp;");
	$('#TbTicket').html("");
	rw=0;
	$('#tot').text("0.00");
	$('#popmsg').modal('hide');
}

function supprprd(idc,idp) {
	sqlite.open('db/caisse.db').then(db=>{
		db.run("delete from prd where idp="+idp+";").then( () => {
			$("#popmsg").modal("hide");
			document.getElementById('cat'+idc).click();
		});
	});	
}

function createproduct() {
	if (nomP.value=="") {
		alertmsgP.innerText="Veuillez saisir un nom";
		$("#alertmsgP").show();
	} else if (price.value=="") {
		alertmsgP.innerText="Veuillez saisir un prix";
		$("#alertmsgP").show();
	} else {
		$("#alertmsgP").hide();
		var db = new sqlite3.Database('db/caisse.db');
		db.run("CREATE TABLE IF NOT EXISTS prd (idp NUMBER, idc NUMBER, nom VARCHAR, prix NUMERIC, color VARCHAR);");
		db.get("Select * from prd where nom='"+nomP.value+"' and idc="+cat.value+";", function(error, row2) {
			if (row2 !== undefined) {
				alertmsgP.innerText="Ce produit existe deja";
				$("#alertmsgP").show();
			} else {
				var mx=1000;
				db.get("select max(idp+10) mx from prd", (err, row) => {
					if (row !== undefined) { mx=row.mx;}
					sqlite.open('db/caisse.db').then(db2=>{
						db2.run("INSERT INTO prd VALUES ("+mx+", "+cat.value+",'"+nomP.value+"',"+price.value+",'');").then( () => {
							document.getElementById('cat'+cat.value).click();
							$("#ModalProduct").modal("hide");
						});
					});
				});
				
			}
		});
	}
}
function createcat() {
	if (nomC.value=="") {
		alertmsg.innerText="Veuillez saisir un nom";
		$("#alertmsg").show();
	} else if (tvas.value=="") {
		alertmsg.innerText="Veuillez saisir une tva sur place";
		$("#alertmsg").show();
	} else if (tvae.value=="") {
		alertmsg.innerText="Veuillez saisir une tva à emporter";
		$("#alertmsg").show();
	} else {
		$("#alertmsg").hide();
		var db = new sqlite3.Database('db/caisse.db');
		db.run("CREATE TABLE IF NOT EXISTS cat(idc NUMBER, nom VARCHAR,tvas NUMERIC, tvae NUMERIC, imp VARCHAR);");
		db.get("Select * from cat where nom='"+nomC.value+"'", function(error, row2) {
			if (row2 !== undefined) {
				alertmsg.innerText="Cette categorie existe deja";
				$("#alertmsg").show();
			} else {
				var mx=1000;
				db.get("select max(idc+10) mx from cat", (err, row) => {
					if (row !== undefined) { mx=row.mx;}
					db.run("INSERT INTO cat VALUES("+mx+", '"+nomC.value+"',"+tvas.value+","+tvae.value+","+printer.value+");");
					location.reload();
				});
				
			}
		});
	}
}