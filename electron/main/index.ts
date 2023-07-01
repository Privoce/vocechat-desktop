import { release } from "node:os";
import { join } from "node:path";
// import NodeURL from "node:url";
import { app, BrowserView, BrowserWindow, desktopCapturer, ipcMain, shell } from "electron";
import { VocechatServer } from "@/types/common";

// import { update } from "./update";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
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
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow;
let navView: BrowserView;
let winModal: BrowserWindow;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");
const ViewMap: Record<string, BrowserView | null> = {};
const addView = (item: VocechatServer) => {
  if (!win) return;
  const { web_url } = item;
  if (ViewMap[web_url]) return;
  const view = new BrowserView({
    webPreferences: {
      preload,
      nodeIntegration: true,
      devTools: process.env.NODE_ENV === "development",
      webSecurity: false
    }
  });
  win.addBrowserView(view);
  if (process.env.NODE_ENV === "development") {
    view.webContents.openDevTools({
      mode: "bottom"
    });
  }
  view.setBackgroundColor("#fff");
  view.setAutoResize({ width: true, height: true, horizontal: true, vertical: true });
  const titleBarHeight = win.getSize()[1] - win.getContentSize()[1];
  view.setBounds({
    x: 60,
    y: titleBarHeight,
    width: 1140,
    height: 800 - titleBarHeight
  });
  view.webContents.loadURL(web_url);
  // win.addBrowserView(view);
  ViewMap[web_url] = view;
};
async function createWindow() {
  win = new BrowserWindow({
    // titleBarStyle: "hidden",
    // titleBarOverlay: true,
    // useContentSize: true,
    minWidth: 800,
    minHeight: 600,
    width: 1200,
    height: 800,
    title: "Main window",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      allowRunningInsecureContent: true,
      // webviewTag: true,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  // win.webContents.loadURL("https://baidu.com");
  navView = new BrowserView({
    webPreferences: {
      allowRunningInsecureContent: true,
      // webviewTag: true,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.addBrowserView(navView);
  win.setTopBrowserView(navView);
  if (url) {
    // electron-vite-vue#298
    navView.webContents.loadURL(url);
    if (process.env.NODE_ENV === "development") {
      // Open devTool if the app is not packaged
      navView.webContents.openDevTools({
        mode: "detach"
      });
    }
  } else {
    navView.webContents.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  navView.webContents.on("did-finish-load", () => {
    navView?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  navView.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  navView.setBackgroundColor("rgba(1,1,1,0)");
  navView.setAutoResize({ width: true, height: true, horizontal: true, vertical: true });
  const titleBarHeight = win.getSize()[1] - win.getContentSize()[1];
  navView.setBounds({
    x: 0,
    y: titleBarHeight,
    width: 1200,
    height: 800 - titleBarHeight
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
    // winModal.loadURL(
    //   NodeURL.format({
    //     pathname: indexHtml,
    //     protocol: "file:",
    //     slashes: true,
    //     hash: "add-view-modal"
    //   })
    // );
    winModal.loadFile(indexHtml, { hash: "/add-view-modal" });
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win.destroy();
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
// Event handler for asynchronous incoming messages
ipcMain.on("switch-view", (event, arg) => {
  if (!win) return;
  const { url } = arg as { url: string };
  if (url == "NAV_VIEW_TOP_ENABLE") {
    // tricky
    win.setTopBrowserView(navView);
    return;
  }
  if (url) {
    const view = ViewMap[url];
    console.log("switch view", ViewMap, view);
    if (view) {
      win.setTopBrowserView(view);
    }
  }
  // // Event emitter for sending asynchronous messages
  // event.sender.send('asynchronous-reply', 'async pong')
});
ipcMain.on("add-view", (event, arg) => {
  console.log("add-view", arg);
  const { data } = arg;
  addView(data as VocechatServer);
});
ipcMain.on("remove-view", (event, arg) => {
  console.log("remove-view", arg);
  const { url } = arg;
  const currView = ViewMap[url];
  if (currView) {
    win.removeBrowserView(currView);
    // win.setBrowserView
    // undocumented API
    // (currView.webContents as any).destroy();
    ViewMap[url] = null;
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
  const {
    visible,
    web_url,
    name = ""
  } = arg as { visible: boolean; web_url: string; name?: string };
  const currView = ViewMap[web_url];
  if (currView) {
    console.log("post msg", visible, name);

    currView.webContents.send("server-name-popover", { visible, name });
  }
});
ipcMain.on("init-views", (event, arg: { list: VocechatServer[] }) => {
  const { list } = arg;
  console.log("init server list", list);
  if (list && list.length) {
    list.forEach((item) => {
      addView(item);
    });
  }
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
