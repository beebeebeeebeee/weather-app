const electron = require("electron");
const url = require("url");
const path = require("path");
const axios = require('axios');
const api = require("./api.json");

process.env.NODE_ENV = "develop";
const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;

// Listen for the app to be ready

app.on("ready", function () {
  //set the google api key to enable the geolocation api
  process.env.GOOGLE_API_KEY = api.GOOGLE_API;
  //create window
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  //load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "src/mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  //build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(mainMenu);
});

//catch location:get
ipcMain.on("location:get", function (e, lat, lon) {
  console.log(`lat: ${lat}; lon: ${lon}`);

  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.post(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api.WEATHER_API}&units=metric`)
  .then((response) => {
    console.log(response.data);
    mainWindow.webContents.send("weather:put", response.data);
  })
  .catch((error) => {
    console.error(error);
  });

  
});

//menu
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
];

if (process.platform == "darwin") {
  mainMenuTemplate.unshift({ label: "WEATHER-APP" });
}

if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Dev Tools",
    submenu: [
      {
        label: "Dev Tools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.openDevTools({ mode: "undocked" });
        },
      },
      {
        role: "reload",
      },
    ],
  });
}
