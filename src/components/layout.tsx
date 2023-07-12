import { MouseEvent, useEffect, useState } from "react";
import { Item, ItemParams, Menu, useContextMenu } from "react-contexify";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import clsx from "clsx";
import "react-contexify/dist/ReactContexify.css";
import { switchServer, updateAddModalVisible } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import { ReactComponent as IconAdd } from "@/assets/icons/add.svg";
import { isDarkMode } from "@/utils";
import AddServerModal from "./add-server-modal";
import RemoveServerModal from "./modal-remove-server";

const MENU_ID = "menu-id";
const Layout = () => {
  const [removeServer, setRemoveServer] = useState<undefined | string>(undefined);
  const { servers, active, addModalVisible } = useAppSelector((store) => store.data);
  const { show } = useContextMenu({
    id: MENU_ID
  });
  const dispatch = useDispatch();
  useEffect(() => {
    if (servers.length == 0) {
      handleAddServer();
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
  const showContextMenu = (e: MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    show({
      event: e,
      position: {
        x: e.clientX + 20,
        y: e.clientY
      },
      props: {
        cmd: "DELETE",
        url: e.currentTarget.dataset.url
      }
    });
  };
  const handleItemClick = ({ props, data }: ItemParams) => {
    console.log({ props, data });
    const { cmd, url } = props;
    switch (cmd) {
      case "DELETE":
        updateRemoveServer(url);
        break;

      default:
        break;
    }
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
  return (
    <>
      <section className="flex h-screen select-none bg-transparent">
        <aside className="app-drag flex h-full w-[66px] flex-col items-center gap-3 bg-neutral-200 pt-8 dark:bg-gray-900">
          <ul className="flex flex-col gap-2 py-1 text-lg text-gray-900 dark:text-gray-100">
            {servers.map((server) => {
              const { web_url, api_url, name } = server;
              return (
                <li
                  // data-tooltip-delay-hide={122221000}
                  data-tooltip-id={"tooltip"}
                  data-tooltip-content={name}
                  data-tooltip-place="right"
                  role="button"
                  key={web_url}
                  className={clsx("app-no-drag group relative w-full cursor-pointer px-3")}
                  data-url={web_url}
                  onClick={handleSwitch}
                  onContextMenu={showContextMenu}
                >
                  <div
                    className={clsx(
                      "app-no-drag",
                      "flex h-9 w-9 items-center justify-center rounded hover:bg-gray-500/10 dark:hover:bg-gray-500/50",
                      web_url === active && "bg-white dark:bg-gray-500/50"
                    )}
                  >
                    <img
                      className="h-6 w-6 rounded-full border border-gray-500/20"
                      src={`${
                        api_url || web_url
                      }/api/resource/organization/logo?t=${new Date().getTime()}`}
                      alt="logo"
                    />
                  </div>
                  {active == web_url && (
                    <div className="absolute right-0 top-0 h-full w-0.5 rounded bg-primary-500"></div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="app-no-drag group flex h-9 w-9 cursor-pointer items-center justify-center rounded hover:bg-gray-500/50">
            <IconAdd
              data-tooltip-id={"tooltip"}
              data-tooltip-content={"Add server"}
              data-tooltip-place="right"
              role="button"
              className="cursor-pointer outline-none group-hover:fill-white"
              onClick={handleAddServer}
            />
          </div>
        </aside>
        <main className="relative flex h-full flex-1 items-center justify-center">
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
                className={clsx(
                  "absolute left-0 top-0 h-full w-full",
                  active == web_url ? "visible" : "invisible"
                )}
                key={web_url}
                src={web_url}
              ></webview>
            );
          })}
        </main>
        <Tooltip id="tooltip" place="bottom-start" className="tooltip !opacity-100" />
        <div className="app-drag fixed left-0 top-0 z-50 h-6 w-full"></div>
      </section>
      <Menu id={MENU_ID} theme={isDarkMode() ? "dark" : "light"} animation="fade">
        <Item className="danger" onClick={handleItemClick}>
          Remove
        </Item>
      </Menu>
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
