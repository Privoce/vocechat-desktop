// import React from "react";
import "tippy.js/dist/svg-arrow.css";
import Tippy from "@tippyjs/react";
type Props = {
  content: string;
  children: React.ReactElement;
};

const ServerTip = ({ content, children }: Props) => {
  return (
    <Tippy
      delay={[0, 0]}
      offset={[0, 24]}
      key={content}
      arrow={`<svg width="16" height="6" class="dark:fill-neutral-900 fill-neutral-100" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"></path>
        </svg>`}
      placement="right"
      content={
        <div className="rounded-lg bg-neutral-100 px-4 py-2 text-black  opacity-100 shadow-md drop-shadow-lg dark:bg-neutral-900 dark:text-white">
          {content}
        </div>
      }
    >
      {children}
    </Tippy>
  );
};

export default ServerTip;
