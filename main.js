const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu} = electron;

let mainWindow;



// Listen for the app to be ready

app.on("ready", function () {
    process.env.GOOGLE_API_KEY = '***REMOVED***';
  //create window
  mainWindow = new BrowserWindow({ width: 600, height: 400 });
  //load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  //build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(mainMenu);

});

app.on("geolocation-request", function(event, webviewUrl, callback) {
    //call callback() to accept the geolocation request
    //or do nothing to deny the request
    callback();
});

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
      },
      {
        label: "Clear Items",
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Dev Tools",
    submenu: [
      {
        label: "Dev Tools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        },
      },
    ],
  },
];
