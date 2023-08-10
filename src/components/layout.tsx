import { MouseEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import { motion } from "framer-motion";
import { switchServer, updateAddModalVisible } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import { ReactComponent as IconAdd } from "@/assets/icons/add.svg";
import { ReactComponent as IconRefresh } from "@/assets/icons/refresh.svg";
import { ReactComponent as IconDebug } from "@/assets/icons/debug.svg";
import ServerTip from "./server-tip";
import AddServerModal from "./modal-add-server";
import RemoveServerModal from "./modal-remove-server";
import { WebviewTag, ipcRenderer } from "electron";
import Tippy from "@tippyjs/react";
import { hideAll } from "tippy.js";
import ContextMenu, { MenuItem } from "./context-menu";
import TitleBar from "./titlebar";
// const LevelMap = {
//   0: "verbose",
//   1: "info",
//   2: "warning",
//   3: "error"
// };
const Layout = () => {
  const [removeServer, setRemoveServer] = useState<undefined | string>();
  const [reloadVisible, setReloadVisible] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [menuVisibleMap, setMenuVisibleMap] = useState<Record<string, boolean>>({});
  const { servers, active, addModalVisible } = useAppSelector((store) => store.data);
  const dispatch = useDispatch();
  useEffect(() => {
    if (servers.length == 0) {
      handleAddServer();
    } else {
      const webviews = [...document.querySelectorAll("webview")] as WebviewTag[];
      webviews.forEach((webview) => {
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
        });
      });
    }
  }, [servers]);
  const handleSwitch = (evt: MouseEvent<HTMLLIElement>) => {
    console.log("switch");
    const { url } = evt.currentTarget.dataset;
    if (url == active) return;
    if (url) {
      dispatch(switchServer(url));
    }
  };
  const handleAddServer = () => {
    dispatch(updateAddModalVisible(true));
  };
  const handleReload = () => {
    const wv = document.querySelector("webview[data-visible='true']") as WebviewTag;
    if (wv) {
      wv.reloadIgnoringCache();
      setReloading(true);
      // wv.loadURL(wv.dataset.src);
    }
  };
  const handleOpenWebviewDevTools = () => {
    const wv = document.querySelector("webview[data-visible='true']") as WebviewTag;
    if (wv && wv.dataset.src) {
      wv.openDevTools();
    }
  };
  const showContextMenu = (_key: string) => {
    setMenuVisibleMap((prev) => {
      return {
        ...prev,
        [_key]: true
      };
    });
    setReloadVisible(_key == active);
  };
  const hideContextMenu = (_key: string) => {
    setMenuVisibleMap((prev) => {
      return {
        ...prev,
        [_key]: false
      };
    });
    hideAll();
  };
  const handleRemove = (url: string) => {
    updateRemoveServer(url);
  };
  const updateRemoveServer = (web_url?: string) => {
    setRemoveServer(web_url);
  };

  console.log("layout servers", servers);
  if (servers.length === 0) {
    return (
      <>
        <section className="bg-add-server flex h-screen w-screen"></section>
        <AddServerModal mask={false} />
      </>
    );
  }
  const isMac = process.platform == "darwin";
  const contextMenuVisible = Object.values(menuVisibleMap).some((v) => v);
  return (
    <>
      {!isMac && <TitleBar />}
      <section
        className={clsx(
          "flex select-none bg-transparent",
          isMac ? "h-screen" : "h-[calc(100vh_-_48px)]"
        )}
      >
        <aside
          className={clsx(
            "relative",
            "flex h-full w-[66px] flex-col items-center gap-3 bg-neutral-200 dark:bg-gray-900",
            contextMenuVisible ? "" : "app-drag",
            isMac ? "pt-8" : "pt-1"
          )}
        >
          <ul className="flex w-full flex-col gap-2 py-1 text-lg text-gray-900 dark:text-gray-100">
            {servers.map((server) => {
              const { web_url, api_url, name } = server;
              const items = [
                {
                  text: "Remove Server",
                  clickHandler: handleRemove.bind(null, web_url),
                  danger: true
                }
              ] as MenuItem[];
              if (reloadVisible) {
                items.unshift({
                  text: "Reload Page",
                  clickHandler: handleReload
                });
              }
              return (
                <Tippy
                  key={web_url}
                  appendTo={document.body}
                  offset={[-20, 34]}
                  onClickOutside={hideContextMenu.bind(null, web_url)}
                  // hideOnClick={true}
                  // disabled={!menuVisibleMap[web_url]}
                  visible={!!menuVisibleMap[web_url]}
                  followCursor={"initial"}
                  interactive
                  placement="right-start"
                  popperOptions={{ strategy: "fixed" }}
                  // onClickOutside={hide}
                  content={
                    <ContextMenu hideMenu={hideContextMenu.bind(null, web_url)} items={items} />
                  }
                >
                  <li
                    // role="button"
                    key={web_url}
                    className={clsx(
                      "app-no-drag group relative flex w-full cursor-pointer justify-center px-3"
                    )}
                    data-url={web_url}
                    onClick={handleSwitch}
                    onContextMenu={showContextMenu.bind(null, web_url)}
                  >
                    <ServerTip key={name} content={name}>
                      <div
                        className={clsx(
                          "app-no-drag",
                          "flex h-9 w-9 items-center justify-center rounded hover:bg-gray-500/10 dark:hover:bg-gray-500/50",
                          web_url === active && "bg-white dark:bg-gray-500/50"
                        )}
                      >
                        <img
                          className="h-6 w-6 rounded-full"
                          src={`${
                            api_url || web_url
                          }/api/resource/organization/logo?t=${new Date().getTime()}`}
                          alt="logo"
                        />
                      </div>
                    </ServerTip>
                    {active == web_url && (
                      <div className="absolute right-0 top-0 h-full w-0.5 rounded bg-primary-500"></div>
                    )}
                  </li>
                </Tippy>
              );
            })}
          </ul>
          <ServerTip content={"Add server"}>
            <div
              role="button"
              onClick={handleAddServer}
              className="app-no-drag group flex h-9 w-9 cursor-pointer items-center justify-center rounded hover:bg-gray-500/50"
            >
              <IconAdd className="outline-none group-hover:fill-white" />
            </div>
          </ServerTip>
          <div className="my-1 h-[1px] w-9 bg-gray-300/50"></div>
          <ServerTip content={"Refresh page"}>
            <button
              disabled={reloading}
              onClick={handleReload}
              className="app-no-drag  group flex h-9 w-9 cursor-pointer items-center justify-center rounded hover:bg-gray-500/50"
            >
              <IconRefresh
                className={clsx(
                  "outline-none group-hover:stroke-white",
                  reloading ? "animate-spin opacity-80" : ""
                )}
              />
            </button>
          </ServerTip>
          <button
            title="Open DevTools"
            onClick={handleOpenWebviewDevTools}
            className="app-no-drag group absolute bottom-4 left-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded  hover:bg-gray-500/50"
          >
            <IconDebug className="invisible outline-none group-hover:visible group-hover:stroke-white" />
          </button>
        </aside>
        <motion.main className="relative flex h-full flex-1 items-center justify-center">
          {servers.map((server) => {
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
                  active == web_url ? "visible" : "invisible"
                )}
                useragent={`${navigator.userAgent} ${process.platform}`}
                data-visible={active == web_url}
                data-src={web_url}
                src={web_url}
              ></webview>
            );
          })}
        </motion.main>

        {contextMenuVisible ? (
          <div className="menu-mask fixed left-0 top-0 z-10 h-full w-full"></div>
        ) : isMac ? (
          <div className="app-drag fixed left-0 top-0 z-50 h-6 w-full"></div>
        ) : null}
      </section>
      {!!removeServer && (
        <RemoveServerModal
          webUrl={removeServer}
          handleCancel={updateRemoveServer.bind(null, undefined)}
        />
      )}
      {addModalVisible ? <AddServerModal /> : null}
    </>
  );
};

export default Layout;
