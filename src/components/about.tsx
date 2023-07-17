// import React from "react";
import IconLogo from "../assets/icon.png";
import pkg from "../../package.json";
import { useEffect, useState } from "react";
import { ipcRenderer, shell } from "electron";
import Button from "./base/button";
// type Props = {}

const About = () => {
  const [filePath, setFilePath] = useState("");
  useEffect(() => {
    ipcRenderer.invoke("data-file-path").then((path) => {
      console.log("data-file-path", path);
      setFilePath(path);
    });
  }, []);
  const handleOpen = () => {
    ipcRenderer.send("show-data-file");
  };
  return (
    <section className="flex h-screen w-screen flex-col items-center justify-center gap-2 dark:bg-neutral-800">
      <img className="h-20 w-20" src={IconLogo} alt="vocechat logo" />
      <h1 className="dark:text-neutral-200">About VoceChat Desktop</h1>
      <Button onClick={handleOpen} title={filePath} size="sm">
        Data file
      </Button>
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-xs text-gray-500">Version: {pkg.version}</span>
        <span className="text-xs text-gray-500">
          Source Code:{" "}
          <a
            href="https://github.com/Privoce/vocechat-desktop"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/Privoce/vocechat-desktop
          </a>
        </span>
        <span className="text-xs text-gray-500">© 2023 Privoce Inc. All rights reserved.</span>
      </div>
    </section>
  );
};

export default About;
