import { MouseEvent } from "react";
// import { useDispatch } from "react-redux";
import { ipcRenderer } from "electron";
// import { Servers } from "@/app/config";
import { useAppSelector } from "@/app/store";

// type Props = {};

const Layout = () => {
  const { servers } = useAppSelector((store) => store.data);
  // const dispatch = useDispatch();
  const handleSwitch = (evt: MouseEvent<HTMLButtonElement>) => {
    console.log("switch");
    const { url } = evt.currentTarget.dataset;
    ipcRenderer.send("switch-view", { url });
  };
  const handleAddServer = () => {
    ipcRenderer.send("add-view-modal", { visible: true });
  };
  console.log("ssss", servers);

  return (
    <section className="flex h-screen bg-gray-200 dark:bg-gray-900 select-none">
      <aside className="w-1/6 pt-8  border-r border-gray-50 dark:border-gray-950 h-full">
        <div className="px-3">
          <ul className="flex flex-col gap-2 py-1 text-gray-900 dark:text-gray-100 text-lg">
            {servers.map((server) => {
              const { web_url, api_url, name } = server;
              return (
                <li
                  key={web_url}
                  className="no-drag flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-500/50"
                >
                  <img
                    className="w-6 h-6 rounded-full border border-gray-500/20"
                    src={`${
                      api_url || web_url
                    }/api/resource/organization/logo?t=${new Date().getTime()}`}
                    alt="logo"
                  />
                  <button className="" data-url={web_url} onClick={handleSwitch}>
                    {name}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            className="no-drag dark:text-white text-left w-full px-3 py-1"
            onClick={handleAddServer}
          >
            Add Server
          </button>
        </div>
      </aside>
      <main className="no-drag w-5/6 h-full">
        <div className="">{/* <Tabs /> */}</div>
      </main>
    </section>
  );
};

export default Layout;
