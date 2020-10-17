var path=window.location.href.replace("serveurs.html","").replace("file:///","");
$('.myTableP').on('click', '.clickable-row', function(event) {
	  $(this).addClass('active').siblings().removeClass('active');
	});
$('.myTableC').on('click', '.clickable-row', function(event) {
		$(this).addClass('active').siblings().removeClass('active');
		var db = new sqlite3.Database(path+'db/caisse.db');
		$('#TbProduct > tbody').html("");
		db.each("SELECT * FROM prd where idc="+$(this).find('td:first').html(), function(err, row) {
			$('#TbProduct').append('<tr class="clickable-row d-flex"><td class="col-2">'+row.idp+'</td><td class="col-5">'+row.nom+'</td><td class="col-2">'+row.prix+'</td><td class="col-3 pl-4"><a href="#" data-toggle="modal" data-target="#ModalProduct" onclick="fillmenu('+row.idp+');prdtitle.innerText=\'Modifier produit\';cat.value='+row.idc+';nomP.value=\''+row.nom+'\';price.value='+row.prix+';punit.value=\''+row.unit+'\';prdvalid.onclick=function() { updateproduct('+row.idp+') }"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer produit\';poptext.innerText=\'Voulez-vous supprimer le produit : '+row.nom+' ?\';popvalid.onclick=function() { supprprd('+row.idc+','+row.idp+') }"><img src="img/trash.png" width=20></img></a></td></tr>');		
		});
	  });
