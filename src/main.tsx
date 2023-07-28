import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app";
import store from "./app/store";
import "./assets/css/base.css";
import "./components/tippyjs-setting";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
// 去除非mac系统的滚动条
if (process.platform !== "darwin") {
  document.body.classList.add("overflow-hidden");
}

postMessage({ payload: "removeLoading" }, "*");
