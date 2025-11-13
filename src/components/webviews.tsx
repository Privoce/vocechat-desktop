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
    let windowFocused = true;
    const handleWindowFocus = (_event: unknown, isFocused: boolean) => {
      windowFocused = isFocused;
    };
    ipcRenderer.on("vocechat-window-focus", handleWindowFocus);
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
      });
      webview.addEventListener("console-message", (e) => {
        const { level, message, sourceId } = e;
        if (level == 3) {
          //  error
          // console.log("Guest page logged a message:", message, sourceId);
          ipcRenderer.send("vocechat-logging", { level, message, sourceId });
        }
        // 新消息
        if (level == 1 && message.includes("{{NEW_MSG}}")) {
          // 处理新消息
          const isActiveWebview = webview.dataset?.visible === "true";
          const shouldMarkUnread = !isActiveWebview || !windowFocused;
          if (shouldMarkUnread) {
            dispatch(updateNewMsgMap({ server, hasNewMsg: true }));
            ipcRenderer.send("vocechat-new-msg");
          }
        }
      });
    });
    return () => {
      ipcRenderer.removeListener("vocechat-window-focus", handleWindowFocus);
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
