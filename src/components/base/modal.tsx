import { FC, ReactNode } from "react";
import clsx from "clsx";

interface Props {
  title?: string;
  description?: string;
  buttons?: ReactNode;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

const Modal: FC<Props> = ({
  compact = false,
  title = "",
  description = "",
  buttons,
  children,
  className
}) => {
  return (
    <div
      className={clsx(
        "rounded-lg bg-white drop-shadow dark:bg-gray-900",
        compact ? "p-4 text-left md:min-w-[406px]" : "p-5 text-center md:min-w-[440px] md:p-8",
        className
      )}
    >
      {title && (
        <h3 className="mb-4 text-xl font-semibold text-gray-600 dark:text-white">{title}</h3>
      )}
      {description && (
        <p className="mb-2 text-sm text-gray-400 dark:text-gray-100">{description}</p>
      )}
      {children}
      {buttons && <div className="flex w-full items-center justify-end gap-4 pt-4">{buttons}</div>}
    </div>
  );
};

export default Modal;
