import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonSize = "mini" | "sm" | "md" | "lg";
type ButtonMode = "primary" | "secondary" | "ghost" | "cancel" | "danger" | "link";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  mode?: ButtonMode;
  size?: ButtonSize;
  widthFull?: boolean;
  children?: ReactNode;
};
const Button = ({
  children,
  mode = "primary",
  size = "md",
  widthFull = false,
  className = "",
  ...rest
}: Props) => {
  const isFull = widthFull;
  const isGhost = mode === "ghost";
  const isCancel = mode === "cancel";
  const isDanger = mode === "danger";
  const isSmall = size === "sm";
  const isMini = size === "mini";
  const noBorder = mode === "link";
  return (
    <button
      className={clsx(
        `text-sm text-white bg-primary-400 break-keep shadow-sm rounded-lg px-3.5 py-2 md:hover:bg-primary-500 active:bg-primary-500 disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:hover:cursor-not-allowed`,
        isFull && "w-full text-center justify-center",
        isGhost &&
          " !text-gray-700 dark:!text-gray-100 !border !border-solid !border-gray-300 dark:!border-gray-500 !bg-transparent",
        isCancel &&
          "!bg-transparent !text-black dark:!text-gray-50 !border !border-solid !border-gray-200",
        isSmall && "!h-auto !py-2",
        noBorder && "!shadow-none !border-none",
        isMini && "!h-auto !px-2.5 !py-1 !text-xs",
        isDanger && "!bg-red-500 disabled:!bg-gray-300 md:hover:!bg-red-500/80 active:bg-red-700",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
export default Button;
