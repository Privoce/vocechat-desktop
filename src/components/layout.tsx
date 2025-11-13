import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import { updateAddModalVisible, updateNewMsgMap } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import IconAdd from "@/assets/icons/add.svg?react";
import IconRefresh from "@/assets/icons/refresh.svg?react";
import IconDebug from "@/assets/icons/debug.svg?react";
import ServerTip from "./server-tip";
import AddServerModal from "./modal-add-server";
import RemoveServerModal from "./modal-remove-server";
import { WebviewTag, ipcRenderer } from "electron";
import TitleBar from "./titlebar";
import WebviewList from "./webviews";
import ServerList from "./servers";
import { hideAll } from "tippy.js";
const Layout = () => {
  const [removeServer, setRemoveServer] = useState<undefined | string>();
  const [reloading, setReloading] = useState(false);
  const { servers, active, addModalVisible, newMsgMap } = useAppSelector((store) => store.data);
  const [menuVisibleMap, setMenuVisibleMap] = useState<Record<string, boolean>>({});
  const [reloadVisible, setReloadVisible] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    if (servers.length == 0) {
      handleAddServer();
    }
  }, [servers]);
  useEffect(() => {
    const handleWindowFocus = (_event: unknown, isFocused: boolean) => {
      if (isFocused && active) {
        dispatch(updateNewMsgMap({ server: active, hasNewMsg: false }));
      }
    };
    ipcRenderer.on("vocechat-window-focus", handleWindowFocus);
    return () => {
      ipcRenderer.removeListener("vocechat-window-focus", handleWindowFocus);
    };
  }, [active, dispatch]);
  useEffect(() => {
    const totalUnread = Object.values(newMsgMap).reduce((sum, count) => sum + count, 0);
    ipcRenderer.send("vocechat-unread-count", totalUnread);
  }, [newMsgMap]);
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
  const handleAddServer = () => {
    dispatch(updateAddModalVisible(true));
  };
  const handleReload = () => {
    const wv = document.querySelector("webview[data-visible='true']") as WebviewTag;
    if (wv) {
      wv.reloadIgnoringCache();
      setReloading(true);
    }
  };
  const handleOpenWebviewDevTools = () => {
    const wv = document.querySelector("webview[data-visible='true']") as WebviewTag;
    if (wv && wv.dataset.src) {
      wv.openDevTools();
    }
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
          {/* server list */}
          <ServerList
            activeURL={active}
            menuVisibleMap={menuVisibleMap}
            hideContextMenu={hideContextMenu}
            showContextMenu={showContextMenu}
            reloadVisible={reloadVisible}
            servers={servers}
            handleReload={handleReload}
            handleRemove={handleRemove}
          />
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
        <main className="relative flex h-full flex-1 items-center justify-center">
          {/* webview list */}
          <WebviewList
            setReloading={setReloading}
            handleReload={handleReload}
            servers={servers}
            activeURL={active}
          />
        </main>

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
