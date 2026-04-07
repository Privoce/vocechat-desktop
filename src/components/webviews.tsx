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
    const cleanups: (() => void)[] = [];
    webviews.forEach((webview) => {
      const server = webview.getAttribute("data-src") || "default";
      const onThemeColorChanged = (evt: Electron.DidChangeThemeColorEvent) => {
        console.log("theme color changed", evt.themeColor);
        if (evt.themeColor == "#123456") {
          handleReload();
        }
      };
      const onDidFinishLoad = () => {
        if (webview.dataset?.visible == "true") {
          console.log("load finish reloading false", webview.src);
          setReloading(false);
        }
      };
      const onDidFailLoad = () => {
        if (webview.dataset?.visible == "true") {
          console.log("load fail reloading false", webview.src);
          setReloading(false);
        }
      };
      const onDomReady = () => {
        const url = webview.dataset.src;
        console.log(`${url} dom-ready`);
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
      };
      const onConsoleMessage = (e: Electron.ConsoleMessageEvent) => {
        const { level, message, sourceId } = e;
        if (level == 3) {
          ipcRenderer.send("vocechat-logging", { level, message, sourceId });
        }
        if (message.includes("{{NEW_MSG}}")) {
          dispatch(updateNewMsgMap({ server, hasNewMsg: true }));
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
      };

      webview.addEventListener("did-change-theme-color", onThemeColorChanged);
      webview.addEventListener("did-finish-load", onDidFinishLoad);
      webview.addEventListener("did-fail-load", onDidFailLoad);
      webview.addEventListener("dom-ready", onDomReady);
      webview.addEventListener("console-message", onConsoleMessage);

      cleanups.push(() => {
        webview.removeEventListener("did-change-theme-color", onThemeColorChanged);
        webview.removeEventListener("did-finish-load", onDidFinishLoad);
        webview.removeEventListener("did-fail-load", onDidFailLoad);
        webview.removeEventListener("dom-ready", onDomReady);
        webview.removeEventListener("console-message", onConsoleMessage);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
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
