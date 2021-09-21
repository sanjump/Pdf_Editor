const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')

const url = require("url");
const path = require("path");
const fs = require('fs');
const glob = require('glob');
const read = require('fs-readdir-recursive')

let files = [];
let folderFiles=[];
let imgfiles=[];
//directory = 'C:\\Users\\mpsan\\OneDrive\\Desktop\\Career\\H&R block'


ipcMain.on('file', (event, arg) => {
  
  saveFile(arg)

})

function saveFile(arg){

  fs.access('D:\\jsons\\'+arg[0].file, (err) => {
    if (err) {

       
        fs.writeFile('D:\\jsons\\'+arg[0].file, JSON.stringify(arg), function(err) {
          if(err) {
              return console.log(err);
          }
          
      }); 
      } 
      
      
      else {
      
        fs.writeFile('D:\\jsons\\'+arg[0].file, JSON.stringify(arg), function(err) {
          if(err) {
              return console.log(err);
          }
         
      }); 
      }
  })
}

ipcMain.on('selectedNode', (event, arg) => {
  
  checkFile(arg,event)

})

function checkFile(arg,event){

  fs.access('D:\\jsons\\'+arg.slice(0, -3) + 'json', (err) => {
    if (err) {

      
      event.sender.send('data','No')
      
        
      } 
      
      
      else {
      
        fs.readFile('D:\\jsons\\'+arg.slice(0, -3) + 'json', function(err,data) {
          if(err) {
              return console.log(err);
          }
          else{
            if(data.length!=0){
            event.sender.send('data',JSON.parse(data))
            console.log(JSON.parse(data))
            }
          }
         
      }); 
       
      }
  })
}

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })


  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  Menu.setApplicationMenu(mainMenu);

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );



}

app.on('ready', createWindow)



// var getDirectories = function (src, callback) {
//   glob(src + '/*/*', callback);
// };

// const getFilesRecursively = (directory) => {
//   const filesInDirectory = fs.readdirSync(directory);
//   for (const file of filesInDirectory) {
//     const absolute = path.join(directory, file);
//     if (fs.statSync(absolute).isDirectory()) {
//         getFilesRecursively(absolute);
//     } else {
//         files.push(absolute);
//     }
//   }
// };



let types = [
  { name: 'Images', extensions: ['jpg','jpeg','png'] }
]

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open file',
        click() {
          dialog.showOpenDialog({ filters: types, properties: ['openFile', 'multiSelections'] })
            .then(function (fileObj) {

              if (!fileObj.canceled) {
                
                 files=[]
                 for(var i =0;i<fileObj.filePaths.length;i++){
                   files.push(fileObj.filePaths[i].toString())
                
                 }

                mainWindow.webContents.send("getfile", files)
                console.log(files)
                
              
                
      
              }

            }).catch(function (err) {
              console.error(err)
            })
        }
      }
      ,
      {
        label: 'Open folder',
        click() {
          dialog.showOpenDialog({ filters: types,properties: ['openDirectory'] })
            .then(function (fileObj) {

              if (!fileObj.canceled) {
                folderFiles=[]
                folderFiles.push(fileObj.filePaths[0].toString())
               for(var i =0;i<types[0].extensions.length;i++){
                var foundFiles = read(fileObj.filePaths[0].toString()).filter(item => item.endsWith("."+types[0].extensions[i]));
                imgfiles.push(foundFiles)
                }
                folderFiles.push(imgfiles)
                console.log(folderFiles);
                mainWindow.webContents.send('getfolder', folderFiles)
                // getFilesRecursively(fileObj.filePaths[0].toString())
                // 
                // 
                    
                  
             //   getDirectories(fileObj.filePaths[0].toString())
                
                

              }

            }).catch(function (err) {
              console.error(err)
            })
        }
      },
      {
        label: 'Quit',
        click() {
          app.quit();
        }
      }
    ]
  }
];


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
