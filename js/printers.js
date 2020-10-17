var path=window.location.href.replace("printers.html","").replace("file:///","");
var sqlite3 = require('sqlite3').verbose();
$( "#ModalPrinters" ).load( "modals/modal_printers.html" );
var db = new sqlite3.Database(path+'db/caisse.db');
db.run("CREATE TABLE IF NOT EXISTS printers (idp NUMBER, nom VARCHAR, conn VARCHAR, params VARCHAR);")
db.get("SELECT * FROM printers where idp=1", function(err, row) {
    impcaisse.innerText=row.conn+' - '+row.params;
});
db.get("SELECT * FROM printers where idp=2", function(err, row) {
    impcuisine.innerText=row.conn+' - '+row.params;
});
//$( "#ModalProduct" ).load( "modals/modal_product.html" );
//$( "#popmsg" ).load( "modals/popmsg.html" );

function validprinter(idp,nomp) {
    switch($(".nav-item.active").text()) {
        case 'USB':
            
                //alert($('#print option').length);
                //alert(idp);
                //alert(nomp);
                //alert($('#print').val());
            if ($('#print option').length>1 && $('#print').val()!='') {
                majprinterdb(idp,nomp,'usb',$('#print').val())
            }
        case 'Network' :
            if ($('#tip').val()!='') {
                majprinterdb(idp,nomp,'network',$('#tip').val())
            }
        case 'Serial' :
            if ($('#tport').val()!=''&&$('#tbaud').val()!=''&&$('#tstop').val()!='') {
                majprinterdb(idp,nomp,'serial',$('#tport').val()+"-"+$('#tbaud').val()+"-"+$('#tstop').val())
            }
    }
}

function majprinterdb(idp,nomp,conn,param) {
    
    var db = new sqlite3.Database(path+'db/caisse.db');
    db.run("delete from printers where idp="+idp+";");
    db.run("insert into printers values ("+idp+", '"+nomp+"','"+conn+"', '"+param+"');")
    $("#ModalPrinters").hide();
    location.reload();

}