import React, { useState, MouseEvent } from "react";
import ServerTip from "./server-tip";
import Tippy from "@tippyjs/react";
import ContextMenu, { MenuItem } from "./context-menu";
import { VocechatServer } from "@/types/common";
import { switchServer, updateNewMsgMap } from "@/app/slices/data";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import { useAppSelector } from "@/app/store";

type Props = {
  servers: VocechatServer[];
  handleReload: () => void;
  handleRemove: (_param: string) => void;
  activeURL: string;
  reloadVisible: boolean;
  menuVisibleMap: Record<string, boolean>;
  hideContextMenu: (_key: string) => void;
  showContextMenu: (_key: string) => void;
};

const ServerList = ({
  servers,
  handleReload,
  handleRemove,
  activeURL,
  reloadVisible,
  menuVisibleMap,
  hideContextMenu,
  showContextMenu
}: Props) => {
  const dispatch = useDispatch();
  const newMsgMap = useAppSelector((store) => store.data.newMsgMap);
  const handleSwitch = (evt: MouseEvent<HTMLLIElement>) => {
    console.log("switch");
    const { url } = evt.currentTarget.dataset;
    if (!url) return;
    if (url === activeURL) {
      dispatch(updateNewMsgMap({ server: url, hasNewMsg: false }));
      return;
    }
    dispatch(switchServer(url));
    dispatch(updateNewMsgMap({ server: url, hasNewMsg: false }));
  };
  return (
    <ul className="flex w-full flex-col gap-2 py-1 text-lg text-gray-900 dark:text-gray-100">
      {servers.map((server) => {
        const { web_url, api_url, name } = server;
        const unreadCount = newMsgMap[web_url] ?? 0;
        const showUnreadBadge = unreadCount > 0;
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
            content={<ContextMenu hideMenu={hideContextMenu.bind(null, web_url)} items={items} />}
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
                    "app-no-drag relative",
                    "flex h-9 w-9 items-center justify-center rounded hover:bg-gray-500/10 dark:hover:bg-gray-500/50",
                    web_url === activeURL && "bg-white dark:bg-gray-500/50"
                  )}
                >
                  <img
                    className="h-6 w-6 rounded-full"
                    src={`${
                      api_url || web_url
                    }/api/resource/organization/logo?t=${new Date().getTime()}`}
                    alt="logo"
                  />
                  {showUnreadBadge && (
                    <div className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </div>
              </ServerTip>
              {activeURL == web_url && (
                <div className="absolute right-0 top-0 h-full w-0.5 rounded bg-primary-500"></div>
              )}
            </li>
          </Tippy>
        );
      })}
    </ul>
  );
};

export default ServerList;
