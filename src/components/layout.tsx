import { MouseEvent } from "react";
import { Item, ItemParams, Menu, useContextMenu } from "react-contexify";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import clsx from "clsx";
import "react-contexify/dist/ReactContexify.css";
import { removeServer, switchServer, updateAddModalVisible } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import { ReactComponent as IconAdd } from "@/assets/icons/add.svg";
import { isDarkMode } from "@/utils";

const MENU_ID = "menu-id";
const Layout = () => {
  const { servers, active } = useAppSelector((store) => store.data);
  const { show } = useContextMenu({
    id: MENU_ID
  });
  const dispatch = useDispatch();
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
        dispatch(removeServer(url));
        break;

      default:
        break;
    }
  };
  console.log("layout servers", servers);

  return (
    <>
      <section className="flex h-screen bg-transparent select-none">
        <aside className="app-drag flex flex-col items-center gap-3 w-[66px] pt-8 h-full bg-neutral-200 dark:bg-gray-900">
          <ul className="flex flex-col gap-2 py-1 text-gray-900 dark:text-gray-100 text-lg">
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
                  className={clsx("app-no-drag relative group px-3 w-full cursor-pointer")}
                  data-url={web_url}
                  onClick={handleSwitch}
                  onContextMenu={showContextMenu}
                >
                  <div
                    className={clsx(
                      "app-no-drag",
                      "w-9 h-9 flex items-center justify-center rounded hover:bg-gray-500/10 dark:hover:bg-gray-500/50",
                      web_url === active && "bg-white dark:bg-gray-500/50"
                    )}
                  >
                    <img
                      className="w-6 h-6 rounded-full border border-gray-500/20"
                      src={`${
                        api_url || web_url
                      }/api/resource/organization/logo?t=${new Date().getTime()}`}
                      alt="logo"
                    />
                  </div>
                  {active == web_url && (
                    <div className="absolute right-0 top-0 w-0.5 h-full rounded bg-primary-500"></div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="group app-no-drag w-9 h-9 flex items-center justify-center cursor-pointer rounded hover:bg-gray-500/50">
            <IconAdd
              role="button"
              className="cursor-pointer group-hover:fill-white"
              onClick={handleAddServer}
            />
          </div>
        </aside>
        <main className="relative flex-1 h-full flex justify-center items-center">
          {servers.map((server) => {
            const { web_url } = server;

            return (
              <webview
              //@ts-ignore
              //eslint-disable-next-line react/no-unknown-property
                allowpopups="true"
                className={clsx(
                  "absolute left-0 top-0 w-full h-full",
                  active == web_url ? "visible" : "invisible"
                )}
                key={web_url}
                src={web_url}
              ></webview>
            );
          })}
        </main>
        <Tooltip id="tooltip" place="bottom-start" className="tooltip !opacity-100" />
        <div className="fixed left-0 top-0 w-full h-6 z-50 app-drag"></div>
      </section>
      <Menu id={MENU_ID} theme={isDarkMode() ? "dark" : "light"} animation="fade">
        <Item className="danger" onClick={handleItemClick}>
          Remove
        </Item>
      </Menu>
    </>
  );
};

export default Layout;
