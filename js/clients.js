var sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-async');
var path=window.location.href.replace("clients.html","").replace("file:///","");

$( "#popmsg" ).load( "modals/popmsg.html" );
$( "#ModalClient" ).load( "modals/modal_client.html" );

function updateclient() {
	if (telpc.value=="") {
		$("#alertmsgtel").show();
	} else if (nomc.value=="") {
		$("#alertmsgnom").show();
	} else {
		$("#alertmsgtel").hide();
		$("#alertmsgnom").hide();
		sqlite.open(path+'db/caisse.db').then(db=>{
			db.run("replace into clients values ('"+telpc.value.toString().replace(/\'/g,"''")+"','"+nomc.value.replace(/\'/g,"''")+"','"+adrc.value.replace(/\'/g,"''")+"','"+comp1c.value.replace(/\'/g,"''")+"','"+comp2c.value.replace(/\'/g,"''")+"','"+comp3c.value.replace(/\'/g,"''")+"')")
			.then(() => {
				location.reload()
			})
		})
	}
}

function supprclient(cl) {
	sqlite.open(path+'db/caisse.db').then(db=>{
		db.run("delete from clients where tel='"+cl+"'")
		.then(() => {
			location.reload()
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
			db.get("select * from clients where tel='"+telpc.value+"'")
			.then((row,error) => {
				if (row!==undefined) {
					$("#clientexist").show();
				} else {
					$("#clientexist").hide();
					//alert("insert into clients values ('"+telpc.value.toString()+"','"+nomc.value+"','"+adrc.value+"','"+comp1c.value+"','"+comp2c.value+"','"+comp3c.value+"')")
					db.run("insert into clients values ('"+telpc.value.toString()+"','"+nomc.value.replace(/\'/g,"''")+"','"+adrc.value.replace(/\'/g,"''")+"','"+comp1c.value.replace(/\'/g,"''")+"','"+comp2c.value.replace(/\'/g,"''")+"','"+comp3c.value.replace(/\'/g,"''")+"')")
					.then(() => {
						location.reload()
					})
				}
			})
		})
	}
}
