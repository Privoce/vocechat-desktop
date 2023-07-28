// import React from "react";
import IconLogo from "@/assets/icon.png";
import { ReactComponent as IconClose } from "@/assets/icons/ctl.close.svg";
import { ReactComponent as IconMini } from "@/assets/icons/ctl.mini.svg";
import { ReactComponent as IconMax } from "@/assets/icons/ctl.max.svg";
import { ipcRenderer } from "electron";
// type Props = {}

const TitleBar = () => {
  const handleControl = (cmd: "mini" | "max" | "close" | "fullscreen") => {
    switch (cmd) {
      case "mini":
        ipcRenderer.send("control-mini");
        break;
      case "max":
        ipcRenderer.send("control-max");
        break;
      case "fullscreen":
        ipcRenderer.send("control-fullscreen");
        break;
      case "close":
        ipcRenderer.send("control-close");
        break;

      default:
        break;
    }
  };
  return (
    <header
      onDoubleClick={handleControl.bind(null, "max")}
      className="app-drag relative flex h-12 w-full items-center justify-center gap-2 border-b border-black/5 bg-gray-300 dark:bg-gray-700"
    >
      <img className="h-5 w-5" src={IconLogo} />
      <span className="text-sm text-gray-800 dark:text-gray-200">VoceChat</span>
      <div className="app-no-drag absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center">
        <button
          onClick={handleControl.bind(null, "mini")}
          className="rounded-sm p-3 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <IconMini className="dark:fill-gray-100" />
        </button>
        <button
          onClick={handleControl.bind(null, "fullscreen")}
          className="rounded-sm p-3 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <IconMax className="dark:fill-gray-100" />
        </button>
        <button
          onClick={handleControl.bind(null, "close")}
          className="rounded-sm p-3 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <IconClose className="dark:fill-gray-100" />
        </button>
      </div>
    </header>
  );
};

export default TitleBar;
