// import React from "react";

import clsx from "clsx";
// import { hideAll } from "tippy.js";

type MenuItem = {
  text: string;
  clickHandler?: () => void;
  danger?: boolean;
};
type Props = {
  items: MenuItem[];
  hideMenu: () => void;
};

const ContextMenu = ({ items, hideMenu }: Props) => {
  return (
    <ul className="z-20 rounded-xl bg-white p-1 dark:bg-black">
      {items.map((item) => {
        const { text, clickHandler, danger } = item;
        const clickHandlerWrapper = () => {
          clickHandler && clickHandler();
          hideMenu();
        };
        return (
          <li
            onClick={clickHandlerWrapper}
            key={text}
            role="button"
            className={clsx(
              "rounded-md px-2 py-1.5",
              danger
                ? "text-red-700 hover:bg-red-600 hover:text-white"
                : "text-gray-900 hover:bg-gray-100  dark:text-gray-100 dark:hover:bg-gray-900 dark:hover:text-gray-100 "
            )}
          >
            {text}
          </li>
        );
      })}
    </ul>
  );
};

export default ContextMenu;
