import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ipcRenderer } from "electron";
import App from "./app";
import store from "./app/store";
import "./samples/node-api";
import "./assets/css/base.css";
import { Servers } from "./app/config";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
// 初始化view list
ipcRenderer.send("init-views", { list: Servers });