var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var db = new sqlite3.Database(path+'db/caisse.db');
db.each("SELECT * FROM cat", function(err, row) {
	$('#TbCategory').append('<tr class="clickable-row d-flex" id="cat'+row.idc+'"><td class="col-2">'+row.idc+'</td><td class="col-6">'+row.nom+'</td><td class="col-4 pl-4"><a href="#" data-toggle="modal" data-target="#ModalCategory" onclick="cattitle.innerText=\'Modifier catégorie\';printer.value='+row.imp+';nomC.value=\''+row.nom+'\';tvas.value='+row.tvas+';tvae.value='+row.tvae+';catvalid.onclick=function() { updatecat('+row.idc+') }"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer catégorie\';poptext.innerText=\'Voulez-vous supprimer la catégorie : '+row.nom+' ?\';popvalid.onclick=function() { supprcat('+row.idc+') }"><img src="img/trash.png" width=20></img></a></td></tr>');
});
$( "#ModalServeurs" ).load( "modals/modal_serveurs.html" );
//$( "#ModalProduct" ).load( "modals/modal_product.html" );
$( "#popmsg" ).load( "modals/popmsg.html" );
$('#ModalBarres').on('hidden.bs.modal', function () {
	cltitle.innerText="Modifier Code Barre";
	clvalid.onclick=function() { createcb() }
    //$( "#ModalProduct" ).load( "modals/modal_product.html" );
});
function createserveur() {
	if (nomsv.value=="") {
		$("#alertmsgnom").show();
		$("#svexist").hide();
	} else {
		$("#alertmsgnom").hide();
		$("#svexist").hide();
		var db = new sqlite3.Database(path+'db/caisse.db');
		db.run("CREATE TABLE IF NOT EXISTS serveur (sv NUMBER, nom VARCHAR);");
		db.get("Select * from serveur where nom='"+nomsv.value+"';", function(error, row2) {
			if (row2 !== undefined) {
				$("#svexist").show();
			} else {
				sqlite.open(path+'db/caisse.db').then(db2=>{
					db2.run("INSERT INTO serveur select case when max(sv) is null then 1000 else max(sv+10) end sv, '"+nomsv.value+"' nom from serveur;").then( () => {
						//document.getElementById('cat'+cat.value).click();
						location.reload()
					});
					
				});
			}
		});
	}
}
function supprprd(idc,idp) {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("delete from menu where idp="+idp);
		db.run("delete from prd where idp="+idp+";").then( () => {
			$("#popmsg").modal("hide");
			document.getElementById('cat'+idc).click();
		});
	});	
}
function delinmenu(idp) {
	$("[idprd="+idp+"]").remove()
}
function addinmenu(idp) {
	$('#cat2').removeClass("is-invalid");
	$('#prd2').removeClass("is-invalid");
	if (cat2.value=="") {
		$('#cat2').addClass("is-invalid");
	}
	if (prd2.value=="") {
		$('#prd2').addClass("is-invalid");
	}
	if (cat2.value!=""&&prd2.value!=""){
		//alert($('#prd2').val()[0]);
		$('#prd2').val().forEach(function (it) {
			$('#inmenu').append('<div class="card col-3 ml-1 mb-1 prdinmenu" idprd="'+it+'"><div class="panel-footer text-center"><span class="pull-right" aria-hidden="true" style="cursor:pointer;" onclick="delinmenu('+it+')">&times;</span></div><div class="card-body p-2 m-0 text-center align-middle" style="cursor:pointer;">'+$("#cat2 option:selected").text()+'<br>'+$("#prd2 option[value='"+it+"']").text()+'</div></div>')
			$("#prd2 option[value='"+it+"']").remove();
			$('.prd').selectpicker('refresh');
		})
	}
}
function fillmenu(idp) {
	db.run("CREATE TABLE IF NOT EXISTS menu (idp NUMBER, idpi NUMBER);");
	$('#inmenu').html("");
	db.each("select idpi, cat.nom nomc, prd.nom nomp from menu, prd, cat where prd.idp=menu.idpi and cat.idc=prd.idc ", (err, row) => {
		$('#inmenu').append('<div class="card col-3 ml-1 mb-1 prdinmenu" idprd="'+row.idpi+'"><div class="panel-footer text-center"><span class="pull-right" aria-hidden="true" style="cursor:pointer;" onclick="delinmenu('+row.idpi+')">&times;</span></div><div class="card-body p-2 m-0 text-center align-middle">'+row.nomc+'<br>'+row.nomp+'</div></div>')
	})
}
function updateproduct(idp) {
	if (nomP.value=="") {
		alertmsgP.innerText="Veuillez saisir un nom";
		$("#alertmsgP").show();
	} else if (price.value=="") {
		alertmsgP.innerText="Veuillez saisir un prix";
		$("#alertmsgP").show();
	} else {
		sqlite.open(path+'db/caisse.db').then(db2=>{
			var menu=0;
			db2.run("delete from menu where idp="+idp)
			.then(() => {
				var array = $('.prdinmenu').map(function(){
					return '('+idp+','+$(this).attr('idprd')+')'
				}).get();
				if (array.toString()!="") {
					db2.run("insert into menu values "+array.toString()+";");
					menu=1;
				}
			})
			.then(() => {
				//console.log(nomP.value)
				//console.log(nomP.value.toString().replace(/\'/g,"''"))
				//console.log("update prd set idc="+cat.value+",nom='"+nomP.value.replace(/\'/g,"''")+"',prix="+price.value.replace(",",".")+", menu="+menu+" where idp="+idp+" ;")
				db2.run("update prd set idc="+cat.value+",nom='"+nomP.value.replace(/\'/g,"''")+"',prix="+price.value.replace(",",".")+", menu="+menu+", unit='"+punit.value+"' where idp="+idp+" ;").then( () => {
					document.getElementById('cat'+cat.value).click();
					$("#ModalProduct").modal("hide");
					$( "#ModalProduct" ).load( "modals/modal_product.html" );
				});
			});
		});
	}
}
function supprbarre(cb) {
	sqlite.open(path+'db/caisse.db').then(db2=>{
		db2.run("delete from barres where cb="+cb)
		.then(()=>{
			//db2.run("INSERT INTO barres VALUES ("+cb.value+", '"+nomcb.value.replace(/\'/g,"''")+"',"+prixcb.value.replace(",",".")+","+tvacb.value.replace(",",".")+");").then( () => {
				//document.getElementById('cat'+cat.value).click();
				location.reload()
			//});
		})
	});
}
function updatebarre() {
	if (cb.value=="") {
		$("#alertmsgcb").show();
	} else if (nomcb.value=="") {
		$("#alertmsgnom").show();
	} else if (prixcb.value=="") {
		$("#alertmsgprix").show();
	} else if (tvacb.value=="") {
		$("#alertmsgtva").show();
	} else {
		$("#alertmsgcb").hide();
		$("#alertmsgnom").hide();
		$("#alertmsgprix").hide();
		$("#alertmsgtva").hide();
		var db = new sqlite3.Database(path+'db/caisse.db');
		db.run("CREATE TABLE IF NOT EXISTS barres (cb NUMBER, nom VARCHAR, prix NUMERIC, tva NUMERIC);");
		sqlite.open(path+'db/caisse.db').then(db2=>{
			db2.run("delete from barres where cb="+cb.value)
			.then(()=>{
				db2.run("INSERT INTO barres VALUES ("+cb.value+", '"+nomcb.value.replace(/\'/g,"''")+"',"+prixcb.value.replace(",",".")+","+tvacb.value.replace(",",".")+");").then( () => {
					//document.getElementById('cat'+cat.value).click();
					location.reload()
				});
			})
		});
	}
}
function createbarre() {
	if (cb.value=="") {
		$("#alertmsgcb").show();
	} else if (nomcb.value=="") {
		$("#alertmsgnom").show();
	} else if (prixcb.value=="") {
		$("#alertmsgprix").show();
	} else if (tvacb.value=="") {
		$("#alertmsgtva").show();
	} else {
		$("#alertmsgcb").hide();
		$("#alertmsgnom").hide();
		$("#alertmsgprix").hide();
		$("#alertmsgtva").hide();
		var db = new sqlite3.Database(path+'db/caisse.db');
		db.run("CREATE TABLE IF NOT EXISTS barres (cb NUMBER, nom VARCHAR, prix NUMERIC, tva NUMERIC);");
		db.get("Select * from barres where cb="+cb.value+";", function(error, row2) {
			if (row2 !== undefined) {
				$("#cbexist").show();
			} else {
				sqlite.open(path+'db/caisse.db').then(db2=>{
					db2.run("INSERT INTO barres VALUES ("+cb.value+", '"+nomcb.value.replace(/\'/g,"''")+"',"+prixcb.value.replace(",",".")+","+tvacb.value.replace(",",".")+");").then( () => {
						//document.getElementById('cat'+cat.value).click();
						location.reload()
					});
					
				});
			}
		});
	}
}
function updatecat(idc) {
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
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.run("update cat set nom='"+nomC.value+"', tvas="+tvas.value+", tvae="+tvae.value+", imp="+printer.value+" where idc="+idc+";").then( () => {
				location.reload();
			})
		})
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
		var db = new sqlite3.Database(path+'db/caisse.db');
		db.run("CREATE TABLE IF NOT EXISTS cat(idc NUMBER, nom VARCHAR,tvas NUMERIC, tvae NUMERIC, imp VARCHAR);");
		db.get("Select * from cat where nom='"+nomC.value+"'", function(error, row2) {
			if (row2 !== undefined) {
				alertmsg.innerText="Cette categorie existe deja";
				$("#alertmsg").show();
			} else {
				var mx=1000;
				db.get("select max(idc+10) mx from cat", (err, row) => {
					if (row !== undefined) { mx=row.mx;}
					db.run("INSERT INTO cat VALUES("+mx+", '"+nomC.value.replace(/\'/g,"''")+"',"+tvas.value+","+tvae.value+","+printer.value+");");
					location.reload();
				});
				
			}
		});
	}
}
