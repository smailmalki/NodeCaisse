var path=window.location.href.replace("tables.html","").replace("file:///","");
var sqlite = require('sqlite-async');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(path+'db/caisse.db');
var ind=1;
var tid=1010;
var tids=1010;
var card=1;


$( "#ModalTable" ).load( "modals/modal_table.html" );
$( "#ModalSalle" ).load( "modals/modal_salle.html" );
$( "#ModalSupprSalle" ).load( "modals/modal_supprsalle.html" );

//sqlite.open('db/caisse.db')
//.then( db=> {
	var i = 1;
	db.each("Select * from salles order by cardinal;", function(error, row) {
		$('.nav').append("<li class='nav-item'><a href='#sc"+row.ids+"' data-toggle='tab' class='nav-link "+(i==1?'active':'')+"' id='s"+row.ids+"' sid='"+row.ids+"'>"+row.nom+"</a></li>");
		$('.tab-content').append("<div class='tab-pane "+(i==1?'active':'')+"' id='sc"+row.ids+"'></div>");
		$('#lsalles').append('<option value="'+row.ids+'">'+row.nom+'</option>')
		baddtable.style.visibility="visible"
		bsupprsalle.style.visibility="visible"
		i++;
	})
	db.each("Select * from tables;", function(error, row2) {
		$('#sc'+row2.ids).append("<div class='drag' style='width:"+row2.w+"px;height:"+row2.h+"px;top:"+row2.t+"px;left:"+row2.l+"px;'><h3 style='width:100%;background:grey;text-align:center;' id='"+row2.idt+"'>"+row2.nom+"</h3><img class='del' style='left:"+(row2.w-15)+"px;cursor:pointer;' src='img/delete2.png'  data-toggle='modal' data-target='#popmsg' onclick='$(\"#poptitle\").text(\"Supprimer table\");$(\"#poptext\").text(\"Supprimer "+row2.nom+" ?\");;popvalid.onclick=function() { supprtable(\""+row2.idt+"\")};'><div class='resize' style='left:"+(row2.w-20)+"px;top:"+(row2.h-20)+"px;'><div class='resize2'></div></div></div>");
	})
	db.each("Select max(ids+10) tids, max(cardinal+1) card from salles;", (error,row) => {
		if (row !== undefined) {
			tids=row.tids;
			card=row.card;
		}
	})
	db.each("Select max(idt+10) tid, max(ind+1) mx from tables;", (error,row) => {
		if (row !== undefined) {
			ind=row.mx;
			tid=row.tid;
		}
	})
//})



target = null;

document.body.addEventListener('touchstart', handleTouchStart, false);
document.body.addEventListener('touchmove', handleTouchMove, false);
document.body.addEventListener('touchend', handleTouchEnd, false);
document.body.addEventListener('touchcancel', handleTouchCancel, false);

function handleTouchStart(e) {
	if (e.touches.length == 1) {
		var touch = e.touches[0];
		target = touch.target;
	}
}
function handleTouchMove(e) {
	if (e.touches.length == 1) {
		if(target.className ===  "drag") {
			var c = target.childNodes;
			moveDrag(e,target,target.children[2]);
		} else if (target.className === "resize") {
			var c = target.parentElement.childNodes;
			resizeDrag(e,target.parentElement,target,target.parentElement.children[1]);
		}
	}
}
function handleTouchEnd(e) {
	if (e.touches.length == 0) { // User just took last finger off screen
		if (target.className=="drag"||target.className == "resize") {
			var h3 = target.children[0];
			var obj = target;
			if (target.className=="resize") {
				h3 = target.parentElement.children[0];
				obj=target.parentElement;
			}
			var sqlite3 = require('sqlite3');
			var db = new sqlite3.Database(path+'db/caisse.db');
			
			db.run("update tables set w="+obj.offsetWidth+",h="+obj.offsetHeight+",t="+obj.offsetTop+",l="+obj.offsetLeft+" where idt="+h3.id)
			saveTables()
		}
		target = null;
		
	}
}
function handleTouchCancel(e) {
	if (target!==null) {
			saveTables()
		}
	return;
}

