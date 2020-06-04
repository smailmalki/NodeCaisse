$( "#popmsg" ).load( "modals/popmsg.html" );
$( "#ModalTicket" ).load( "modals/modal_ticket.html" );
var path=window.location.href.replace("stats.html","").replace("file:///","");
$('.myTableP').on('click', '.clickable-row', function(event) {
	$(this).addClass('active').siblings().removeClass('active');
});
$('.myTableC').on('click', '.clickable-row', function(event) {
		$(this).addClass('active').siblings().removeClass('active');
		$('#TbTick > tbody').html("");
		if ($(this).find('td:first').html()=="X") {
			db.each("SELECT * FROM tot where dtez=''", function(err, row) {
				$('#TbTick > tbody').append('<tr class="clickable-row"><td>'+row.idt+'</td><td>'+row.dte+'</td><td>'+row.tot+'</td><td>'+row.tva+'</td><td>'+row.service+'</td><td><img src="img/view.png" style="width:20px;cursor:pointer;" data-toggle="modal" data-target="#ModalTicket" onclick="fillTick(\''+row.idt+'\')"></td></tr>');
			});
		} else {
			//alert("SELECT * FROM tot where dtez='"+$(this).find('td:last').attr("z")+"'");
			db.each("SELECT * FROM tot where dtez='"+$(this).find('td:last').attr("z")+"'", function(err, row) {
				$('#TbTick > tbody').append('<tr class="clickable-row"><td>'+row.idt+'</td><td>'+row.dte+'</td><td>'+row.tot+'</td><td>'+row.tva+'</td><td>'+row.service+'</td><td><img src="img/view.png" style="width:20px;cursor:pointer;" data-toggle="modal" data-target="#ModalTicket" onclick="fillTick(\''+row.idt+'\')"></td></tr>');
			});
			//alert($(this).find('td:last').html());
		}

		
		/*var db = new sqlite3.Database('db/caisse.db');
		$('#TbProduct > tbody').html("");
		db.each("SELECT * FROM prd where idc="+$(this).find('td:first').html(), function(err, row) {
			$('#TbProduct').append('<tr class="clickable-row"><td>'+row.idp+'</td><td>'+row.nom+'</td><td>'+row.prix+'</td><td><a href="#"><img src="img/pen.svg" width=20></img></a><a href="#" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Supprimer produit\';poptext.innerText=\'Voulez-vous supprimer le produit : '+row.nom+' ?\';popvalid.onclick=function() { supprprd('+row.idc+','+row.idp+') }"><img src="img/trash.png" width=20></img></a></td></tr>');		
		});*/
	  });
var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var db = new sqlite3.Database('db/caisse.db');
sqlite.open(path+'db/caisse.db').then(db=>{
	db.each("SELECT 'Z' zx, count(*) nb, round(sum(tot),2) tot, dtez FROM tot where dtez<>'' group by dtez order by dtez asc;", function(err, row) {
		$('#TbZX').append('<tr class="clickable-row" id="'+row.dtez+'"><td>'+row.zx+'</td><td class="text-center">'+row.nb+'</td><td class="text-center">'+row.tot+'</td><td>'+row.dtez+'</td><td class="pl-0" z="'+row.dtez+'"><img src="img/receipt_printer.png"></td></tr>');
	}).then( () => {
		db.each("SELECT 'X' zx, count(*) nb, round(sum(tot),2) tot, dtez FROM tot where dtez='' group by dtez;", function(err, row) {
			$('#TbZX').append('<tr class="clickable-row" id="'+row.dtez+'"><td>'+row.zx+'</td><td class="text-center">'+row.nb+'</td><td class="text-center">'+row.tot+'</td><td class="text-center"><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#popmsg" onclick="poptitle.innerText=\'Cloture\';poptext.innerText=\'Confirmer la cloture\';popvalid.onclick=function() { Cloturer() }">Cloturer</button></td><td class="pl-0"><img src="img/receipt_printer.png"></td></tr>');
		});
	})
})

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