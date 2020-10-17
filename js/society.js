$( "#ModalSociety" ).load( "modals/modal_society.html" );

var path=window.location.href.replace("society.html","").replace("file:///","");
var sqlite = require('sqlite-async');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(path+'db/caisse.db');
sqlite.open(path+'db/caisse.db').then(db=>{
    db.run("CREATE TABLE IF NOT EXISTS soc (nom VARCHAR, ad VARCHAR, cp VARCHAR, vl VARCHAR, tl VARCHAR, ic1 VARCHAR, ic2 VARCHAR, ic3 VARCHAR, devise VARCHAR, logo VARCHAR);")
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
            if (row.logo) {
                $('#imglogo').attr("src", "img/"+row.logo);
            } else {
                $('#imglogo').attr("src", "img/no.jpg");
            }
        })
    })
})

function supprlogo() {
    $('#imglogo').attr("src", "img/no.jpg");
    db.run("update soc set logo=null")
}
function majsoc() {
    if (nomS.value==="") {
		$("#alertmsg").show();
    } else {
        sqlite.open(path+'db/caisse.db').then(db=>{
            db.run("delete from soc;")
            .then( () => {
                var isrc="";
                if ($('#imglogo').attr("src").replace("img/","")!="no.jpg") {
                    isrc=$('#imglogo').attr("src").replace("img/","");
                }
                db.run("insert into soc values ('"+nomS.value.replace(/\'/g,"''")+"','"+adr.value.replace(/\'/g,"''")+"','"+cpl.value.replace(/\'/g,"''")+"','"+ville.value.replace(/\'/g,"''")+"','"+telp.value.replace(/\'/g,"''")+"','"+icu.value.replace(/\'/g,"''")+"','"+icd.value.replace(/\'/g,"''")+"','"+ict.value.replace(/\'/g,"''")+"','"+deviseS.value.replace(/\'/g,"''")+"','"+iscr+"');")
                .then( () => {
                    location.reload();
                })
            })
        })
    }
}

const electron = require('electron'); 
const path2 = require('path'); 
  
// Importing dialog module using remote 
const dialog = electron.remote.dialog; 
  
var uploadFile = document.getElementById('upload'); 

var uploadFile = document.getElementById('upload'); 
global.filepath = undefined; 

uploadFile.addEventListener('click', () => { 
// If the platform is 'win32' or 'Linux' 
    if (process.platform !== 'darwin') { 
        // Resolves to a Promise<Object> 
        dialog.showOpenDialog({ 
            title: 'Select the File to be uploaded', 
            defaultPath: path2.join(__dirname, '../assets/'), 
            buttonLabel: 'Upload', 
            // Restricting the user to only Text Files. 
            filters: [ 
                { 
                    name: 'Logo', 
                    extensions: ['jpg', 'png', 'bmp'] 
                }, ], 
            // Specifying the File Selector Property 
            properties: ['openFile'] 
        }).then(file => { 
            // Stating whether dialog operation was 
            // cancelled or not. 
            //console.log(Object.keys(file)); 
            if (!file.canceled) { 
              // Updating the GLOBAL filepath variable  
              // to user-selected file. 
              global.filepath = file.filePaths[0].toString(); 
              global.filename = file.filePaths[0].toString().replace(/^.*[\\\/]/, ''); 
              //console.log(global.filepath); 
              //console.log(global.filename); 
              var fs = require('fs');
              var st =fs.createReadStream(global.filepath).pipe(fs.createWriteStream(path+'img/'+global.filename));
              st.on('close', function(){
                $('#imglogo').attr("src", "img/"+global.filename);
              })
              var db = new sqlite3.Database(path+'db/caisse.db');
              db.get("Select * from soc;", function(error, row2) {
                    if (row2 !== undefined) {
                        db.run("update soc set logo='"+global.filename+"';")
                    } else {
                        db.run("insert into soc (logo) values ('"+global.filename+"');")
                    }
                });
            }   
        }).catch(err => { 
            console.log(err) 
        }); 
    } 
    else { 
        // If the platform is 'darwin' (macOS) 
        dialog.showOpenDialog({ 
            title: 'Select the File to be uploaded', 
            defaultPath: path2.join(__dirname, '../assets/'), 
            buttonLabel: 'Upload', 
            filters: [ 
                { 
                    name: 'Text Files', 
                    extensions: ['txt', 'docx'] 
                }, ], 
            // Specifying the File Selector and Directory  
            // Selector Property In macOS 
            properties: ['openFile', 'openDirectory'] 
        }).then(file => { 
            console.log(file.canceled); 
            if (!file.canceled) { 
              global.filepath = file.filePaths[0].toString(); 
              console.log(global.filepath); 
            }   
        }).catch(err => { 
            console.log(err) 
        }); 
    } 
}); 