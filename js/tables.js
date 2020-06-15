var path=window.location.href.replace("tables.html","").replace("file:///","");
var sqlite = require('sqlite-async');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('db/caisse.db');
var ind=1;
var tid=1010;
sqlite.open('db/caisse.db').then(db=>{
    db.run("CREATE TABLE IF NOT EXISTS salles (ids NUMERIC, nom NUMERIC, cardinal NUMERIC);")
	db.run("CREATE TABLE IF NOT EXISTS tables (idt NUMERIC, ids NUMERIC, nom VARCHAR, w NUMERIC, h NUMERIC, t NUMERIC, l NUMERIC, ind NUMERIC);")
	.then(() => {
		db.get("Select max(idt+10) tid, max(ind) mx from tables;", function(error, row) {
			if (row !== undefined) {
				ind=row.mx+1;
				tid=row.tid;
			}
		});
	})
	.then(() => { 
		var i = 1;
		db.each("Select * from salles order by cardinal;", function(error, row) {
			$('.nav').append("<li class='nav-item'><a href='#sc"+row.ids+"' data-toggle='tab' class='nav-link "+(i==1?'active':'')+"' id='s"+row.ids+"' sid='"+row.ids+"'>"+row.nom+"</a></li>");
			i++;
		})
		/*.then(() => {
			$(".nav-item").click(function(e){
				$(".nav-link").removeClass("active");
				$(this).children().addClass("active");
			});
		})*/
	})
})




	$(".nav-item").click(function(e){
		$(".nav-link").removeClass("active");
		$(this).children().addClass("active");
	});


function addtable() { 
	//alert(nomT.value=="")
	
	if (nomT.value=="") {
		alertmsg.innerText="Veuillez saisir un nom";
		$("#alertmsg").show();
	} else {
		$("#alertmsg").hide();
		//alert($('#sc1030'/*+$('.nav-link.active')[0].id*/).text())
		db.get("Select * from tables where nom='"+nomT.value+"';", function(error, row) {
			if (row !== undefined) {
				alertmsg.innerText="Une table existe déjà avec ce nom";
				$("#alertmsg").show();
				
			} else {
				/* ToDo Vérifier si le nom n'est pas pris
				

				*/
				db.run("insert into tables values ("+tid+","+$('.nav-link.active')[0].id.replace('s','')+",'"+nomT.value+"',100,100,200,100,"+ind+")")
				saveTables()
				$('#sc'+$('.nav-link.active')[0].id.replace('s','')).append("<div class='drag'><h3 style='width:100%;background:grey;text-align:center;' id='"+tid+"'>"+nomT.value+"</h3><img class='del' src='img/delete2.png'><div class='resize'><div class='resize2'></div></div></div>");
				tid+=10;
				ind++;
			}
		})		
	}
}



function saveTables() {
	//alert($('.nav-link.active')[0].id)
	$(".alert-success").fadeTo(2000, 200).slideDown(200, function(){
		//$(".alert-success").alert('close');
		$(".alert-success").fadeTo(500, 0);
	});
}