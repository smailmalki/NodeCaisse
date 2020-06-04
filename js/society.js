$( "#ModalSociety" ).load( "modals/modal_society.html" );
var sqlite = require('sqlite-async');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('db/caisse.db');
sqlite.open('db/caisse.db').then(db=>{
    db.run("CREATE TABLE IF NOT EXISTS soc (nom VARCHAR, ad VARCHAR, cp VARCHAR, vl VARCHAR, tl VARCHAR, ic1 VARCHAR, ic2 VARCHAR, ic3 VARCHAR, dev VARCHAR);")
    .then( () => {
        db.get("select * from soc;").then( (row) => {
            nom.innerText=row.nom;
            ad.innerText=row.ad;
            cp.innerText=row.cp;
            vl.innerText=row.vl;
            tel.innerText=row.tl;
            ic1.innerText=row.ic1;
            ic2.innerText=row.ic2;
            ic3.innerText=row.ic3;
            devise.innerText=row.devise;
        })
    })
})

function majsoc() {
    if (nomS.value==="") {
		$("#alertmsg").show();
    } else {
        sqlite.open('db/caisse.db').then(db=>{
            db.run("delete from soc;")
            .then( () => {
                db.run("insert into soc values ('"+nomS.value+"','"+adr.value+"','"+cpl.value+"','"+ville.value+"','"+telp.value+"','"+icu.value+"','"+icd.value+"','"+ict.value+"','','"+deviseS.value+"');")
                .then( () => {
                    location.reload();
                })
            })
        })
    }
}