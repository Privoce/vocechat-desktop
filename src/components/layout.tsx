import { MouseEvent } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import { removeServer, switchServer, updateAddModalVisible } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import { ReactComponent as IconDelete } from "@/assets/icons/delete.svg";
import Button from "./base/button";

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
  const handleRemove = (url: string) => {
    dispatch(removeServer(url));
  };
  return (
    <section className="flex h-screen bg-gray-200 dark:bg-gray-900 select-none">
      <aside className="flex flex-col justify-between w-1/6 pt-8  border-r border-gray-50 dark:border-gray-950 h-full ">
        <ul className="px-3 flex flex-col gap-2 py-1 text-gray-900 dark:text-gray-100 text-lg">
          {servers.map((server) => {
            const { web_url, api_url, name } = server;
            return (
              <li
                role="button"
                key={web_url}
                className={clsx(
                  "group relative no-drag flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-500/50",
                  web_url === active && "bg-gray-500/50"
                )}
                data-url={web_url}
                onClick={handleSwitch}
              >
                <img
                  className="w-6 h-6 rounded-full border border-gray-500/20"
                  src={`${
                    api_url || web_url
                  }/api/resource/organization/logo?t=${new Date().getTime()}`}
                  alt="logo"
                />
                <span>{name}</span>
                {active !== web_url && (
                  <IconDelete
                    onClick={handleRemove.bind(null, web_url)}
                    role="button"
                    className="invisible group-hover:visible absolute right-1"
                  />
                )}
              </li>
            );
          })}
        </ul>
        <div className="px-3 mb-6">
          <Button className="no-drag" widthFull onClick={handleAddServer}>
            Add Server
          </Button>
        </div>
      </aside>
      <main className="no-drag w-5/6 h-full">
        <div className="">{/* <Tabs /> */}</div>
      </main>
    </section>
  );
};

export default Layout;
