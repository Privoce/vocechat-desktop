import { updateNewMsgMap } from "@/app/slices/data";
import { VocechatServer } from "@/types/common";
import clsx from "clsx";
import { ipcRenderer, WebviewTag } from "electron";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
// import React from "react";

type Props = {
  activeURL: string;
  servers: VocechatServer[];
  handleReload: () => void;
  setReloading: (_param: boolean) => void;
};

const WebviewList = ({ servers, activeURL, handleReload, setReloading }: Props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const webviews = [...document.querySelectorAll("webview")] as WebviewTag[];
    webviews.forEach((webview) => {
      const server = webview.getAttribute("data-src") || "default";
      webview.addEventListener("did-change-theme-color", (evt) => {
        console.log("theme color changed", evt.themeColor);
        // 约定的主题色
        if (evt.themeColor == "#123456") {
          handleReload();
        }
      });
      webview.addEventListener("did-finish-load", () => {
        if (webview.dataset?.visible == "true") {
          console.log("load finish reloading false", webview.src);
          setReloading(false);
        }
      });
      webview.addEventListener("did-fail-load", () => {
        if (webview.dataset?.visible == "true") {
          console.log("load fail reloading false", webview.src);
          setReloading(false);
        }
      });
      webview.addEventListener("dom-ready", () => {
        const url = webview.dataset.src;
        console.log(`${url} dom-ready`);
        // 劫持 webview 内的 Notification API，将 web 端的 PWA 通知转为 console.log
        // Electron 的 webview 不支持 web Notification，所以拦截后通过 console-message 桥接到主进程
        webview.executeJavaScript(`
          (function() {
            const OriginalNotification = window.Notification;
            window.Notification = function(title, options) {
              const detail = JSON.stringify({
                channel: title || "",
                sender: "",
                content: (options && options.body) || ""
              });
              console.log("{{NEW_MSG}}" + detail);
            };
            window.Notification.permission = "granted";
            window.Notification.requestPermission = function() {
              return Promise.resolve("granted");
            };
          })();
        `);
      });
      webview.addEventListener("console-message", (e) => {
        const { level, message, sourceId } = e;
        if (level == 3) {
          //  error
          // console.log("Guest page logged a message:", message, sourceId);
          ipcRenderer.send("vocechat-logging", { level, message, sourceId });
        }
        // 新消息: {{NEW_MSG}} 或 {{NEW_MSG}}{"channel":"xxx","sender":"xxx","content":"xxx"}
        if (message.includes("{{NEW_MSG}}")) {
          dispatch(updateNewMsgMap({ server, hasNewMsg: true }));
          // 尝试解析消息详情
          let msgDetail = {};
          const jsonStr = message.replace("{{NEW_MSG}}", "").trim();
          if (jsonStr) {
            try {
              msgDetail = JSON.parse(jsonStr);
            } catch (err) {
              // 解析失败，使用默认通知
            }
          }
          ipcRenderer.send("vocechat-new-msg", msgDetail);
        }
      });
    });
  }, []);

  return servers.map((server) => {
    const { web_url } = server;
    return (
      <webview
        //@ts-ignore
        //eslint-disable-next-line react/no-unknown-property
        allowpopups="true"
        //@ts-ignore
        //eslint-disable-next-line react/no-unknown-property
        disablewebsecurity="true"
        key={web_url}
        className={clsx(
          "absolute left-0 top-0 h-full w-full",
          activeURL == web_url ? "visible" : "invisible"
        )}
        useragent={`${navigator.userAgent} ${process.platform}`}
        data-visible={activeURL == web_url}
        data-src={web_url}
        src={web_url}
      ></webview>
    );
  });
};

export default WebviewList;
