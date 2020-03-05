$('.myTableP').on('click', '.clickable-row', function(event) {
	  $(this).addClass('active').siblings().removeClass('active');
	});
$('.myTableC').on('click', '.clickable-row', function(event) {
		$(this).addClass('active').siblings().removeClass('active');
		var db = new sqlite3.Database('db/caisse.db');
		$('#TbProduct > tbody').html("");
		db.each("SELECT * FROM prd where idc="+$(this).find('td:first').html(), function(err, row) {
			$('#TbProduct').append('<tr class="clickable-row"><td>'+row.idp+'</td><td>'+row.nom+'</td><td>'+row.prix+'</td><td><a href="#"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer produit\';poptext.innerText=\'Voulez-vous supprimer le produit : '+row.nom+' ?\';popvalid.onclick=function() { supprprd('+row.idc+','+row.idp+') }"><img src="img/trash.png" width=20></img></a></td></tr>');		
		});
	  });
var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var db = new sqlite3.Database('db/caisse.db');
db.each("SELECT * FROM cat", function(err, row) {
	$('#TbCategory').append('<tr class="clickable-row" id="cat'+row.idc+'"><td>'+row.idc+'</td><td>'+row.nom+'</td><td><a href="#"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer catégorie\';poptext.innerText=\'Voulez-vous supprimer la catégorie : '+row.nom+' ?\';popvalid.onclick=function() { supprcat('+row.idc+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
});
$( "#ModalCategory" ).load( "modals/modal_category.html" );
$( "#ModalProduct" ).load( "modals/modal_product.html" );
$( "#popmsg" ).load( "modals/popmsg.html" );

function supprcat(idc) {
	var db = new sqlite3.Database('db/caisse.db');
	db.run("delete from cat where idc="+idc+";");
	location.reload();
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