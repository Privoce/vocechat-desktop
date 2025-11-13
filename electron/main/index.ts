import { Buffer } from "node:buffer";
import { release } from "node:os";
import { join } from "node:path";
// import installExtension, {
//   REDUX_DEVTOOLS,
//   REACT_DEVELOPER_TOOLS
// } from "electron-devtools-installer";
// import NodeURL from "node:url";
import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  Menu,
  nativeImage,
  shell,
  Tray
} from "electron";
import { VocechatServer } from "@/types/common";
import { readUserData, USER_DATA_PATH, USER_LOG_PATH, writeUserData } from "./user-data";
import logger from "./logger";

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
// when you do not need a default menu
// Menu.setApplicationMenu(null);
// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
// process.env["ELECTRON_DEBUG_DRAG_REGIONS"] = "true";
let win: BrowserWindow;
let winAbout: BrowserWindow;
let tray: Tray;
let unreadCount = 0;
let triggerByQuit = false;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");
const Servers: VocechatServer[] = readUserData();
async function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: "hidden",
    // titleBarOverlay: true,
    frame: false,
    minWidth: 800,
    minHeight: 600,
    width: 1200,
    height: 800,
    backgroundColor: "transparent",
    // transparent: true,
    // useContentSize: true,
    title: process.platform == "darwin" ? undefined : "VoceChat",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      devTools: process.env.NODE_ENV === "development",
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
  win.on("show", function () {
    updateUnreadIndicators(unreadCount);
    if (win?.webContents) {
      win.webContents.send("vocechat-window-focus", true);
    }
  });
  win.on("focus", () => {
    if (win?.webContents) {
      win.webContents.send("vocechat-window-focus", true);
    }
  });
  win.on("blur", () => {
    if (win?.webContents) {
      win.webContents.send("vocechat-window-focus", false);
    }
  });
  win.on("hide", () => {
    if (win?.webContents) {
      win.webContents.send("vocechat-window-focus", false);
    }
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
  // win.setIcon("");
  //app.dock.setBadge("9");
  // Apply electron-updater
  // update(win);
}
const formatUnreadCount = (count: number) => (count > 99 ? "99+" : `${count}`);
const createOverlayIcon = (count: number) => {
  const badgeText = formatUnreadCount(count);
  const size = 128;
  const radius = size / 2;
  const fontSize = badgeText.length === 1 ? size * 0.65 : badgeText.length === 2 ? size * 0.58 : size * 0.5;
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#e11d48"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${badgeText}</text></svg>`;
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`);
};
const resetTrayAppearance = () => {
  if (!tray) return;
  if (process.platform === "darwin") {
    tray.setTitle("", {
      fontType: "monospaced"
    });
  }
  tray.setImage(join(process.env.PUBLIC, "tray.png"));
  tray.setToolTip("VoceChat");
};
const updateUnreadIndicators = (count: number) => {
  unreadCount = count;
  const displayCount = formatUnreadCount(count);
  if (tray) {
    if (count > 0) {
      tray.setImage(join(process.env.PUBLIC, "tray.with.dot.png"));
      if (process.platform === "darwin") {
        tray.setTitle(displayCount, {
          fontType: "monospaced"
        });
      }
      tray.setToolTip(`VoceChat (${displayCount})`);
    } else {
      resetTrayAppearance();
    }
  }
  if (process.platform === "darwin" && app.dock) {
    app.dock.setBadge(count > 0 ? displayCount : "");
  }
  if (process.platform === "win32") {
    win.setOverlayIcon(count > 0 ? createOverlayIcon(count) : null, count > 0 ? `New Messages: ${displayCount}` : "VoceChat");
  } else {
    app.setBadgeCount(count);
  }
};
app.whenReady().then(() => {
  console.log("event:app-ready");
  createWindow();
  tray = new Tray(join(process.env.PUBLIC, "tray.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "About",
      type: "normal",
      click: () => {
        winAbout = new BrowserWindow({
          // alwaysOnTop: true,
          autoHideMenuBar: true,
          minimizable: false,
          maximizable: false,
          resizable: false,
          title: "About VoceChat",
          width: 400,
          height: 400,
          webPreferences: {
            devTools: process.env.NODE_ENV === "development",
            allowRunningInsecureContent: true,
            preload,
            nodeIntegration: true,
            contextIsolation: false
          }
        });
        if (url) {
          // electron-vite-vue#298
          winAbout.webContents.loadURL(`${url}#/about`);
        } else {
          winAbout.webContents.loadFile(`${indexHtml}`, {
            hash: "/about"
          });
        }
      }
    },
    {
      label: "Quit VoceChat",
      type: "normal",
      role: "quit"
    }
  ]);
  tray.on("click", function () {
    if (win && win.isVisible() && win.isFocused()) {
      return;
    }
    if (win.isMinimized()) {
      win.restore();
    }
    win.show();
    win.focus();
  });
  tray.on("right-click", function () {
    tray.popUpContextMenu(contextMenu);
  });
  tray.setToolTip("VoceChat");

  // // install extension
  // if (process.env.NODE_ENV === "development") {
  //   installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {
  //     loadExtensionOptions: {
  //       allowFileAccess: true
  //     }
  //   })
  //     .then((name) => console.log(`Added Extension:  ${name}`))
  //     .catch((err) => console.log("An error occurred: ", err));
  // }
});
app.on("before-quit", (evt) => {
  console.log("event:before-quit");
  triggerByQuit = true;
});

app.on("window-all-closed", () => {
  // save user data
  console.log("event:window-all-closed");
  writeUserData(Servers);
  win.destroy();
  winAbout.destroy();
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
ipcMain.on("vocechat-logging", (evt, arg) => {
  console.log("handle:vocechat-logging", arg);

  logger.error(JSON.stringify(arg));
  // return true;
});
ipcMain.on("vocechat-new-msg", () => {
  console.log("handle:vocechat-new-msg");
});
ipcMain.on("vocechat-unread-count", (_event, totalUnread: number) => {
  updateUnreadIndicators(totalUnread);
});
// Event handler for asynchronous incoming messages
// init redux store
ipcMain.handle("init-servers", () => {
  console.log("handle:init-servers", Servers.length);
  return Servers;
});
ipcMain.handle("data-file-path", () => {
  console.log("handle:data-file-path", USER_DATA_PATH);
  return USER_DATA_PATH;
});
ipcMain.on("show-file", (evt, arg) => {
  console.log("show-file", arg);
  switch (arg) {
    case "data":
      shell.showItemInFolder(USER_DATA_PATH);
      break;
    case "log":
      shell.showItemInFolder(USER_LOG_PATH);
      break;
    default:
      break;
  }
});
// controls from non-macOS
ipcMain.on("control-mini", () => {
  console.log("control-mini");
  win.minimize();
});
ipcMain.on("control-max", () => {
  console.log("control-max");
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});
ipcMain.on("control-close", () => {
  console.log("control-close");
  win.hide();
});
ipcMain.on("control-fullscreen", () => {
  console.log("control-fullscreen");
  win.setFullScreen(!win.isFullScreen());
});

ipcMain.on("add-server", (event, arg) => {
  console.log("add-server", arg);
  const { data } = arg;
  if (Servers.find((item) => item.web_url === data.web_url)) {
    return;
  }
  Servers.push(data as VocechatServer);
});
ipcMain.on("remove-server", (event, arg) => {
  const { url } = arg;
  const idx = Servers.findIndex((item) => item.web_url === url);
  if (idx > -1) {
    Servers.splice(idx, 1);
  }
  console.log("remove-server", arg, idx, Servers);
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
