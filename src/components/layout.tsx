import { MouseEvent } from "react";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import clsx from "clsx";
// import { ipcRenderer } from "electron";
import { switchServer, updateAddModalVisible, updateNavTopmost } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import { ReactComponent as IconAdd } from "@/assets/icons/add.svg";

// import { ReactComponent as IconDelete } from "@/assets/icons/delete.svg";

// import Button from "./base/button";

// type Props = {};

const Layout = () => {
  const { servers, active } = useAppSelector((store) => store.data);
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
  const handleMouseEnter = (evt: MouseEvent<HTMLLIElement>) => {
    const { url } = evt.currentTarget.dataset;
    if (url == active) return;
    dispatch(updateNavTopmost({ top: true }));
  };
  const handleMouseLeave = (evt: MouseEvent<HTMLLIElement>) => {
    const { url } = evt.currentTarget.dataset;
    if (url == active) return;
    dispatch(updateNavTopmost({ top: false, url: active }));
  };
  // const handleRemove = (url: string) => {
  //   dispatch(removeServer(url));
  // };
  console.log("layout servers", servers);

  return (
    <section className="flex h-screen bg-transparent select-none">
      <aside className="app-drag flex flex-col items-center gap-3 w-[66px] pt-8 h-full bg-neutral-200 dark:bg-gray-900">
        <ul className="flex flex-col gap-2 py-1 text-gray-900 dark:text-gray-100 text-lg">
          {servers.map((server) => {
            const { web_url, api_url, name } = server;
            return (
              <li
                // data-tooltip-delay-hide={122221000}
                data-tooltip-id={active == web_url ? "" : "tooltip"}
                data-tooltip-content={name}
                data-tooltip-place="right"
                role="button"
                key={web_url}
                className={clsx("relative group px-3 w-full cursor-pointer")}
                data-url={web_url}
                onClick={handleSwitch}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                // title={name}
              >
                <div
                  className={clsx(
                    "app-no-drag",
                    "w-9 h-9 flex items-center justify-center rounded hover:bg-gray-500/50",
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
                {/* {active !== web_url && (
                    <IconDelete
                      onClick={handleRemove.bind(null, web_url)}
                      role="button"
                      className="invisible absolute right-1"
                    />
                )} */}
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
      <main className="flex-1 h-full">
        <div className="">{/* <Tabs /> */}</div>
      </main>
      <Tooltip id="tooltip" place="bottom-start" className="tooltip !opacity-100" />
    </section>
  );
};

export default Layout;
