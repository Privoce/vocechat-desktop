import { release } from "node:os";
import { join } from "node:path";
// import NodeURL from "node:url";
import { app, BrowserWindow, desktopCapturer, ipcMain, Menu, shell, Tray } from "electron";
import { VocechatServer } from "@/types/common";
import { readUserData, writeUserData } from "./user-data";

// import { update } from "./update";

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
// process.env["ELECTRON_DEBUG_DRAG_REGIONS"] = "true";
let win: BrowserWindow;
let tray: Tray;
let triggerByQuit = false;
// let navView: BrowserView;
let winModal: BrowserWindow;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");
const Servers: VocechatServer[] = readUserData();
async function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    frame: false,
    minWidth: 800,
    minHeight: 600,
    width: 1200,
    height: 800,
    backgroundColor: "transparent",
    // useContentSize: true,
    // title: "",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      webviewTag: true,
      allowRunningInsecureContent: true,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.on("close", (e) => {
    console.log("event:close", e);
    if (!triggerByQuit) {
      e.preventDefault();
      win.hide();
    }
  });
  win.on("restore", function () {
    console.log("event:restore");

    win.show();
  });
  if (url) {
    // electron-vite-vue#298
    win.webContents.loadURL(url);
    if (process.env.NODE_ENV === "development") {
      // Open devTool if the app is not packaged
      win.webContents.openDevTools({
        mode: "detach"
      });
    }
  } else {
    win.webContents.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });
  // Apply electron-updater
  // update(win);
  // 初始化modal
  winModal = new BrowserWindow({
    width: 440,
    height: 322,
    resizable: false,
    parent: win,
    modal: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false,
    closable: true
  });
  if (url) {
    // electron-vite-vue#298
    winModal.loadURL(`${url}#/add-view-modal`);
  } else {
    winModal.loadFile(indexHtml, { hash: "/add-view-modal" });
  }
}

app.whenReady().then(() => {
  console.log("event:app-ready");
  createWindow();
  tray = new Tray(join(process.env.PUBLIC, "tray.png"));
  const contextMenu = Menu.buildFromTemplate([]);
  tray.on("click", function () {
    if (win && win.isVisible() &&win.isFocused()) {
      return;
    }
    if(win.isMinimized()){
      win.restore();
    }
    win.show();
    win.focus();
  });
  tray.setToolTip("VoceChat");
  tray.setContextMenu(contextMenu);
});
app.on("before-quit", () => {
  console.log("event:before-quit");
  triggerByQuit = true;
});

app.on("window-all-closed", () => {
  // save user data
  console.log("event:window-all-closed");

  writeUserData(Servers);
  win.destroy();
  // Servers = [];
  if (process.platform !== "darwin") app.quit();
});
app.on("will-quit", () => {
  // save user data
  console.log("event:will-quit");
  writeUserData(Servers);
});

app.on("second-instance", () => {
  console.log("event:second-instance", win);
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  console.log("event:activate", allWindows.length);
  if (allWindows.length) {
    win.show();
    win.focus();
  } else {
    createWindow();
  }
});
// Event handler for asynchronous incoming messages
// init redux store
ipcMain.handle("init-views", () => {
  console.log("handle:init-views", Servers.length);
  return Servers;
});
ipcMain.on("add-view", (event, arg) => {
  console.log("add-view", arg);
  const { data } = arg;
  if (Servers.find((item) => item.web_url === data.web_url)) {
    return;
  }
  Servers.push(data as VocechatServer);
});
ipcMain.on("remove-view", (event, arg) => {
  console.log("remove-view", arg);
  const { url } = arg;
  const idx = Servers.findIndex((item) => item.web_url === url);
  if (idx > -1) {
    Servers.splice(idx, 1);
  }
});
// add view modal visible
ipcMain.on("add-view-modal", (event, arg) => {
  console.log(arg);
  const { visible } = arg as { visible: boolean };
  if (visible) {
    // winModal.reload();
    winModal.show();
  } else {
    winModal.hide();
  }
});
// toggle popover
ipcMain.on("toggle-popover-window", (event, arg) => {
  console.log(arg);
  // const {
  //   visible,
  //   web_url,
  //   name = ""
  // } = arg as { visible: boolean; web_url: string; name?: string };
  // const currView = ViewMap[web_url];
  // if (currView) {
  //   console.log("post msg", visible, name);
  //   currView.webContents.send("server-name-popover", { visible, name });
  // }
});
// ignore certificate error
app.commandLine.appendSwitch("ignore-certificate-errors");
app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
  // On certificate error we disable default behavior (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  callback(true);
});

// share screen
ipcMain.handle("DESKTOP_CAPTURER_GET_SOURCES", (event, opts) => {
  console.log("DESKTOP_CAPTURER_GET_SOURCES", opts);

  return desktopCapturer.getSources(opts);
});