function resizeDrag(e,drag,resize,del) {
	var touch = e.touches[0];

	resize.style.left = (-30+touch.pageX - drag.offsetLeft - 15)+ "px";
	resize.style.top = (-30+touch.pageY - drag.offsetTop - 15) + "px";

	del.style.left = (-30+touch.pageX - drag.offsetLeft - 17)+ "px";
	del.style.top = (-30+touch.pageY - drag.offsetTop - 115) ;

	drag.style.width = (-30+touch.pageX - drag.offsetLeft+3)+ "px";
	drag.style.height = (-30+touch.pageY - drag.offsetTop+3)+ "px";
}
function moveDrag(e, drag,resize) {
	var touch = e.touches[0];
	if (!doElsCollide(drag,pan)) {
		drag.style.left = (-20+touch.pageX -drag.offsetWidth/2)+ "px";
		drag.style.top = (-20+touch.pageY - drag.offsetHeight/2) + "px";
		resize.style.left=(touch.pageX +drag.offsetWidth/2 );
		resize.style.top=(touch.pageY +drag.offsetHeight/2);
	} else {
		if ( (touch.pageX -drag.offsetWidth/2)<drag.offsetLeft) {
			drag.style.left = (touch.pageX -drag.offsetWidth/2)+ "px";
			resize.style.left=(touch.pageX +drag.offsetWidth/2 );
		}
		drag.style.top = (touch.pageY - drag.offsetHeight/2) + "px";
		resize.style.top=(touch.pageY +drag.offsetHeight/2);
	}
}


function doElsCollide(el1, el2) {
	el1.offsetBottom = el1.offsetTop + el1.offsetHeight;
	el1.offsetRight = el1.offsetLeft + el1.offsetWidth;
	el2.offsetBottom = el2.offsetTop + el2.offsetHeight;
	el2.offsetRight = el2.offsetLeft + el2.offsetWidth;
	
	return !((el1.offsetBottom < el2.offsetTop) ||
			(el1.offsetTop > el2.offsetBottom) ||
			(el1.offsetRight < el2.offsetLeft) ||
			(el1.offsetLeft > el2.offsetRight))
};

function addtable() { 
	if (nomT.value=="") {
		alertmsg.innerText="Veuillez saisir un nom";
		$("#alertmsg").show();
	} else {
		$("#alertmsg").hide();
		db.get("Select * from tables where lower(nom)='"+nomT.value.toLowerCase()+"';", function(error, row) {
			if (row !== undefined) {
				alertmsg.innerText="Une table existe déjà avec ce nom";
				$("#alertmsg").show();
				
			} else {
				db.run("insert into tables values ("+tid+","+$('.nav-link.active')[0].id.replace('s','')+",'"+nomT.value+"',100,100,200,100,"+ind+")")
				saveTables()
				$('#sc'+$('.nav-link.active')[0].id.replace('s','')).append("<div class='drag'><h3 style='width:100%;background:grey;text-align:center;' id='"+tid+"'>"+nomT.value+"</h3><img class='del' src='img/delete2.png' data-toggle='modal' data-target='#popmsg' onclick='$(\"#poptitle\").text(\"Supprimer table\");$(\"#poptext\").text(\"Supprimer "+nomT.value+" ?\");;popvalid.onclick=function() { supprtable(\""+tid+"\")};'><div class='resize'><div class='resize2'></div></div></div>");
				tid+=10;
				ind++;
				$("#alertmsg").hide();
				nomT.value="";
				$("#ModalTable").modal("hide");	
			}
		})		
	}
}

function addsalle() { 
	if (nomS.value=="") {
		alertmsgS.innerText="Veuillez saisir un nom";
		$("#alertmsgS").show();
	} else {
		$("#alertmsgS").hide();
		db.get("Select * from salles where lower(nom)='"+nomS.value.toLowerCase()+"';", function(error, row) {
			if (row !== undefined) {
				alertmsgS.innerText="Une salle existe déjà avec ce nom";
				$("#alertmsgS").show();
				
			} else {
				db.run("insert into salles values ("+tids+",'"+nomS.value+"',"+card+")")
				saveTables()
				$("#ModalSalle").modal("hide");	
				location.reload();
			}
		})		
	}
}

function supprtable(idt) {
	sqlite.open(path+'db/caisse.db')
	.then( db=> {
		db.run("delete from tables where idt="+idt)
		.then( () => {
			document.getElementById(idt).parentElement.remove();
			$("#popmsg").modal("hide");
			saveTables()
		})
	})
}
function supprsalle() {
	if (lsalles.value=="") {
		alertmsgS.innerText="Veuillez saisir un nom";
		$("#alertmsgS").show();
	} else {
		sqlite.open(path+'db/caisse.db')
		.then( db=> {
			db.run("delete from salles where ids="+lsalles.value)
			db.run("delete from tables where ids="+lsalles.value)
			.then( () => {
				$("#ModalSupprSalle").modal("hide");
				location.reload();
			})
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