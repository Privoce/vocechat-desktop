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
        `break-keep rounded bg-primary-400 px-4 py-2 text-sm text-white shadow-sm active:bg-primary-500 disabled:bg-gray-300 disabled:hover:cursor-not-allowed disabled:hover:bg-gray-300 md:hover:bg-primary-500`,
        isFull && "w-full justify-center text-center",
        isGhost &&
          " !border !border-solid !border-gray-300 !bg-transparent !text-gray-700 dark:!border-gray-500 dark:!text-gray-100",
        isCancel &&
          "!border !border-solid !border-gray-200 !bg-transparent !text-black dark:!text-gray-50",
        isSmall && "!h-auto !py-2",
        noBorder && "!border-none !shadow-none",
        isMini && "!h-auto !px-2.5 !py-1 !text-xs",
        isDanger && "!bg-red-500 active:bg-red-700 disabled:!bg-gray-300 md:hover:!bg-red-500/80",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
export default Button;
