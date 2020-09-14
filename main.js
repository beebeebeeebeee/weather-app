const electron = require("electron");
const url = require("url");
const path = require("path");
const axios = require("axios");
const api = require("./api.json");

process.env.NODE_ENV = "develop";
const { app, BrowserWindow, Menu, ipcMain } = electron;

let week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
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
  mainWindow.hide();
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

  setInterval(() => {
    var today = new Date();
    var weekday = week[today.getDay()];
    var h = ("0" + today.getHours()).slice(-2);
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);

    mainWindow.webContents.send("time:put", `${weekday} ${h}:${m}:${s}`);
  }, 500);
});

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  } // add zero in front of numbers < 10
  return i;
}

//catch location:get
ipcMain.on("location:get", function (e, lat, lon) {

  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios
    .post(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${api.GOOGLE_API}&language=zh-TW`
    )
    .then((response) => {
      //console.log(response.data);
      mainWindow.webContents.send("name:put", response.data);
    })
    .catch((error) => {
      console.error(error);
    });33

  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios
    .post(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api.WEATHER_API}&units=metric&lang=zh_tw`
    )
    .then((response) => {
      //console.log(response.data);
      mainWindow.webContents.send("weather:put", response.data);
    })
    .catch((error) => {
      console.error(error);
    });

  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios
    .post(
      `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc`
    )
    .then((response) => {
      //console.log(response.data);
      mainWindow.webContents.send("weather_future:put", response.data);
      mainWindow.show();
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
      {
        role: "copy",
      },
      {
        role: "paste",
      },
    ],
  });
}
