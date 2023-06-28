import { DetailedHTMLProps, FC, InputHTMLAttributes, ReactElement } from "react";
import clsx from "clsx";

interface Props
  extends DetailedHTMLProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      | "placeholder"
      | "className"
      | "type"
      | "autoFocus"
      | "id"
      | "value"
      | "name"
      | "required"
      | "readOnly"
      | "onChange"
      | "onBlur"
      | "pattern"
      | "disabled"
      | "minLength"
      | "spellCheck"
    >,
    HTMLInputElement
  > {
  prefix?: string | ReactElement;
  ref?: any;
}

const Input: FC<Props> = ({ type = "text", prefix = "", className = "", ...rest }) => {
  const isLarge = className.includes("large");
  const isNone = className.includes("none");
  // const noInner=!className.includes("inner");
  const isPwd = type == "password";
  const inputClass = clsx(
    `w-full text-sm text-gray-800 dark:text-gray-200 p-2 outline-none 
    bg-inherit
  disabled:text-gray-500 disabled:bg-gray-100 
  dark:disabled:text-gray-500 
  dark:disabled:bg-gray-800/50
  dark:disabled:border-gray-600 
  placeholder:text-gray-400`,
    // noInner && 'rounded border border-solid border-gray-200 shadow',
    isLarge && "py-3",
    isNone && "!border-none bg-transparent shadow-none",
    isPwd && "pr-[30px]"
  );
  return prefix ? (
    <div
      className={`w-full relative flex overflow-hidden rounded border border-solid border-gray-200 dark:border-gray-400 shadow-sm bg-white dark:bg-gray-800 ${className}`}
    >
      {typeof prefix === "string" ? (
        <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 shadow-[rgb(0_0_0_/_10%)_-1px_0px_0px_inset]">
          {prefix}
        </span>
      ) : (
        <span className="flex-center p-2 bg-transparent">{prefix}</span>
      )}
      <input className={`${inputClass} ${className}`} type={type} {...rest} />
    </div>
  ) : (
    <input
      type={type}
      className={`${inputClass} rounded border border-solid border-gray-200 dark:border-gray-400 shadow-sm ${className}`}
      {...rest}
    />
  );
};

export default Input;
