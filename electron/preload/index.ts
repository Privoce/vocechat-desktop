import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";

// ipcRenderer.on("server-name-popover", (_, arg) => {
//   console.log("server-name-popover", arg);
//   ipcRenderer.sendToHost("server-name-popover", arg);
// });

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
}
