// import React from "react";
import IconLogo from "../assets/icon.png";
import pkg from "../../package.json";
// type Props = {}

const About = () => {
  return (
    <section className="flex h-screen w-screen flex-col items-center justify-center gap-2 dark:bg-neutral-800">
      <img className="h-20 w-20" src={IconLogo} alt="vocechat logo" />
      <h1 className="dark:text-neutral-200">About VoceChat Desktop</h1>
      <span className="text-xs text-gray-500">Version: {pkg.version}</span>
    </section>
  );
};

export default About;
